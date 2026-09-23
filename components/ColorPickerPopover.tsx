"use client";

import { useEffect, useState } from "react";

interface ColorPickerLabels {
  title: string;
  hue: string;
  saturation: string;
  lightness: string;
  cancel: string;
  confirm: string;
}

interface ColorPickerPopoverProps {
  initialColor?: string;
  onConfirm: (hex: string) => void;
  onCancel: () => void;
  labels: ColorPickerLabels;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

function hslToHex({ h, s, l }: Hsl): string {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsl(hex: string): Hsl {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Selector de color propio, centrado y con confirmación explícita: el
// selector nativo del navegador se abría en una esquina y agregaba colores
// sin un "listo" claro.
export function ColorPickerPopover({ initialColor, onConfirm, onCancel, labels }: ColorPickerPopoverProps) {
  const [hsl, setHsl] = useState<Hsl>(() =>
    initialColor && HEX_PATTERN.test(initialColor) ? hexToHsl(initialColor) : { h: 38, s: 60, l: 55 }
  );
  const hex = hslToHex(hsl);
  const [hexDraft, setHexDraft] = useState(hex);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm(hex);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hex, onCancel, onConfirm]);

  function updateHsl(next: Partial<Hsl>) {
    const merged = { ...hsl, ...next };
    setHsl(merged);
    setHexDraft(hslToHex(merged));
  }

  function handleHexChange(value: string) {
    setHexDraft(value);
    const normalized = value.startsWith("#") ? value : `#${value}`;
    if (HEX_PATTERN.test(normalized)) setHsl(hexToHsl(normalized.toLowerCase()));
  }

  const sliderClass = "h-3 w-full cursor-pointer appearance-none rounded-full";
  const hueTrack =
    "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="flex w-full max-w-xs flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-2xl"
      >
        <p className="text-sm font-semibold text-foreground">{labels.title}</p>

        <div className="h-20 w-full rounded-xl border border-line" style={{ backgroundColor: hex }} />

        <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
          {labels.hue}
          <input
            type="range"
            min={0}
            max={360}
            value={hsl.h}
            onChange={(e) => updateHsl({ h: Number(e.target.value) })}
            className={sliderClass}
            style={{ background: hueTrack }}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
          {labels.saturation}
          <input
            type="range"
            min={0}
            max={100}
            value={hsl.s}
            onChange={(e) => updateHsl({ s: Number(e.target.value) })}
            className={sliderClass}
            style={{
              background: `linear-gradient(to right, hsl(${hsl.h},0%,${hsl.l}%), hsl(${hsl.h},100%,${hsl.l}%))`,
            }}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-foreground/60">
          {labels.lightness}
          <input
            type="range"
            min={0}
            max={100}
            value={hsl.l}
            onChange={(e) => updateHsl({ l: Number(e.target.value) })}
            className={sliderClass}
            style={{
              background: `linear-gradient(to right, hsl(${hsl.h},${hsl.s}%,0%), hsl(${hsl.h},${hsl.s}%,50%), hsl(${hsl.h},${hsl.s}%,100%))`,
            }}
          />
        </label>

        <input
          type="text"
          value={hexDraft}
          onChange={(e) => handleHexChange(e.target.value.trim())}
          maxLength={7}
          aria-label="HEX"
          className="rounded-lg border border-line bg-background px-3 py-2 font-mono text-sm uppercase text-foreground outline-none focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-2"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(hex)}
            className="btn-primary flex-1 rounded-xl px-3 py-2 text-sm font-medium"
          >
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
