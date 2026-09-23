import type { TemplateInput } from "./types";
import {
  ANTI_AI_LOOK,
  BRIEF_IS_DESCRIPTION_ONLY,
  formatAspectRatio,
  formatBrandDna,
  formatDetails,
} from "./shared";

export function buildPortraitPrompt({
  userPrompt,
  classification,
  hasReferenceImage,
  aspectRatio,
  brandDna,
}: TemplateInput): string {
  const { estilo, resumen } = classification;

  const details = formatDetails([["Estilo pedido por el usuario", estilo]]);

  return `Create a natural, high-quality portrait/avatar image.

Brief from the user (source of truth for content): "${userPrompt}"${details}
Summary: ${resumen}

Design requirements:
- Realistic skin texture (pores, subtle imperfections, natural tone variation) — never smoothed into a plastic/waxy look.
- Natural, asymmetric facial features and expression — avoid an artificially "perfect" or generic symmetrical face.
- Lighting and background appropriate to the requested style (e.g. natural window light for a casual portrait, controlled studio light for a professional headshot).
- Do NOT add any text, caption or words to the image — this is a portrait, not a graphic design piece.
${formatAspectRatio(aspectRatio)}
${hasReferenceImage ? "- Use the attached reference image as the actual person/character to depict — preserve their real facial identity, features and proportions faithfully, only changing style, setting or lighting as requested." : ""}
${BRIEF_IS_DESCRIPTION_ONLY}
${ANTI_AI_LOOK}${formatBrandDna(brandDna)}`;
}
