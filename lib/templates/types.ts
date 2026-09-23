import type { ClassificationResult } from "../classifier";
import type { BrandDna } from "../brand-dna";
import type { AspectRatio } from "../aspect-ratio";

export interface TemplateInput {
  userPrompt: string;
  classification: ClassificationResult;
  hasReferenceImage: boolean;
  referenceCount: number;
  logoAttached: boolean;
  aspectRatio: AspectRatio;
  brandDna?: BrandDna;
  // true cuando la imagen de referencia es la versión anterior de este mismo
  // diseño (edición vía chat), no un producto/persona que deba quedar idéntico.
  isEdit?: boolean;
}
