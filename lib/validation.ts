export class ValidationError extends Error {}

// El límite de texto que se escribe en el composer es 800 (ver textarea en
// app/page.tsx), pero el prompt que llega aquí puede ser ese texto original
// más hasta 2 rondas de "Detalles adicionales" añadidas automáticamente por
// el flujo de aclaración — de ahí el margen extra, para que ese anexado
// automático nunca se autorrechace por longitud.
export const MAX_PROMPT_LENGTH = 2000;
// Un prompt corto ya no se rechaza aquí — el clasificador decide si es
// demasiado vago y, en ese caso, hace preguntas de aclaración en vez de
// bloquear al usuario con un error genérico.
export const MIN_PROMPT_LENGTH = 1;

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

// Filtro superficial de defensa en profundidad. La barrera principal de
// seguridad de contenido son los safety settings nativos de la API de Gemini;
// esto solo evita gastar cuota en pedidos evidentemente abusivos.
const BLOCKED_PATTERNS = [
  /\bchild(ren)?\s+(sex|porn|nude)/i,
  /\bmenor(es)?\s+de\s+edad\s+(desnud|sexual)/i,
  /\bcsam\b/i,
];

export function validatePrompt(raw: unknown): string {
  if (typeof raw !== "string") {
    throw new ValidationError("El campo 'prompt' debe ser texto.");
  }

  const prompt = raw.trim();

  if (prompt.length < MIN_PROMPT_LENGTH) {
    throw new ValidationError("Escribe algo para generar una imagen.");
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new ValidationError(`El pedido es demasiado largo (máximo ${MAX_PROMPT_LENGTH} caracteres).`);
  }

  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(prompt))) {
    throw new ValidationError("Ese pedido no está permitido.");
  }

  return prompt;
}

export function validateReferenceImageFile(file: File): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    throw new ValidationError("La imagen de referencia debe ser JPG, PNG o WEBP.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new ValidationError("La imagen de referencia no puede pesar más de 5MB.");
  }
}
