import { NextResponse } from "next/server";
import {
  classifyPrompt,
  MAX_CLARIFICATION_ROUNDS,
  CATEGORIES,
  type Category,
  type ClassificationResult,
} from "@/lib/classifier";
import { buildPromptForCategory } from "@/lib/templates";
import {
  ImageRefusedError,
  type ImageProvider,
  type ReferenceImage,
} from "@/lib/providers/image-provider";
import { allTexts, buildTextLock, directArt, type TextPlan } from "@/lib/art-director";
import { GeminiNanoBananaProvider } from "@/lib/providers/gemini-nano-banana";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { isAspectRatio } from "@/lib/aspect-ratio";
import { sanitizeBrandDna, socialHandleFromLink } from "@/lib/brand-dna";
import {
  ValidationError,
  validatePrompt,
  validateReferenceImageFile,
  MAX_REFERENCE_IMAGES,
} from "@/lib/validation";

export const runtime = "nodejs";

const provider: ImageProvider = new GeminiNanoBananaProvider();

function normalizeForCompare(text: string): string {
  return text.toLocaleLowerCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

// Evita que el mismo texto (ej. el nombre de la marca) termine dos veces en
// la lista final — el modelo lo dibujaría literalmente dos veces.
function dedupeAgainst(existing: string[], candidates: string[]): string[] {
  const seen = existing.map(normalizeForCompare);
  const result: string[] = [];
  for (const candidate of candidates) {
    const norm = normalizeForCompare(candidate);
    if (seen.some((s) => s.includes(norm) || norm.includes(s))) continue;
    seen.push(norm);
    result.push(candidate);
  }
  return result;
}

// Red de seguridad en código: un póster de evento sin fecha o lugar no sirve,
// así que si el clasificador omitió alguno de sus datos clave, se agrega.
// Y una promoción nunca sale sin ningún texto.
function ensureKeyTexts(classification: ClassificationResult, isPromo: boolean): string[] {
  const texts = [...(classification.textosExactos ?? [])];
  const has = (value: string) =>
    texts.some((t) => normalizeForCompare(t).includes(normalizeForCompare(value)));
  // Solo valores cortos y limpios: nunca volcar un campo "roto" en la imagen.
  const clean = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length <= 80 ? trimmed : undefined;
  };

  if (classification.categoria === "poster_evento") {
    for (const value of [classification.titulo, classification.fecha, classification.hora, classification.lugar]) {
      const safe = clean(value);
      if (safe && !has(safe)) texts.push(safe);
    }
  }
  // Oferta concreta (antes/ahora): ambos precios son texto obligatorio en la
  // imagen, igual que fecha/lugar en un evento.
  if (classification.precioAntes && classification.precioAhora) {
    for (const value of [classification.precioAntes, classification.precioAhora]) {
      const safe = clean(value);
      if (safe && !has(safe)) texts.push(safe);
    }
  }
  const title = clean(classification.titulo);
  if (isPromo && texts.length === 0 && title) texts.push(title);
  return texts;
}

