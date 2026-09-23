import type { Category } from "../classifier";
import type { TemplateInput } from "./types";
import { buildPosterPrompt } from "./poster";
import { buildSocialPostPrompt } from "./social-post";
import { buildProductPrompt } from "./product";
import { buildPortraitPrompt } from "./portrait";
import { buildGeneralPrompt } from "./general";

const TEMPLATES: Record<Category, (input: TemplateInput) => string> = {
  poster_evento: buildPosterPrompt,
  post_redes: buildSocialPostPrompt,
  producto: buildProductPrompt,
  retrato_avatar: buildPortraitPrompt,
  general: buildGeneralPrompt,
};

export function buildPromptForCategory(category: Category, input: TemplateInput): string {
  const build = TEMPLATES[category] ?? buildGeneralPrompt;
  return build(input);
}
