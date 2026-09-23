// Módulo sin dependencias de servidor (nada de @google/genai aquí) para que
// tanto el cliente (selector de categoría) como el servidor (clasificador)
// puedan importar la misma fuente de verdad sin arrastrar código de servidor
// al bundle del navegador.
export const CATEGORIES = [
  "poster_evento",
  "post_redes",
  "producto",
  "retrato_avatar",
  "general",
] as const;

export type Category = (typeof CATEGORIES)[number];
