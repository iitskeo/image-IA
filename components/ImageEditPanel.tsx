"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { ChatTurn } from "@/lib/history";
import { LoaderIcon, SendIcon, XIcon } from "./icons";

interface ImageEditPanelProps {
  open: boolean;
  onClose: () => void;
  // El turno raíz primero, seguido de cada edición en orden cronológico.
  turns: ChatTurn[];
  generating: boolean;
  error: string | null;
  onSubmit: (instruction: string) => void;
  t: Dictionary;
}

export function ImageEditPanel({ open, onClose, turns, generating, error, onSubmit, t }: ImageEditPanelProps) {
  const [instruction, setInstruction] = useState("");
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setInstruction("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, generating]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = instruction.trim();
    if (!value || generating) return;
    onSubmit(value);
    setInstruction("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.editImage}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-line bg-surface shadow-2xl"
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

        <div className="custom-scroll flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {turns.map((turn, i) => (
              <div key={turn.id} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-foreground/50">
                  {i === 0 ? t.editOriginal : turn.prompt}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={turn.image}
                  alt={turn.prompt}
                  className="w-full rounded-xl border border-line object-cover"
                />
              </div>
            ))}

            {generating && (
              <div className="flex aspect-[4/3] w-full animate-pulse items-center justify-center rounded-xl border border-line bg-surface-2">
                <LoaderIcon className="h-6 w-6 animate-spin text-foreground/25" />
              </div>
            )}
            <div ref={scrollBottomRef} />
          </div>
        </div>

        <div className="border-t border-line p-3">
          {error && <p className="mb-2 rounded-lg bg-red-950/50 px-3 py-2 text-xs text-red-300">{error}</p>}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={t.editPlaceholder}
              maxLength={400}
              disabled={generating}
              className="flex-1 rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={generating || !instruction.trim()}
              aria-label={t.editSend}
              className="btn-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
