import { NextResponse } from "next/server";
import { classifyPrompt, MAX_CLARIFICATION_ROUNDS, CATEGORIES, type Category } from "@/lib/classifier";
import { buildPromptForCategory } from "@/lib/templates";
import type { ImageProvider } from "@/lib/providers/image-provider";
import { GeminiNanoBananaProvider } from "@/lib/providers/gemini-nano-banana";
import { PollinationsProvider } from "@/lib/providers/pollinations";
import { HuggingFaceProvider } from "@/lib/providers/huggingface";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { isAspectRatio } from "@/lib/aspect-ratio";
import { sanitizeBrandDna } from "@/lib/brand-dna";
import {
  ValidationError,
  validatePrompt,
  validateReferenceImageFile,
} from "@/lib/validation";

export const runtime = "nodejs";

// IMAGE_PROVIDER: "pollinations" (default, gratis) | "huggingface" (gratis,
// requiere HF_TOKEN) | "gemini" (Nano Banana, requiere facturación activa).
// El resto de la app no necesita ningún otro cambio al cambiar de proveedor.
function createProvider(): ImageProvider {
  switch (process.env.IMAGE_PROVIDER) {
    case "gemini":
      return new GeminiNanoBananaProvider();
    case "huggingface":
      return new HuggingFaceProvider();
    default:
      return new PollinationsProvider();
  }
}

const provider = createProvider();

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
      brandContext: brandDna
        ? {
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

    const compiledPrompt = buildPromptForCategory(classification.categoria, {
      userPrompt: prompt,
      classification,
      hasReferenceImage: Boolean(referenceImage),
      aspectRatio,
      brandDna,
    });

    if (process.env.NODE_ENV !== "production") {
      console.info(`[prompt compilado · ${classification.categoria}]\n${compiledPrompt}`);
    }

    // La proporción se asegura en el navegador (lib/image-client.ts), porque
    // Workers no puede usar librerías nativas de imagen como sharp.
    const result = await provider.generate(compiledPrompt, referenceImage, aspectRatio);

    return NextResponse.json({
      image: `data:${result.mimeType};base64,${result.base64}`,
      category: classification.categoria,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error generando imagen:", error);
    return NextResponse.json(
      { error: "No se pudo generar la imagen. Intenta de nuevo en unos segundos." },
      { status: 500 }
    );
  }
}
