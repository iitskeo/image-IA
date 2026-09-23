import type { ImageProvider, ReferenceImage } from "./image-provider";
import { PROVIDER_TIMEOUT_MS } from "./image-provider";
import { ValidationError } from "../validation";
import { ASPECT_RATIO_DIMENSIONS, type AspectRatio } from "../aspect-ratio";
import { HttpStatusError, withRetry } from "../retry";

// Pollinations.ai: generación de imágenes 100% gratis y sin API key, para
// poder probar la app mientras se decide si activar facturación en Google
// para usar Nano Banana. La calidad de texto dentro de la imagen es inferior
// a Nano Banana — pensado como fallback temporal, no como proveedor final.
const BASE_URL = "https://image.pollinations.ai/prompt";
const MODEL = process.env.POLLINATIONS_MODEL || "flux";

async function fetchOnce(url: string): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });

  if (!response.ok) {
    throw new HttpStatusError(`Pollinations respondió con error (${response.status}).`, response.status);
  }

  const mimeType = response.headers.get("content-type") || "";
  if (!mimeType.startsWith("image/")) {
    throw new Error("Pollinations no devolvió una imagen válida. Intenta de nuevo.");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error("Pollinations devolvió una imagen vacía. Intenta de nuevo.");
  }

  return { buffer, mimeType };
}

export class PollinationsProvider implements ImageProvider {
  async generate(prompt: string, referenceImage?: ReferenceImage, aspectRatio: AspectRatio = "1:1") {
    if (referenceImage) {
      throw new ValidationError(
        "El proveedor gratuito actual (Pollinations) todavía no soporta imagen de referencia. Quita la imagen adjunta, o activa facturación en Google AI Studio para usar Nano Banana."
      );
    }

    const { width, height } = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const seed = Math.floor(Math.random() * 1_000_000);
    const url = `${BASE_URL}/${encodeURIComponent(prompt)}?model=${MODEL}&width=${width}&height=${height}&nologo=true&seed=${seed}`;

    let result: { buffer: ArrayBuffer; mimeType: string };
    try {
      // Reintenta ante 429/5xx en silencio antes de rendirse.
      result = await withRetry(() => fetchOnce(url), { maxAttempts: 2 });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new Error("Pollinations tardó demasiado en responder. Intenta de nuevo.");
      }
      if (err instanceof HttpStatusError || err instanceof Error) {
        throw err;
      }
      throw new Error("No se pudo conectar con Pollinations. Intenta de nuevo en unos segundos.");
    }

    return {
      base64: Buffer.from(result.buffer).toString("base64"),
      mimeType: result.mimeType,
    };
  }
}
