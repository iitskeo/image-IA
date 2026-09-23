// Biblioteca de recetas de dirección de arte: nuestro equivalente interno a
// los "comandos" tipo /minimal-poster. El director de arte elige la receta
// que mejor encaja con cada pedido y la adapta. Cada receta define las dos
// capas que hacen que una pieza se vea cara y no generada por IA: la capa
// fotográfica (set, luz, cámara) y la capa de diseño gráfico (tipografía,
// sistema de líneas, motivos).

export interface ArtStyle {
  id: string;
  useFor: string;
  photography: string;
  design: string;
}

export const ART_STYLES: ArtStyle[] = [
  {
    id: "minimal_product_poster",
    useFor: "Default for promoting a physical product (new launch, offer, stock alert).",
    photography:
      "Professional studio hero shot: the product alone, upright, large in frame (about 55-65% of the height), centered or on a strong vertical axis, on a seamless deep backdrop that melts into a glossy dark floor with a soft mirror reflection under the product. Low-key cinematic lighting: two strip-box rim lights tracing the silhouette, a soft key light revealing materials, subtle haze and a faint glow behind the product. No tables, boards, pedestals, crates, plants or props.",
    design:
      "Minimal editorial poster system: one bold display headline in the top band, small widely letter-spaced caps for secondary lines framed by thin horizontal hairline rules, a short accent bar or line in one accent color near the bottom. Optional huge, faint, tone-on-tone motif taken from the product's own world (a symbol, calligraphy or silhouette) blended into the background at low opacity behind the product.",
  },
  {
    id: "luxury_campaign",
    useFor: "Premium/luxury products or brands (perfume, jewelry, watches, cosmetics, high-end drinks).",
    photography:
      "Luxury fragrance-ad photography: the product as a sculptural object under a single dramatic spotlight, deep monochrome surroundings, rich velvety blacks, precise specular highlights, a thin mirror-like reflection, extremely clean.",
    design:
      "Refined high-contrast serif headline, tiny letter-spaced caps for secondary text, abundant negative space, perfect symmetry or golden-ratio placement, no decoration beyond one hairline rule.",
  },
  {
    id: "bold_streetwear",
    useFor: "Youthful, energetic brands: sneakers, apparel, gaming, merch, fandom products.",
    photography:
      "Hard-lit studio shot with punchy contrast and a saturated single-color backdrop, crisp shadows, the product as a confident hero, slight low angle.",
    design:
      "Oversized condensed bold headline partially tucked BEHIND the product for depth layering, tight tracking, small technical-style labels in caps with thin rules, strong grid.",
  },
  {
    id: "night_event_editorial",
    useFor: "Parties, dance nights, concerts, celebrations, nightlife events.",
    photography:
      "Authentic candid event photography: one hero moment (e.g. a couple mid-dance, a singer on stage) shot with a fast prime lens, warm practical lights, bokeh from string lights and stage lamps, motion energy, real skin texture and natural expressions.",
    design:
      "Magazine event poster: a bold display headline, date and time as a clean typographic block, venue in small letter-spaced caps, thin rules separating info, text placed over calm dark areas of the photo.",
  },
  {
    id: "food_editorial",
    useFor: "Restaurants, food, drinks, cafés, menus.",
    photography:
      "Food-magazine photography: natural window light or moody side light, true-to-life textures, steam or condensation when relevant, curated minimal styling with real tableware, shallow depth of field.",
    design:
      "Elegant editorial layout: serif or refined sans headline, small caps details, generous margins, text over clean negative space.",
  },
  {
    id: "editorial_portrait",
    useFor: "Portraits, avatars, people-centered images without a product.",
    photography:
      "Editorial portrait photography: natural expression, real skin texture, flattering soft key light with gentle falloff, cinematic color grade, background with depth.",
    design: "No graphic layer unless the text list asks for it.",
  },
];

export const ART_STYLE_IDS = ART_STYLES.map((s) => s.id);

export function formatArtStyleLibrary(): string {
  return ART_STYLES.map(
    (s) => `[${s.id}] Use for: ${s.useFor}\n  Photography layer: ${s.photography}\n  Design layer: ${s.design}`
  ).join("\n\n");
}
