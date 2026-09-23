import { NextResponse } from "next/server";
import { inferBrandDnaFields } from "@/lib/brand-dna-inference";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { MAX_BRAND_DNA_IMAGES } from "@/lib/brand-dna";
import { validateReferenceImageFile } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${rateLimit.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "La solicitud debe ser multipart/form-data." },
      { status: 400 }
    );
  }

  try {
    const whatTheyDo = sanitizeShortText(formData.get("whatTheyDo"));
    const tone = sanitizeShortText(formData.get("tone"));

    const rawColors = formData.get("colors");
    let colors: string[] = [];
    if (typeof rawColors === "string" && rawColors) {
      try {
        const parsed = JSON.parse(rawColors);
        if (Array.isArray(parsed)) {
          colors = parsed.filter((c): c is string => typeof c === "string").slice(0, 10);
        }
      } catch {
        // Blindaje: colores mal formados simplemente se ignoran.
      }
    }

    const imageFiles = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_BRAND_DNA_IMAGES);

    const images = [];
    for (const file of imageFiles) {
      try {
        validateReferenceImageFile(file);
      } catch {
        continue; // Blindaje: una imagen inválida no debe tumbar toda la inferencia.
      }
      const bytes = await file.arrayBuffer();
      images.push({ base64: Buffer.from(bytes).toString("base64"), mimeType: file.type });
    }

    const result = await inferBrandDnaFields({ whatTheyDo, tone, colors, images });
    return NextResponse.json(result);
  } catch (error) {
    // Blindaje: la inferencia es un extra, nunca debe bloquear el guardado
    // del ADN — si algo falla, se responde vacío en vez de un error duro.
    console.error("Error infiriendo ADN de marca:", error);
    return NextResponse.json({});
  }
}

function sanitizeShortText(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.slice(0, 500) : undefined;
}
