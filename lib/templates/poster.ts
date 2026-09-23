import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  EDIT_FIDELITY,
  formatAspectRatio,
  formatAttachments,
  formatBrandDna,
  formatDetails,
  formatExactTexts,
  REFERENCE_FIDELITY,
} from "./shared";

export function buildPosterPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  referenceCount,
  logoAttached,
  aspectRatio,
  brandDna,
  isEdit,
}: TemplateInput): string {
  const { titulo, fecha, hora, lugar, estilo, resumen, textosExactos } = classification;

  const details = formatDetails([
    ["Título/tema principal", titulo],
    ["Fecha", fecha],
    ["Hora", hora],
    ["Lugar", lugar],
    ["Estilo pedido por el usuario", estilo],
  ]);

  return `Design a high-quality, print-ready promotional poster/flyer.

Brief from the user (source of truth for content): "${userPrompt}"${details}${formatExactTexts(textosExactos)}
Summary: ${resumen}${formatAttachments(referenceCount, logoAttached)}

Design requirements:
- Clear visual hierarchy: the main headline largest and most prominent, then the key info (date/time/place, or price/offer) clearly legible as secondary text.
- The ONLY text on the poster is the "Exact on-image text" above (or, if absent, the title/date/time/place from "Extracted details"), plus the brand name/contact only if the Brand DNA section below asks for it — spelled EXACTLY as given, same language and accents, fully legible, no garbled or misspelled letters. Keep the total amount of text minimal.
- Professional editorial/graphic-design typography (not a generic default sans-serif) with strong contrast against the background so every word is readable.
- Coherent color palette and composition matching the tone${estilo ? ` (${estilo})` : ""}.
- Balanced layout with intentional margins and breathing room, never cluttered — a deliberately designed composition (symmetric or asymmetric as the concept demands), with text never overlapping the hero.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? (isEdit ? `- The reference image is the previous version of this poster — apply the requested change to it.\n${EDIT_FIDELITY}` : `- Feature the subject/product from the user's reference image as the hero of the poster.\n${REFERENCE_FIDELITY}`) : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeBrand: classification.incluirMarca,
    logoAttached,
  })}`;
}
