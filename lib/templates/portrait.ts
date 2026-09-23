import type { TemplateInput } from "./types";
import {
  ANTI_AI_ILLUSTRATION_LOOK,
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
  referenceCount,
  aspectRatio,
  brandDna,
  modoVisual,
}: TemplateInput): string {
  const { estilo, resumen } = classification;
  const isIllustration = modoVisual === "ilustracion";

  const details = formatDetails([["Estilo pedido por el usuario", estilo]]);

  // El modelo tendía a "embellecer" o cambiar la cara de la persona real. En
  // modo ilustración el objetivo cambia: SÍ se reinterpreta como personaje
  // dibujado, pero debe seguir siendo reconocible como esa persona.
  const multiplePhotosNote =
    referenceCount > 1 ? " (all photos show the same person — combine them for maximum likeness)" : "";
  const identityRule = !hasReferenceImage
    ? ""
    : isIllustration
      ? `- The person in the user's reference photo(s)${multiplePhotosNote} must be recognizable as that SAME real person once redrawn: keep their face shape, eyes, hairstyle, and natural expression translated into the chosen illustration style. This is intentional stylization, not a photographic reproduction — do not add photographic skin texture.`
      : `- The person in the user's reference photo(s)${multiplePhotosNote} must remain unmistakably the SAME real person: identical face shape, eyes, eyebrows, nose, lips, jawline, ears, skin tone and texture, hairline, facial hair, age, moles and marks, and their natural expression. Do not beautify, slim, smooth, de-age or "idealize" any feature. Only the background, lighting, wardrobe or framing may change, and only as requested.`;

  const designRequirements = isIllustration
    ? `- Consistent, appealing character design that captures this person's/subject's recognizable likeness (face shape, eyes, hair, expression) reinterpreted in the chosen illustration style.
- Natural, expressive pose — avoid a stiff, generic mascot-like stance.
- Lighting and background rendered in the same illustration medium as the character, appropriate to the requested style.`
    : `- Realistic skin texture (pores, subtle imperfections, natural tone variation) — never smoothed into a plastic/waxy look.
- Natural, asymmetric facial features and expression — avoid an artificially "perfect" or generic symmetrical face.
- Lighting and background appropriate to the requested style (e.g. natural window light for a casual portrait, controlled studio light for a professional headshot).`;

  return `Create a natural, high-quality portrait/avatar image.

Brief from the user (source of truth for content): "${userPrompt}"${details}
Summary: ${resumen}

Design requirements:
${designRequirements}
- Do NOT add any text, caption or words to the image — this is a portrait, not a graphic design piece.
${formatAspectRatio(aspectRatio)}
${identityRule}
${BRIEF_IS_DESCRIPTION_ONLY}
${isIllustration ? ANTI_AI_ILLUSTRATION_LOOK : ANTI_AI_LOOK}${formatBrandDna(brandDna)}`;
}
