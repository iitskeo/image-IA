import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  formatAspectRatio,
  formatBrandDna,
  formatDetails,
} from "./shared";

export function buildGeneralPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { estilo, resumen } = classification;

  const details = formatDetails([["Estilo pedido por el usuario", estilo]]);

  return `Create a high-quality, professional image based on this brief.

Brief from the user (source of truth for content): "${userPrompt}"${details}
Summary: ${resumen}

Design requirements:
- Thoughtful composition with a clear focal point and purposeful use of space.
- Realistic textures, materials and lighting appropriate to the subject.
- Do NOT add any text, caption or words to the image unless the brief explicitly describes a sign, label or written text as part of the scene, or the Brand DNA section below explicitly asks for contact info — if so, spell it EXACTLY as intended and fully legible.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? "- Use the attached reference image as the basis, preserving its key subject/identity while applying the requested changes." : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeLogo: classification.incluirLogo,
  })}`;
}
