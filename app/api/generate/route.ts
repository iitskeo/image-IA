import { NextResponse } from "next/server";
import { classifyPrompt, MAX_CLARIFICATION_ROUNDS, CATEGORIES, type Category } from "@/lib/classifier";
import { buildPromptForCategory } from "@/lib/templates";
import {
  ImageRefusedError,
  type ImageProvider,
  type ReferenceImage,
} from "@/lib/providers/image-provider";
import { buildTextLock, directArt } from "@/lib/art-director";
import { GeminiNanoBananaProvider } from "@/lib/providers/gemini-nano-banana";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { isAspectRatio } from "@/lib/aspect-ratio";
import { sanitizeBrandDna } from "@/lib/brand-dna";
import {
  ValidationError,
  validatePrompt,
  validateReferenceImageFile,
} from "@/lib/validation";

export const runtime = "nodejs";

const provider: ImageProvider = new GeminiNanoBananaProvider();

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

    const referenceFile = formData.get("referenceImage");
    let referenceImage: { base64: string; mimeType: string } | undefined;

    if (referenceFile instanceof File && referenceFile.size > 0) {
      validateReferenceImageFile(referenceFile);
      const bytes = await referenceFile.arrayBuffer();
      referenceImage = {
        base64: Buffer.from(bytes).toString("base64"),
        mimeType: referenceFile.type,
      };
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
      referenceImage,
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

    // Todo el texto permitido en la imagen, para el candado de texto final.
    const contactText = [brandDna?.contactPhone, brandDna?.contactWebsite, brandDna?.contactAddress]
      .filter(Boolean)
      .join(" · ");
    const allowedTexts = [
      ...(isPortrait ? [] : classification.textosExactos ?? []),
      ...(showBrand && !logoImage && brandDna?.name ? [brandDna.name] : []),
      ...(showContact && contactText ? [contactText] : []),
    ];

    const guidelines = buildPromptForCategory(classification.categoria, {
      userPrompt: prompt,
      classification,
      hasReferenceImage: Boolean(referenceImage),
      logoAttached: Boolean(logoImage),
      aspectRatio,
      brandDna,
    });

    const finalPrompt =
      (await directArt(guidelines, allowedTexts)) +
      buildTextLock(allowedTexts, Boolean(referenceImage), Boolean(logoImage));

    if (process.env.NODE_ENV !== "production") {
      console.info(`[pautas de plantilla · ${classification.categoria}]\n${guidelines}`);
      console.info(`[prompt del director de arte]\n${finalPrompt}`);
    }

    // Solo en desarrollo: revisar el razonamiento sin pagar una imagen.
    if (process.env.NODE_ENV !== "production" && formData.get("dryRun") === "1") {
      return NextResponse.json({ dryRun: true, classification, logoAttached: Boolean(logoImage), finalPrompt });
    }

    const images = [referenceImage, logoImage].filter((img): img is ReferenceImage => Boolean(img));

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
