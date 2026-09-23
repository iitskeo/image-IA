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
    id: "ecommerce_catalog",
    useFor:
      "Plain product/catalog photos (e-commerce, marketplace, 'foto de producto', 'fondo blanco'), with no promotional message.",
    photography:
      "Professional e-commerce packshot: the product alone, centered and upright, filling about 70-80% of the frame, on a pure white (#FFFFFF-level white) seamless background with even, soft, shadowless-looking lighting, true-to-life colors and a very subtle natural contact shadow under it. Tack-sharp focus on the whole product.",
    design: "No graphic layer and no text at all.",
  },
  {
    id: "minimal_product_poster",
    useFor: "Default for promoting a physical product (new launch, offer, stock alert).",
    photography:
      "Clean premium studio hero shot: the product alone, large and confident in frame (about 55-65% of the height), on a seamless dark backdrop with a soft tonal gradient falloff. Crisp rim light defining the silhouette and a soft key light revealing the real materials. The product may stand upright or have a slight dynamic tilt / gentle levitation with a soft shadow below for energy. No tables, boards, pedestals, crates, plants or props.",
    design:
      "Restraint: one bold modern headline (e.g. tall condensed sans-serif, all caps) set in clean negative space away from the product; if provided, a small list of 2-3 short benefit bullets under the headline in the same typeface family; if provided, one small footer line (e.g. the brand's social handle) centered at the bottom. No decorative rules, bars, frames, glows or background motifs — the product and the typography carry the piece.",
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
      "Editorial portrait photography: the person's own expression and features exactly as in their reference photo, real skin texture, soft key light with gentle falloff, natural color grade, background with depth.",
    design: "No graphic layer unless the text list asks for it.",
  },
];

export const ART_STYLE_IDS = ART_STYLES.map((s) => s.id);

export function formatArtStyleLibrary(): string {
  return ART_STYLES.map(
    (s) => `[${s.id}] Use for: ${s.useFor}\n  Photography layer: ${s.photography}\n  Design layer: ${s.design}`
  ).join("\n\n");
}