function parseDataUrl(dataUrl: string | undefined): ReferenceImage | undefined {
  const match = dataUrl?.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  return match ? { mimeType: match[1], base64: match[2] } : undefined;
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Demasiadas imágenes generadas en poco tiempo. Intenta de nuevo en ${rateLimit.retryAfterSeconds}s.`,
      },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "La solicitud debe ser multipart/form-data." },
      { status: 400 }
    );
  }

  try {
    const prompt = validatePrompt(formData.get("prompt"));

    const referenceFiles = formData
      .getAll("referenceImage")
      .filter((f): f is File => f instanceof File && f.size > 0);
    if (referenceFiles.length > MAX_REFERENCE_IMAGES) {
      throw new ValidationError(`Puedes adjuntar hasta ${MAX_REFERENCE_IMAGES} imágenes de referencia.`);
    }
    const referenceImages: ReferenceImage[] = [];
    for (const file of referenceFiles) {
      validateReferenceImageFile(file);
      const bytes = await file.arrayBuffer();
      referenceImages.push({ base64: Buffer.from(bytes).toString("base64"), mimeType: file.type });
    }

    const round = Number(formData.get("clarificationRound") ?? 0);

    const rawCategoryHint = formData.get("categoryHint");
    const categoryHint =
      typeof rawCategoryHint === "string" &&
      (CATEGORIES as readonly string[]).includes(rawCategoryHint)
        ? (rawCategoryHint as Category)
        : undefined;

    const rawAspectRatio = formData.get("aspectRatio");
    const aspectRatio = isAspectRatio(rawAspectRatio) ? rawAspectRatio : "1:1";

    // Edición de una imagen ya generada (ver ImageEditPanel en el cliente):
    // la imagen de referencia es la versión anterior de este mismo diseño,
    // no un producto/persona que deba quedar idéntico.
    const isEdit = formData.get("editMode") === "1";

    const rawBrandDna = formData.get("brandDna");
    let brandDna;
    if (typeof rawBrandDna === "string" && rawBrandDna) {
      try {
        brandDna = sanitizeBrandDna(JSON.parse(rawBrandDna));
      } catch {
        brandDna = undefined;
      }
    }

    const canAskQuestions = round < MAX_CLARIFICATION_ROUNDS;
    const classification = await classifyPrompt(prompt, {
      categoryHint,
      allowQuestions: canAskQuestions,
      referenceImages,
      brandContext: brandDna
        ? {
            brandName: brandDna.name,
            hasContact: Boolean(brandDna.contactPhone || brandDna.contactWebsite || brandDna.contactAddress),
            hasLogo: Boolean(brandDna.logoImage),
          }
        : undefined,
    });

    if (classification.necesitaAclaracion && classification.preguntas?.length && canAskQuestions) {
      return NextResponse.json({
        needsClarification: true,
        category: classification.categoria,
        questions: classification.preguntas,
      });
    }

    const isPortrait = classification.categoria === "retrato_avatar";
    const showBrand = Boolean(brandDna && classification.incluirMarca && !isPortrait);
    const showContact = Boolean(brandDna && classification.incluirContacto && !isPortrait);

    // El logo real del ADN se manda como imagen adicional (Nano Banana acepta
    // varias), en vez de solo "dejar espacio" — nunca en retratos.
    const logoImage = showBrand ? parseDataUrl(brandDna?.logoImage) : undefined;

    // Todo el texto permitido en la imagen, por rol. El @ de redes sale solo
    // del link real del ADN — sin ADN nunca aparece uno inventado.
    const contactText = [brandDna?.contactPhone, brandDna?.contactWebsite, brandDna?.contactAddress]
      .filter(Boolean)
      .join(" · ");
    const socialHandle = showBrand ? socialHandleFromLink(brandDna?.socialLink) : undefined;
    const isPromo = classification.categoria === "poster_evento" || classification.categoria === "post_redes";

    // El clasificador a veces ya teje el nombre de la marca dentro del
    // titular (ej. "que se note que es de nuestra academia") — sin este
    // filtro, el pie lo volvía a agregar y el modelo lo dibujaba dos veces.
    const main = isPortrait ? [] : ensureKeyTexts(classification, isPromo);
    const bullets = dedupeAgainst(main, isPromo ? classification.beneficios ?? [] : []);
    const footer = dedupeAgainst(
      [...main, ...bullets],
      [
        ...(showBrand && !logoImage && brandDna?.name ? [brandDna.name] : []),
        ...(socialHandle ? [socialHandle] : []),
        ...(showContact && contactText ? [contactText] : []),
      ]
    );
    const textPlan: TextPlan = { main, bullets, footer };
    const allowedTexts = allTexts(textPlan);

    const guidelines = buildPromptForCategory(classification.categoria, {
      userPrompt: prompt,
      classification: { ...classification, textosExactos: textPlan.main },
      hasReferenceImage: referenceImages.length > 0,
      referenceCount: referenceImages.length,
      logoAttached: Boolean(logoImage),
      aspectRatio,
      brandDna,
      isEdit,
      modoVisual: classification.modoVisual,
    });

    const direction = await directArt(
      guidelines,
      textPlan,
      classification.categoria,
      referenceImages.length > 0,
      classification.modoVisual ?? "fotografia"
    );
    const finalPrompt =
      direction.prompt +
      buildTextLock(allowedTexts, referenceImages.length > 0 && !isPortrait, Boolean(logoImage));

    console.info(`[director de arte] categoría=${classification.categoria} receta=${direction.style ?? "plantilla"}`);
    if (process.env.NODE_ENV !== "production") {
      console.info(`[pautas de plantilla · ${classification.categoria}]\n${guidelines}`);
      console.info(`[prompt final]\n${finalPrompt}`);
    }

    // Solo en desarrollo: revisar el razonamiento sin pagar una imagen.
    if (process.env.NODE_ENV !== "production" && formData.get("dryRun") === "1") {
      return NextResponse.json({
        dryRun: true,
        classification,
        style: direction.style,
        textPlan,
        logoAttached: Boolean(logoImage),
        finalPrompt,
      });
    }

    const images = logoImage ? [...referenceImages, logoImage] : referenceImages;

    // La proporción se asegura en el navegador (lib/image-client.ts), porque
    // Workers no puede usar librerías nativas de imagen como sharp.
    const result = await provider.generate(finalPrompt, images, aspectRatio);

    return NextResponse.json({
      image: `data:${result.mimeType};base64,${result.base64}`,
      category: classification.categoria,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ImageRefusedError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    console.error("Error generando imagen:", error);
    return NextResponse.json(
      { error: "No se pudo generar la imagen. Intenta de nuevo en unos segundos." },
      { status: 500 }
    );
  }
}
