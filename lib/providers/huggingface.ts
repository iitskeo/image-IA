import { InferenceClient } from "@huggingface/inference";
import type { ImageProvider, ReferenceImage } from "./image-provider";
import { PROVIDER_TIMEOUT_MS } from "./image-provider";
import { ValidationError } from "../validation";
import { ASPECT_RATIO_DIMENSIONS, type AspectRatio } from "../aspect-ratio";
import { withRetry } from "../retry";

// FLUX.1-schnell: modelo abierto (Apache 2.0) con inferencia gratuita vía el
// free tier de Hugging Face Inference Providers. Misma familia de modelo que
// Pollinations, así que comparte su debilidad renderizando texto legible.
const MODEL_NAME = process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";

function getClient(): InferenceClient {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      "Falta la variable de entorno HF_TOKEN. Consigue un token gratis en https://huggingface.co/settings/tokens (permiso 'Make calls to Inference Providers') y agrégalo a tu .env.local."
    );
  }
  return new InferenceClient(token);
}

export class HuggingFaceProvider implements ImageProvider {
  async generate(prompt: string, referenceImage?: ReferenceImage, aspectRatio: AspectRatio = "1:1") {
    if (referenceImage) {
      throw new ValidationError(
        "El proveedor gratuito actual (Hugging Face) todavía no soporta imagen de referencia. Quita la imagen adjunta, o activa facturación en Google AI Studio para usar Nano Banana."
      );
    }

    const client = getClient();
    const { width, height } = ASPECT_RATIO_DIMENSIONS[aspectRatio];

    let blob: Blob;
    try {
      // Reintenta ante 429/5xx en silencio antes de rendirse.
      blob = await withRetry(
        () =>
          client.textToImage(
            { model: MODEL_NAME, inputs: prompt, parameters: { width, height } },
            { outputType: "blob", signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) }
          ),
        { maxAttempts: 2 }
      );
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
        throw new Error("Hugging Face tardó demasiado en responder. Intenta de nuevo.");
      }
      throw err;
    }

    if (!blob || blob.size === 0) {
      throw new Error("Hugging Face devolvió una imagen vacía. Intenta de nuevo.");
    }

    const arrayBuffer = await blob.arrayBuffer();

    return {
      base64: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: blob.type || "image/png",
    };
  }
}
