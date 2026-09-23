import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  formatAspectRatio,
  formatAttachments,
  formatBrandDna,
  formatDetails,
  formatExactTexts,
  REFERENCE_FIDELITY,
} from "./shared";

export function buildProductPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  referenceCount,
  logoAttached,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { titulo, estilo, resumen, textosExactos } = classification;

  const details = formatDetails([
    ["Producto/marca", titulo],
    ["Estilo pedido por el usuario", estilo],
  ]);

  return `Create a high-end e-commerce / product photography style image.

Brief from the user (source of truth for content): "${userPrompt}"${details}${formatExactTexts(textosExactos)}
Summary: ${resumen}${formatAttachments(referenceCount, logoAttached)}

Design requirements:
- Studio-quality lighting with realistic soft shadows and reflections appropriate to the surface.
- Clean, uncluttered background that makes the product the clear focal point.
- Accurate materials and proportions — the product should look physically real, not rendered or plastic-looking.
- Composition typical of premium product photography (centered or rule-of-thirds framing, consistent with the requested style).
- Do NOT add any text, caption or words to the image unless listed in "Exact on-image text" above, the brief explicitly describes packaging text/labels as part of the product itself, or the Brand DNA section below explicitly asks for it.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? `- Only the scene, background and lighting change — the product itself comes from the user's reference image.\n${REFERENCE_FIDELITY}` : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeBrand: classification.incluirMarca,
    logoAttached,
  })}`;
}
