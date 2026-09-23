import { GoogleGenAI } from "@google/genai";
import type { ImageProvider, ReferenceImage } from "./image-provider";
import { ImageRefusedError, PROVIDER_TIMEOUT_MS } from "./image-provider";
import type { AspectRatio } from "../aspect-ratio";
import { withRetry } from "../retry";

// Nano Banana 2 (~$0.067 por imagen 1K). Se cambia con GEMINI_IMAGE_MODEL
// sin tocar código: "gemini-3.1-flash-lite-image" (Lite, ~$0.034) o
// "gemini-3-pro-image" (Pro, ~$0.134).
const MODEL_NAME = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Falta la variable de entorno GOOGLE_API_KEY.");
  return new GoogleGenAI({ apiKey });
}

export class GeminiNanoBananaProvider implements ImageProvider {
  async generate(prompt: string, images: ReferenceImage[], aspectRatio: AspectRatio = "1:1") {
    const ai = getClient();

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [
      { text: prompt },
      ...images.map((image) => ({ inlineData: { mimeType: image.mimeType, data: image.base64 } })),
    ];

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
      console.error("Nano Banana no devolvió imagen:", {
        finishReason: candidate?.finishReason,
        blockReason: response.promptFeedback?.blockReason,
        text: textPart?.slice(0, 300),
      });
      throw new ImageRefusedError(
        "El modelo no pudo generar esta imagen con ese pedido o esa imagen de referencia. Prueba reformularlo o usar otra referencia."
      );
    }

    return {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    };
  }
}
