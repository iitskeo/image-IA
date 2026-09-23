import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { withRetry } from "./retry";

// Modo automático del ADN de marca: en vez de preguntar más cosas al
// usuario, usamos la misma IA para inferir público objetivo y notas de
// estilo a partir de lo poco que ya sabemos (qué hace la marca, tono,
// colores) — y, si subió imágenes, las analiza de verdad (modelo
// multimodal) en vez de usarlas solo para extraer colores por pixeles.
const MODEL_NAME = process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite";

export interface BrandDnaInferenceImage {
  base64: string;
  mimeType: string;
}

export interface BrandDnaInferenceInput {
  whatTheyDo?: string;
  tone?: string;
  colors: string[];
  images?: BrandDnaInferenceImage[];
}

export interface BrandDnaInferenceResult {
  audience?: string;
  styleNotes?: string;
  typography?: string;
}

const SYSTEM_INSTRUCTION = `Eres un asistente de branding. A partir de información breve sobre una marca (a qué se dedica, tono, colores) y, si se incluyen, imágenes reales de la marca (capturas de redes, logo, fotos de producto), infiere con criterio profesional:
- audience: el público objetivo más probable (una frase breve).
- styleNotes: qué buscar o evitar visualmente en el diseño para esta marca (1-2 frases breves).
- typography: SOLO si en las imágenes se ve tipografía de la marca (logo, titulares de sus posts): describe su estilo tipográfico y la fuente conocida más parecida, en una frase corta (ej. "Sans-serif geométrica en negrita, estilo Montserrat Bold"). Si no se ve tipografía de marca en las imágenes, cadena vacía.

Si se incluyen imágenes, obsérvalas con atención real (estilo fotográfico, tipografía, composición, paleta, nivel de formalidad, calidad de producción) y deja que eso informe tu respuesta — no te limites a los colores dominantes, esa parte ya se calculó aparte. Si la información es insuficiente para inferir algo con confianza razonable, deja ese campo como cadena vacía en vez de inventar algo genérico sin sentido.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    audience: { type: Type.STRING, description: "Público objetivo probable, o vacío si no se puede inferir." },
    styleNotes: {
      type: Type.STRING,
      description: "Notas de estilo visual (qué buscar/evitar), o vacío si no se puede inferir.",
    },
    typography: {
      type: Type.STRING,
      description: "Estilo tipográfico visto en las imágenes de la marca + fuente conocida más parecida, o vacío.",
    },
  },
  required: ["audience", "styleNotes", "typography"],
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Falta la variable de entorno GOOGLE_API_KEY.");
  return new GoogleGenAI({ apiKey });
}

export async function inferBrandDnaFields(
  input: BrandDnaInferenceInput
): Promise<BrandDnaInferenceResult> {
  const images = input.images ?? [];

  if (!input.whatTheyDo && !input.tone && input.colors.length === 0 && images.length === 0) {
    return {};
  }

  const lines = [
    input.whatTheyDo && `Qué hace/vende la marca: ${input.whatTheyDo}`,
    input.tone && `Tono de la marca: ${input.tone}`,
    input.colors.length > 0 && `Colores de marca detectados (ya calculados por separado): ${input.colors.join(", ")}`,
    images.length > 0 && `Se incluyen ${images.length} imagen(es) real(es) de la marca a continuación — analízalas.`,
  ].filter(Boolean);

  try {
    const ai = getClient();
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: "user",
            parts: [
              { text: lines.join("\n") },
              ...images.map((img) => ({
                inlineData: { data: img.base64, mimeType: img.mimeType },
              })),
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          // Las imágenes tardan más en procesarse que solo texto.
          abortSignal: AbortSignal.timeout(images.length > 0 ? 30_000 : 15_000),
        },
      })
    );

    const raw = response.text;
    if (!raw) return {};

    const parsed = JSON.parse(raw) as BrandDnaInferenceResult;
    return {
      audience: parsed.audience?.trim() || undefined,
      styleNotes: parsed.styleNotes?.trim() || undefined,
      typography: parsed.typography?.trim() || undefined,
    };
  } catch {
    // Blindaje: si la inferencia falla, simplemente no se completan esos
    // campos — nunca debe bloquear el guardado del ADN de marca.
    return {};
  }
}
