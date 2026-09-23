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

export function buildGeneralPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  logoAttached,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { estilo, resumen, textosExactos } = classification;

  const details = formatDetails([["Estilo pedido por el usuario", estilo]]);

  return `Create a high-quality, professional image based on this brief.

Brief from the user (source of truth for content): "${userPrompt}"${details}${formatExactTexts(textosExactos)}
Summary: ${resumen}${formatAttachments(hasReferenceImage, logoAttached)}

Design requirements:
- Thoughtful composition with a clear focal point and purposeful use of space.
- Realistic textures, materials and lighting appropriate to the subject.
- Do NOT add any text, caption or words to the image unless listed in "Exact on-image text" above, the brief explicitly describes a sign/label as part of the scene, or the Brand DNA section below explicitly asks for it — if so, spell it EXACTLY as given and fully legible.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? `- Use the user's reference image as the basis, applying only the requested changes.\n${REFERENCE_FIDELITY}` : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeBrand: classification.incluirMarca,
    logoAttached,
  })}`;
}
