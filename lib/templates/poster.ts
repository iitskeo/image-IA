import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  formatAspectRatio,
  formatBrandDna,
  formatDetails,
} from "./shared";

export function buildPosterPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { titulo, fecha, hora, lugar, estilo, resumen } = classification;

  const details = formatDetails([
    ["Título/tema principal", titulo],
    ["Fecha", fecha],
    ["Hora", hora],
    ["Lugar", lugar],
    ["Estilo pedido por el usuario", estilo],
  ]);

  return `Design a high-quality, print-ready event poster/flyer.

Brief from the user (source of truth for content): "${userPrompt}"${details}
Summary: ${resumen}

Design requirements:
- Clear visual hierarchy: headline/event title largest and most prominent, then date/time/place clearly legible as secondary text, in that order of importance.
- The ONLY text that should appear on the poster is the title/theme, date, time and place listed in "Extracted details" above (whichever are present), plus brand contact info only if the Brand DNA section below asks for it — spelled EXACTLY as given, in the same language as the brief, fully legible, no garbled or misspelled letters. Do not render any other sentence, instruction or commentary from the brief as text.
- Professional editorial/graphic-design typography (not a generic default sans-serif) with strong contrast against the background so every word is readable.
- Coherent color palette and composition matching the event's tone${estilo ? ` (${estilo})` : ""}.
- Balanced layout with intentional margins and breathing room, not cluttered or centered by default — use an asymmetric, designed composition.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? "- Use the attached reference image as the visual/style/brand basis and integrate it naturally into the poster." : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeLogo: classification.incluirLogo,
  })}`;
}
