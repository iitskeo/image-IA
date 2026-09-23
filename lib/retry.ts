// Reintentos automáticos con backoff exponencial para errores transitorios
// (cuota momentánea, servidor ocupado) de las APIs de IA — para que el
// cliente nunca vea un error por esto, solo siga viendo "generando…" un poco
// más mientras reintentamos en silencio.

export class HttpStatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  // @google/genai ApiError: { status: number }
  if ("status" in error && typeof (error as { status?: unknown }).status === "number") {
    return (error as { status: number }).status;
  }

  // @huggingface/inference InferenceClientHttpRequestError: { httpResponse: { status } }
  const httpResponse = (error as { httpResponse?: { status?: unknown } }).httpResponse;
  if (httpResponse && typeof httpResponse.status === "number") {
    return httpResponse.status;
  }

  return undefined;
}

export function defaultIsRetryable(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status !== undefined) return RETRYABLE_STATUS_CODES.has(status);

  // No confundir con nuestros propios timeouts (AbortSignal.timeout lanza
  // DOMException "TimeoutError"/"AbortError", sin .status) — esos NO se
  // reintentan aquí porque ya consumieron todo su presupuesto de espera.
  if (error instanceof DOMException) return false;

  // Fallas de red genéricas de fetch (DNS, conexión rechazada, etc.)
  if (error instanceof TypeError) return true;

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 4000;
  const isRetryable = options.isRetryable ?? defaultIsRetryable;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !isRetryable(error)) {
        throw error;
      }
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const jitter = delay * 0.25 * Math.random();
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}
