"use client";

import { useEffect, useRef, useState } from "react";
import {
  Montserrat,
  Poppins,
  Inter,
  Manrope,
  Space_Grotesk,
  Bebas_Neue,
  Oswald,
  Anton,
  Archivo_Black,
  Playfair_Display,
  Cormorant_Garamond,
  DM_Serif_Display,
  Great_Vibes,
  Permanent_Marker,
  Pacifico,
} from "next/font/google";
import { BRAND_FONTS, findBrandFont } from "@/lib/brand-fonts";

// Una fuente de Google por opción, para que el selector muestre cada
// tipografía real en vez de solo su nombre en texto plano.
const montserrat = Montserrat({ subsets: ["latin"], weight: "700" });
const poppins = Poppins({ subsets: ["latin"], weight: "600" });
const inter = Inter({ subsets: ["latin"], weight: "600" });
const manrope = Manrope({ subsets: ["latin"], weight: "700" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const oswald = Oswald({ subsets: ["latin"], weight: "600" });
const anton = Anton({ subsets: ["latin"], weight: "400" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: "700" });
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: "600" });
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const permanentMarker = Permanent_Marker({ subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

const FONT_CLASS_NAMES: Record<string, string> = {
  montserrat: montserrat.className,
  poppins: poppins.className,
  inter: inter.className,
  manrope: manrope.className,
  "space-grotesk": spaceGrotesk.className,
  "bebas-neue": bebasNeue.className,
  oswald: oswald.className,
  anton: anton.className,
  "archivo-black": archivoBlack.className,
  "playfair-display": playfairDisplay.className,
  "cormorant-garamond": cormorantGaramond.className,
  "dm-serif-display": dmSerifDisplay.className,
  "great-vibes": greatVibes.className,
  "permanent-marker": permanentMarker.className,
  pacifico: pacifico.className,
};

interface FontSelectProps {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  previewText: string;
  autoLabel: string;
  ariaLabel: string;
}

export function FontSelect({ value, onChange, previewText, autoLabel, ariaLabel }: FontSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = findBrandFont(value);
  const text = previewText.trim() || "Aa Bb Cc";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-background px-3 py-2 text-left text-sm text-foreground outline-none focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
      >
        <span className={selected ? FONT_CLASS_NAMES[selected.id] : ""}>
          {selected ? selected.name : autoLabel}
        </span>
        <span className="ml-2 shrink-0 text-foreground/40">▾</span>
      </button>

      {open && (
        <div className="custom-scroll absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
              !selected ? "text-[var(--accent-from)]" : "text-foreground/70"
            }`}
          >
            {autoLabel}
          </button>
          {BRAND_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => {
                onChange(font.id);
                setOpen(false);
              }}
              className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2 ${
                selected?.id === font.id ? "bg-surface-2" : ""
              }`}
            >
              <span className="text-[10px] uppercase tracking-wide text-foreground/40">{font.name}</span>
              <span className={`truncate text-lg leading-tight text-foreground ${FONT_CLASS_NAMES[font.id]}`}>
                {text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
