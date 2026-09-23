import { GoogleGenAI } from "@google/genai";
import type { ImageProvider, ReferenceImage } from "./image-provider";
import { PROVIDER_TIMEOUT_MS } from "./image-provider";
import type { AspectRatio } from "../aspect-ratio";
import { withRetry } from "../retry";

// "Nano Banana 2 Lite" es la versión ligera/gratuita más reciente del
// modelo de imagen de Gemini. El id del modelo puede cambiar con el tiempo;
// se puede sobreescribir con la variable de entorno GEMINI_IMAGE_MODEL sin
// tocar código.
const MODEL_NAME = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la variable de entorno GOOGLE_API_KEY. Consigue una key gratuita en https://aistudio.google.com y agrégala a tu .env.local."
    );
  }
  return new GoogleGenAI({ apiKey });
}

export class GeminiNanoBananaProvider implements ImageProvider {
  async generate(prompt: string, referenceImage?: ReferenceImage, aspectRatio: AspectRatio = "1:1") {
    const ai = getClient();

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];

    if (referenceImage) {
      parts.push({
        inlineData: {
          mimeType: referenceImage.mimeType,
          data: referenceImage.base64,
        },
      });
    }

    let response;
    try {
      // Reintenta ante cuota momentánea (429) o servidor ocupado (503); un
      // solo reintento porque la generación de imagen ya es la parte lenta.
      response = await withRetry(
        () =>
          ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: "user", parts }],
            config: {
              abortSignal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
              imageConfig: { aspectRatio },
            },
          }),
        { maxAttempts: 2 }
      );
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
        throw new Error("Nano Banana tardó demasiado en responder. Intenta de nuevo.");
      }
      throw err;
    }

    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      const textPart = candidate?.content?.parts?.find((p) => p.text)?.text;
      throw new Error(
        textPart
          ? `El modelo no devolvió una imagen: ${textPart}`
          : "El modelo no devolvió ninguna imagen. Intenta reformular el pedido."
      );
    }

    return {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    };
  }
}
