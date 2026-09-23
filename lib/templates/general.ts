import type { TemplateInput } from "./types";
import {
  ANTI_AI_ILLUSTRATION_LOOK,
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  EDIT_FIDELITY,
  formatAspectRatio,
  formatAttachments,
  formatBrandDna,
  formatDetails,
  formatExactTexts,
  ILLUSTRATION_REFERENCE_FIDELITY,
  REFERENCE_FIDELITY,
} from "./shared";

export function buildGeneralPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  referenceCount,
  logoAttached,
  aspectRatio,
  brandDna,
  isEdit,
  modoVisual,
}: TemplateInput): string {
  const { estilo, resumen, textosExactos } = classification;

  const details = formatDetails([["Estilo pedido por el usuario", estilo]]);

  return `Create a high-quality, professional image based on this brief.

Brief from the user (source of truth for content): "${userPrompt}"${details}${formatExactTexts(textosExactos)}
Summary: ${resumen}${formatAttachments(referenceCount, logoAttached)}

Design requirements:
- Thoughtful composition with a clear focal point and purposeful use of space.
- Realistic textures, materials and lighting appropriate to the subject.
- Do NOT add any text, caption or words to the image unless listed in "Exact on-image text" above, the brief explicitly describes a sign/label as part of the scene, or the Brand DNA section below explicitly asks for it — if so, spell it EXACTLY as given and fully legible.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? (isEdit ? `- The reference image is the previous version of this image — apply the requested change to it.\n${EDIT_FIDELITY}` : `- Use the user's reference image as the basis, applying only the requested changes.\n${modoVisual === "ilustracion" ? ILLUSTRATION_REFERENCE_FIDELITY : REFERENCE_FIDELITY}`) : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${modoVisual === "ilustracion" ? ANTI_AI_ILLUSTRATION_LOOK : ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeBrand: classification.incluirMarca,
    logoAttached,
  })}`;
}
