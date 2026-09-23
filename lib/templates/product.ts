import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  formatAspectRatio,
  formatBrandDna,
  formatDetails,
} from "./shared";

export function buildProductPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { titulo, estilo, resumen } = classification;

  const details = formatDetails([
    ["Producto/marca", titulo],
    ["Estilo pedido por el usuario", estilo],
  ]);

  return `Create a high-end e-commerce / product photography style image.

Brief from the user (source of truth for content): "${userPrompt}"${details}
Summary: ${resumen}

Design requirements:
- Studio-quality lighting with realistic soft shadows and reflections appropriate to the surface.
- Clean, uncluttered background that makes the product the clear focal point.
- Accurate materials and proportions — the product should look physically real, not rendered or plastic-looking.
- Composition typical of premium product photography (centered or rule-of-thirds framing, consistent with the requested style).
- Do NOT add any text, caption or words to the image unless the brief explicitly describes packaging text/labels as part of the product itself, or the Brand DNA section below explicitly asks for contact info.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? "- Use the attached reference image as the exact product/packaging to depict — preserve its real shape, colors, labels and proportions faithfully, only changing the scene/background/lighting as requested." : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeLogo: classification.incluirLogo,
  })}`;
}
