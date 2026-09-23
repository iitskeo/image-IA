import { ASPECT_RATIO_DIMENSIONS, type AspectRatio } from "./aspect-ratio";

// Procesamiento de imagen en el navegador (canvas) en vez del servidor: el
// despliegue en Cloudflare Workers no puede usar librerías nativas como sharp.

const QUANTIZE_STEP = 24;
const SAMPLE_SIZE = 80;

function toHex(value: number): string {
  return Math.min(255, Math.max(0, value)).toString(16).padStart(2, "0");
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D no disponible.");
  return { canvas, ctx };
}

// Reduce cada imagen a una miniatura, cuantiza los píxeles a una cuadrícula
// de color (para agrupar tonos similares) y cuenta frecuencias.
export async function extractDominantColors(files: File[], count = 5): Promise<string[]> {
  const counts = new Map<string, number>();

  for (const file of files) {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, SAMPLE_SIZE / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const { ctx } = createCanvas(width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();

      const { data } = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i + 3 < data.length; i += 4) {
        if (data[i + 3] < 128) continue; // píxel transparente (típico en logos)

        const r = Math.round(data[i] / QUANTIZE_STEP) * QUANTIZE_STEP;
        const g = Math.round(data[i + 1] / QUANTIZE_STEP) * QUANTIZE_STEP;
        const b = Math.round(data[i + 2] / QUANTIZE_STEP) * QUANTIZE_STEP;

        // Blancos/negros/grises casi puros casi siempre son fondo, no marca.
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (min > 225 || max < 30 || max - min < 12) continue;

        const key = `${r},${g},${b}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    } catch {
      // Una imagen inválida no debe tirar toda la extracción.
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });
}

const REFERENCE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Con hasta 3 referencias por pedido, cada una se mantiene ≤3MB para que el
// total (en base64) quede holgado bajo el límite de ~20MB de Gemini.
const REFERENCE_MAX_BYTES = 3 * 1024 * 1024;
const REFERENCE_MAX_DIMENSION = 2048;

// Capturas pegadas (PNG enormes) o fotos de celular suelen pasar el límite
// del servidor: en ese caso se reescala y recomprime a JPEG en el navegador.
// Si el navegador no puede decodificarla (ej. HEIC), se deja tal cual y el
// servidor responde con un mensaje claro.
export async function prepareReferenceImage(file: File): Promise<File> {
  if (REFERENCE_TYPES.includes(file.type) && file.size <= REFERENCE_MAX_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, REFERENCE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const { canvas, ctx } = createCanvas(width, height);
    ctx.fillStyle = "#ffffff"; // fondo para PNG con transparencia al pasar a JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "referencia";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    img.src = src;
  });
}

// Red de seguridad: si el modelo devolviera otra proporción, recorta al centro
// para que la elegida por el usuario se cumpla siempre. Si ya coincide, no la toca.
export async function normalizeImageToAspectRatio(
  dataUrl: string,
  aspectRatio: AspectRatio
): Promise<string> {
  try {
    const { width, height } = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const targetRatio = width / height;
    const img = await loadImage(dataUrl);
    const sourceWidth = img.naturalWidth;
    const sourceHeight = img.naturalHeight;
    // Nano Banana devuelve tamaños nativos cercanos pero no exactos (ej. 16:9 →
    // 1344×768 = 1.75): con este margen se respetan sin recortar ni recomprimir.
    if (Math.abs(sourceWidth / sourceHeight - targetRatio) / targetRatio < 0.05) return dataUrl;

    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;
    if (sourceWidth / sourceHeight > targetRatio) {
      cropWidth = Math.round(sourceHeight * targetRatio);
    } else {
      cropHeight = Math.round(sourceWidth / targetRatio);
    }

    const { canvas, ctx } = createCanvas(cropWidth, cropHeight);
    ctx.drawImage(
      img,
      Math.round((sourceWidth - cropWidth) / 2),
      Math.round((sourceHeight - cropHeight) / 2),
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return dataUrl;
  }
}
