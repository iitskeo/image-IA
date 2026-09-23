import type { AspectRatio } from "../aspect-ratio";

export interface ReferenceImage {
  base64: string;
  mimeType: string;
}

// Tiempo máximo que esperamos a un proveedor de imagen antes de rendirnos
// con un error claro, en vez de dejar la request colgada indefinidamente si
// el proveedor externo no responde.
export const PROVIDER_TIMEOUT_MS = 45_000;

export interface ImageProvider {
  generate(
    prompt: string,
    referenceImage?: ReferenceImage,
    aspectRatio?: AspectRatio
  ): Promise<{
    base64: string;
    mimeType: string;
  }>;
}
