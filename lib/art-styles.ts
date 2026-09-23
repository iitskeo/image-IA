// Biblioteca de recetas de dirección de arte: nuestro equivalente interno a
// los "comandos" tipo /minimal-poster. El director de arte elige la receta
// que mejor encaja con cada pedido y la adapta. Cada receta define las dos
// capas que hacen que una pieza se vea cara y no generada por IA: la capa
// visual (fotografía o ilustración, según "medium") y la capa de diseño
// gráfico (tipografía, sistema de líneas, motivos).

export type ArtMedium = "photography" | "illustration";

export interface ArtStyle {
  id: string;
  medium: ArtMedium;
  useFor: string;
  visual: string;
  design: string;
}

export const ART_STYLES: ArtStyle[] = [
  {
    id: "ecommerce_catalog",
    medium: "photography",
    useFor:
      "Plain product/catalog photos (e-commerce, marketplace, 'foto de producto', 'fondo blanco'), with no promotional message.",
    visual:
      "Professional e-commerce packshot: the product alone, centered and upright, filling about 70-80% of the frame, on a pure white (#FFFFFF-level white) seamless background with even, soft, shadowless-looking lighting, true-to-life colors and a very subtle natural contact shadow under it. Tack-sharp focus on the whole product.",
    design: "No graphic layer and no text at all.",
  },
  {
    id: "minimal_product_poster",
    medium: "photography",
    useFor: "Default for promoting a physical product (new launch, offer, stock alert).",
    visual:
      "Clean premium studio hero shot: the product alone, large and confident in frame (about 55-65% of the height), on a seamless dark backdrop with a soft tonal gradient falloff. Crisp rim light defining the silhouette and a soft key light revealing the real materials. The product may stand upright or have a slight dynamic tilt / gentle levitation with a soft shadow below for energy. No tables, boards, pedestals, crates, plants or props.",
    design:
      "Restraint: one bold modern headline (e.g. tall condensed sans-serif, all caps) set in clean negative space away from the product; if provided, a small list of 2-3 short benefit bullets under the headline in the same typeface family; if provided, one small footer line (e.g. the brand's social handle) centered at the bottom. No decorative rules, bars, frames, glows or background motifs — the product and the typography carry the piece.",
  },
  {
    id: "luxury_campaign",
    medium: "photography",
    useFor: "Premium/luxury products or brands (perfume, jewelry, watches, cosmetics, high-end drinks).",
    visual:
      "Luxury fragrance-ad photography: the product as a sculptural object under a single dramatic spotlight, deep monochrome surroundings, rich velvety blacks, precise specular highlights, a thin mirror-like reflection, extremely clean.",
    design:
      "Refined high-contrast serif headline, tiny letter-spaced caps for secondary text, abundant negative space, perfect symmetry or golden-ratio placement, no decoration beyond one hairline rule.",
  },
  {
    id: "bold_streetwear",
    medium: "photography",
    useFor: "Youthful, energetic brands: sneakers, apparel, gaming, merch, fandom products.",
    visual:
      "Hard-lit studio shot with punchy contrast and a saturated single-color backdrop, crisp shadows, the product as a confident hero, slight low angle.",
    design:
      "Oversized condensed bold headline partially tucked BEHIND the product for depth layering, tight tracking, small technical-style labels in caps with thin rules, strong grid.",
  },
  {
    id: "night_event_editorial",
    medium: "photography",
    useFor: "Parties, dance nights, concerts, celebrations, nightlife events.",
    visual:
      "Authentic candid event photography: one hero moment (e.g. a couple mid-dance, a singer on stage) shot with a fast prime lens, warm practical lights, bokeh from string lights and stage lamps, motion energy, real skin texture and natural expressions.",
    design:
      "Magazine event poster: a bold display headline, date and time as a clean typographic block, venue in small letter-spaced caps, thin rules separating info, text placed over calm dark areas of the photo.",
  },
  {
    id: "food_editorial",
    medium: "photography",
    useFor: "Restaurants, food, drinks, cafés, menus.",
    visual:
      "Food-magazine photography: natural window light or moody side light, true-to-life textures, steam or condensation when relevant, curated minimal styling with real tableware, shallow depth of field.",
    design:
      "Elegant editorial layout: serif or refined sans headline, small caps details, generous margins, text over clean negative space.",
  },
  {
    id: "editorial_portrait",
    medium: "photography",
    useFor: "Portraits, avatars, people-centered images without a product.",
    visual:
      "Editorial portrait photography: the person's own expression and features exactly as in their reference photo, real skin texture, soft key light with gentle falloff, natural color grade, background with depth.",
    design: "No graphic layer unless the text list asks for it.",
  },
  {
    id: "service_business_promo",
    medium: "photography",
    useFor:
      "Services or businesses without a physical product to shoot (salons, gyms, clinics, studios, consulting, classes, local businesses) where a real depictable scene exists.",
    visual:
      "Authentic lifestyle/editorial photography of the service or experience itself: a person genuinely receiving or enjoying it, the space/ambiance, or a moment from the activity (e.g. a stylist at work, a workout mid-motion, a class in session). Natural light, real texture, candid framing — never a staged product-on-a-pedestal shot, never stock-photo posing.",
    design:
      "Clean editorial poster layout: a confident headline in the upper or lower third over calm areas of the photo, small supporting details in letter-spaced caps, generous negative space. No decorative frames, badges or icons.",
  },
  {
    id: "minimal_announcement",
    medium: "photography",
    useFor:
      "Pure announcements with no product and no depictable real-world scene (a webinar, a seasonal promotion, a class or sale with nothing physical to photograph).",
    visual:
      "No photographic subject — a designed background instead: a rich, coherent color field or subtle gradient/texture built from the brand or brief's palette (paper grain, soft studio-light falloff, or a minimal abstract backdrop). Never invent a fake product, person or scene the brief didn't ask for.",
    design:
      "Bold graphic-design poster, closer to a Swiss/editorial print piece than a photo: strong typographic hierarchy carries the piece (large headline, clear secondary info block), restrained use of one or two accent shapes or rules at most, generous margins.",
  },
  {
    id: "playful_cartoon_illustration",
    medium: "illustration",
    useFor:
      "Animated/cartoon-style requests: kids' parties, playful brand pieces, fun invitations — anything explicitly asked to look drawn/animated rather than photographed.",
    visual:
      "Vibrant 2D cartoon illustration in the style of a modern animated feature or children's book: bold clean outlines, smooth cel-shaded coloring, warm rounded friendly shapes, exaggerated cheerful character proportions and a playful sense of motion. Rich, saturated but harmonious color palette; soft ambient illustrated lighting (never photographic light or camera terms).",
    design:
      "Bold rounded display typography that matches the playful illustration and feels integrated into the scene (e.g. bouncy lettering, a subtle flat drop shadow), not a separate photo caption. Generous colorful negative space. No photographic textures, lens effects or film grain anywhere.",
  },
  {
    id: "flat_vector_graphic",
    medium: "illustration",
    useFor:
      "Modern flat-design/vector illustration requests: tech, apps, modern minimalist brands wanting a clean illustrated (not photographic) look.",
    visual:
      "Clean flat vector illustration: confident simple geometric shapes and silhouettes, flat color fills or minimal soft gradients, no outlines or thin uniform outlines only, a contemporary limited color palette (3-5 colors), generous negative space.",
    design:
      "Modern geometric sans-serif typography integrated into the flat-design system, aligned to a clear grid. No photographic or painterly texture, no lens or camera language anywhere.",
  },
  {
    id: "hand_drawn_editorial",
    medium: "illustration",
    useFor:
      "Artisanal hand-drawn, ink, watercolor or gouache illustration requests — boutique, lifestyle or editorial pieces wanting a crafted illustrated (not photographic, not cartoon) feel.",
    visual:
      "Hand-drawn editorial illustration: visible ink linework or loose watercolor/gouache brushwork, organic imperfect lines, artisanal paper or canvas texture, a muted or earthy considered color palette with real pigment variation.",
    design:
      "Typography that feels hand-set or letterpress-inspired, integrated naturally into the illustrated composition. No photographic elements, lens or camera language anywhere.",
  },
];

export const ART_STYLE_IDS = ART_STYLES.map((s) => s.id);

export function formatArtStyleLibrary(): string {
  return ART_STYLES.map(
    (s) =>
      `[${s.id}] (${s.medium}) Use for: ${s.useFor}\n  Visual layer: ${s.visual}\n  Design layer: ${s.design}`
  ).join("\n\n");
}
