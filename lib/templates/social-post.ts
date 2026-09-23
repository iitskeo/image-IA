import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  formatAspectRatio,
  formatBrandDna,
  formatDetails,
} from "./shared";

export function buildSocialPostPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { titulo, estilo, resumen } = classification;

  const details = formatDetails([
    ["Mensaje/título principal", titulo],
    ["Estilo pedido por el usuario", estilo],
  ]);

  return `Design a scroll-stopping social media graphic.

Brief from the user (source of truth for content): "${userPrompt}"${details}
Summary: ${resumen}

Design requirements:
- One clear focal point — don't cram multiple competing messages into the frame.
- Only add text/caption to the image if "Mensaje/título principal" is present above or the brief clearly describes a specific caption to show (plus brand contact info only if the Brand DNA section below asks for it) — never render any other sentence, instruction or commentary from the brief as text. If text is added, keep it short, fully legible and spelled exactly as intended, using bold contemporary typography.
- Modern, on-trend color palette that feels intentional and brand-consistent, not default AI pastel gradients.
- Composition should feel like it was art-directed for social media (rule-of-thirds, negative space used purposefully), not a centered stock illustration.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? "- Use the attached reference image as the subject/brand basis and integrate it naturally into the design." : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna, {
    includeContact: classification.incluirContacto,
    includeLogo: classification.incluirLogo,
  })}`;
}
