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
}
