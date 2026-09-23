// Limitador en memoria, por proceso. Suficiente para el MVP en un solo
// servidor; si se despliega en un entorno serverless con múltiples
// instancias, cada instancia tendrá su propio contador (protección
// aproximada, no exacta). Para producción a mayor escala, reemplazar por un
// backend compartido (ej. Upstash Redis) detrás de la misma función.

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const MAX_REQUESTS_PER_WINDOW = 20;

const buckets = new Map<string, Bucket>();

// Evita que el Map crezca sin límite si llegan muchas IPs distintas.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true };
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  // En localhost (sin proxy delante) no hay x-forwarded-for/x-real-ip, así
  // que TODAS las requests locales — las tuyas y las de cualquiera que
  // pruebe contra el mismo `npm run dev` — comparten este mismo cupo
  // "unknown". Detrás de un hosting real (Vercel, etc.) cada visitante
  // tendrá su propia IP y su propio cupo independiente.
  return request.headers.get("x-real-ip") || "unknown";
}
