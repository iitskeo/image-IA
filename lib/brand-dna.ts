export type BrandDnaMode = "automatico" | "manual";

export interface BrandDna {
  id: string;
  name: string;
  mode: BrandDnaMode;
  socialLink?: string;
  colors: string[]; // hex, extraídos de las imágenes subidas o añadidos a mano
  whatTheyDo?: string;
  tone?: string;
  audience?: string;
  styleNotes?: string;
  typography?: string; // estilo tipográfico de la marca (detectado de sus imágenes o escrito a mano)
  logoImage?: string; // data URL, ya redimensionado/comprimido en el cliente
  contactPhone?: string;
  contactWebsite?: string;
  contactAddress?: string;
  createdAt: number;
}

export const BRAND_DNA_STORAGE_KEY = "ia-images-brand-dna";
export const MAX_BRAND_DNA_PROFILES = 20;
export const MAX_BRAND_DNA_IMAGES = 5;

const MAX_FIELD_LENGTH = 500;
const MAX_COLORS = 10;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
// El logo se redimensiona/comprime en el cliente antes de guardarse, así que
// en teoría nunca debería acercarse a esto — es solo un tope de blindaje.
const MAX_LOGO_DATA_URL_LENGTH = 400_000;
const LOGO_DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,/;

const SOCIAL_HOSTS = /(^|\.)(instagram\.com|tiktok\.com|x\.com|twitter\.com|facebook\.com|threads\.net)$/i;
const NON_PROFILE_SEGMENTS = new Set(["p", "reel", "reels", "explore", "stories", "share", "watch", "video"]);

// "instagram.com/tumbao.cr", "https://www.tiktok.com/@tumbao" o "@tumbao" →
// "@tumbao". Solo usuarios reales del ADN, nunca uno inventado.
export function socialHandleFromLink(link: string | undefined): string | undefined {
  const value = link?.trim();
  if (!value) return undefined;
  if (/^@[\w.]{2,30}$/.test(value)) return value;

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!SOCIAL_HOSTS.test(url.hostname)) return undefined;
    const segment = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
    if (!segment || NON_PROFILE_SEGMENTS.has(segment.toLowerCase()) || !/^[\w.]{2,30}$/.test(segment)) {
      return undefined;
    }
    return `@${segment}`;
  } catch {
    return undefined;
  }
}

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_FIELD_LENGTH);
  return trimmed || undefined;
}

function sanitizeLogoImage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value.length > MAX_LOGO_DATA_URL_LENGTH) return undefined;
  return LOGO_DATA_URL_PATTERN.test(value) ? value : undefined;
}

// Blindaje: un cliente podría mandar cualquier cosa como "brandDna" (JSON
// manipulado a mano, campos gigantes, tipos incorrectos). Esto nunca debe
// romper una generación — si algo no es válido, simplemente se descarta ese
// campo en vez de fallar toda la petición.
export function sanitizeBrandDna(raw: unknown): BrandDna | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;

  const colors = Array.isArray(obj.colors)
    ? obj.colors.filter((c): c is string => typeof c === "string" && HEX_COLOR_PATTERN.test(c)).slice(0, MAX_COLORS)
    : [];

  const sanitized: BrandDna = {
    id: sanitizeText(obj.id) ?? "unknown",
    name: sanitizeText(obj.name) ?? "",
    mode: obj.mode === "manual" ? "manual" : "automatico",
    socialLink: sanitizeText(obj.socialLink),
    colors,
    whatTheyDo: sanitizeText(obj.whatTheyDo),
    tone: sanitizeText(obj.tone),
    audience: sanitizeText(obj.audience),
    styleNotes: sanitizeText(obj.styleNotes),
    typography: sanitizeText(obj.typography),
    logoImage: sanitizeLogoImage(obj.logoImage),
    contactPhone: sanitizeText(obj.contactPhone),
    contactWebsite: sanitizeText(obj.contactWebsite),
    contactAddress: sanitizeText(obj.contactAddress),
    createdAt: typeof obj.createdAt === "number" ? obj.createdAt : Date.now(),
  };

  const hasAnyContent =
    colors.length > 0 ||
    sanitized.whatTheyDo ||
    sanitized.tone ||
    sanitized.audience ||
    sanitized.styleNotes ||
    sanitized.typography ||
    sanitized.logoImage ||
    sanitized.contactPhone ||
    sanitized.contactWebsite ||
    sanitized.contactAddress;

  return hasAnyContent ? sanitized : undefined;
}
