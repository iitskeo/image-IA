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
  formatPricePromo,
  ILLUSTRATION_REFERENCE_FIDELITY,
  REFERENCE_FIDELITY,
} from "./shared";

export function buildSocialPostPrompt({
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
  const { titulo, estilo, resumen, textosExactos } = classification;

  const details = formatDetails([
    ["Mensaje/título principal", titulo],
    ["Estilo pedido por el usuario", estilo],
  ]);

  return `Design a scroll-stopping social media graphic.

Brief from the user (source of truth for content): "${userPrompt}"${details}${formatExactTexts(textosExactos)}
Summary: ${resumen}${formatAttachments(referenceCount, logoAttached)}

Design requirements:
- One clear focal point — don't cram multiple competing messages into the frame.
- Only add text to the image from the "Exact on-image text" above (or "Mensaje/título principal" if that list is absent), plus the brand name/contact only if the Brand DNA section below asks for it — never render any other sentence, instruction or commentary from the brief as text. Keep it short, fully legible and spelled exactly as given, using bold contemporary typography.
- Modern, on-trend color palette that feels intentional and brand-consistent, not default AI pastel gradients.
- Composition should feel like it was art-directed for social media (rule-of-thirds, negative space used purposefully), not a centered stock illustration.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? (isEdit ? `- The reference image is the previous version of this design — apply the requested change to it.\n${EDIT_FIDELITY}` : `- Feature the subject/product from the user's reference image as the hero of the design.\n${modoVisual === "ilustracion" ? ILLUSTRATION_REFERENCE_FIDELITY : REFERENCE_FIDELITY}`) : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${modoVisual === "ilustracion" ? ANTI_AI_ILLUSTRATION_LOOK : ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeBrand: classification.incluirMarca,
    logoAttached,
  })}${formatPricePromo(classification.precioAntes, classification.precioAhora)}`;
}
