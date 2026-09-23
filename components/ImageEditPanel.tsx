"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { ChatTurn } from "@/lib/history";
import { ASPECT_RATIOS, isAspectRatio, type AspectRatio } from "@/lib/aspect-ratio";
import { SendIcon, XIcon } from "./icons";

interface ImageEditPanelProps {
  open: boolean;
  onClose: () => void;
  // El turno específico que se está editando (para la miniatura y la
  // proporción actual) — la referencia para el pedido es SIEMPRE esta
  // imagen, sea el turno original o una edición anterior.
  turn: ChatTurn | null;
  onSubmit: (instruction: string, aspectRatio: AspectRatio) => void;
  t: Dictionary;
}

export function ImageEditPanel({ open, onClose, turn, onSubmit, t }: ImageEditPanelProps) {
  const [instruction, setInstruction] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstruction("");
    setAspectRatio(isAspectRatio(turn?.aspectRatio) ? turn.aspectRatio : "1:1");
  }, [open, turn]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !turn) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = instruction.trim();
    if (!value) return;
    onSubmit(value, aspectRatio);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.editImage}
        className="w-full max-w-lg rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{t.editImage}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-md p-1 text-foreground/50 hover:bg-surface-2 hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
          <div className="flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={turn.image}
              alt={turn.prompt}
              className="h-24 w-24 shrink-0 rounded-xl border border-line object-cover"
            />
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={t.editPlaceholder}
              rows={4}
              maxLength={400}
              className="w-full flex-1 resize-none rounded-xl border border-line bg-background p-2.5 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              aria-label={t.aspectRatioLabel}
              className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-xs font-medium text-foreground/70 outline-none focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {t.aspectRatios[ratio] ?? ratio}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!instruction.trim()}
              className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon className="h-3.5 w-3.5" />
              {t.editSend}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
