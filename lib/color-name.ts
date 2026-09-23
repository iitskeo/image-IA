// Traduce un hex de marca a un nombre de color concreto y descriptivo, por
// coincidencia contra una paleta curada — así el prompt final describe el
// color de marca de forma consistente en vez de que cada llamada de IA
// (formatBrandDna vs. director de arte) lo "adivine" por su cuenta con
// resultados distintos entre sí.

interface NamedColor {
  name: string;
  r: number;
  g: number;
  b: number;
}

// Paleta curada de nombres descriptivos (no solo "verde" o "rosa" — el matiz
// y la intensidad importan para que la imagen final se sienta de la marca).
const NAMED_COLORS: NamedColor[] = [
  { name: "pure white", r: 255, g: 255, b: 255 },
  { name: "off-white / cream", r: 245, g: 240, b: 230 },
  { name: "light warm gray", r: 210, g: 205, b: 198 },
  { name: "medium gray", r: 150, g: 150, b: 150 },
  { name: "charcoal gray", r: 60, g: 62, b: 66 },
  { name: "near-black", r: 20, g: 20, b: 22 },
  { name: "pure black", r: 0, g: 0, b: 0 },

  { name: "crimson red", r: 200, g: 20, b: 40 },
  { name: "bright red", r: 230, g: 40, b: 35 },
  { name: "deep brick red", r: 130, g: 40, b: 35 },
  { name: "warm coral red", r: 240, g: 100, b: 85 },
  { name: "soft salmon pink", r: 240, g: 150, b: 140 },
  { name: "hot pink", r: 230, g: 30, b: 140 },
  { name: "bright bubblegum pink", r: 245, g: 100, b: 180 },
  { name: "soft pastel pink", r: 245, g: 190, b: 210 },
  { name: "deep magenta", r: 160, g: 20, b: 110 },
  { name: "dusty rose", r: 200, g: 140, b: 150 },

  { name: "burnt orange", r: 200, g: 90, b: 30 },
  { name: "bright orange", r: 240, g: 120, b: 30 },
  { name: "warm peach", r: 245, g: 175, b: 130 },
  { name: "amber", r: 220, g: 150, b: 30 },
  { name: "golden yellow", r: 230, g: 180, b: 40 },
  { name: "bright yellow", r: 240, g: 210, b: 40 },
  { name: "pale butter yellow", r: 245, g: 225, b: 160 },
  { name: "mustard yellow", r: 190, g: 150, b: 40 },

  { name: "olive green", r: 110, g: 115, b: 40 },
  { name: "lime green", r: 150, g: 210, b: 50 },
  { name: "fresh grass green", r: 90, g: 170, b: 60 },
  { name: "bright kelly green", r: 30, g: 160, b: 80 },
  { name: "deep forest green", r: 20, g: 80, b: 45 },
  { name: "sage green", r: 140, g: 160, b: 130 },
  { name: "mint green", r: 150, g: 220, b: 190 },
  { name: "deep teal green", r: 20, g: 75, b: 70 },
  { name: "emerald green", r: 20, g: 140, b: 90 },

  { name: "bright teal", r: 20, g: 160, b: 160 },
  { name: "deep teal", r: 15, g: 90, b: 95 },
  { name: "turquoise", r: 40, g: 190, b: 190 },
  { name: "pale aqua", r: 170, g: 225, b: 225 },
  { name: "sky blue", r: 100, g: 180, b: 230 },
  { name: "bright cyan blue", r: 30, g: 170, b: 220 },
  { name: "deep ocean blue", r: 15, g: 70, b: 120 },
  { name: "royal blue", r: 40, g: 70, b: 190 },
  { name: "navy blue", r: 20, g: 35, b: 80 },
  { name: "cornflower blue", r: 100, g: 130, b: 220 },
  { name: "pale powder blue", r: 190, g: 210, b: 235 },

  { name: "indigo", r: 60, g: 40, b: 140 },
  { name: "deep violet purple", r: 90, g: 30, b: 130 },
  { name: "bright purple", r: 140, g: 60, b: 200 },
  { name: "soft lavender", r: 195, g: 175, b: 225 },
  { name: "plum", r: 110, g: 50, b: 90 },

  { name: "warm chocolate brown", r: 90, g: 55, b: 35 },
  { name: "tan / camel", r: 190, g: 150, b: 110 },
  { name: "warm beige", r: 215, g: 195, b: 165 },
  { name: "terracotta", r: 190, g: 100, b: 70 },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | undefined {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return undefined;
  const value = match[1];
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

// Distancia euclidiana simple en RGB: suficiente para elegir un nombre
// descriptivo razonable, no se necesita precisión perceptual (LAB) aquí.
export function nameForHex(hex: string): string | undefined {
  const rgb = hexToRgb(hex);
  if (!rgb) return undefined;

  let best: NamedColor | undefined;
  let bestDistance = Infinity;
  for (const candidate of NAMED_COLORS) {
    const distance =
      (candidate.r - rgb.r) ** 2 + (candidate.g - rgb.g) ** 2 + (candidate.b - rgb.b) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best?.name;
}

// Para una paleta completa de marca: "hex (nombre descriptivo)" por cada
// color válido, en el mismo orden — así ambas capas del prompt (plantilla y
// director de arte) citan exactamente el mismo nombre para cada hex.
export function namedBrandPalette(colors: string[]): string {
  return colors
    .map((hex) => {
      const name = nameForHex(hex);
      return name ? `${hex} (${name})` : hex;
    })
    .join(", ");
}
