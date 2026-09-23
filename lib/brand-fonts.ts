// Biblioteca curada de tipografías para el ADN de marca. Módulo sin
// dependencias de cliente ni de servidor (nada de next/font ni @google/genai
// aquí) para poder importarse tanto desde el diálogo (selector con vista
// previa) como desde el servidor (arma el prompt de imagen).

export type FontCategory = "sans" | "condensed" | "serif" | "script";

export interface BrandFont {
  id: string;
  name: string; // Nombre real de Google Fonts, tal cual se usa en el prompt.
  category: FontCategory;
}

export const BRAND_FONTS: BrandFont[] = [
  { id: "montserrat", name: "Montserrat", category: "sans" },
  { id: "poppins", name: "Poppins", category: "sans" },
  { id: "inter", name: "Inter", category: "sans" },
  { id: "manrope", name: "Manrope", category: "sans" },
  { id: "space-grotesk", name: "Space Grotesk", category: "sans" },
  { id: "bebas-neue", name: "Bebas Neue", category: "condensed" },
  { id: "oswald", name: "Oswald", category: "condensed" },
  { id: "anton", name: "Anton", category: "condensed" },
  { id: "archivo-black", name: "Archivo Black", category: "condensed" },
  { id: "playfair-display", name: "Playfair Display", category: "serif" },
  { id: "cormorant-garamond", name: "Cormorant Garamond", category: "serif" },
  { id: "dm-serif-display", name: "DM Serif Display", category: "serif" },
  { id: "great-vibes", name: "Great Vibes", category: "script" },
  { id: "permanent-marker", name: "Permanent Marker", category: "script" },
  { id: "pacifico", name: "Pacifico", category: "script" },
];

export const BRAND_FONT_IDS = BRAND_FONTS.map((f) => f.id);

export function findBrandFont(id: string | undefined): BrandFont | undefined {
  return BRAND_FONTS.find((f) => f.id === id);
}
