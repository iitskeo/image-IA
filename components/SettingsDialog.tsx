"use client";

import { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { XIcon } from "./icons";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onClearHistory: () => void;
  t: Dictionary;
}

export function SettingsDialog({
  open,
  onClose,
  locale,
  onLocaleChange,
  onClearHistory,
  t,
}: SettingsDialogProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    // Reinicia la confirmación cada vez que el modal se cierra, para que no
    // quede "atascada" en modo confirmación la próxima vez que se abra.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setConfirmingClear(false);
  }, [open]);

  // Cerrar con click afuera es fácil de disparar sin querer — se quitó ese
  // cierre y en su lugar solo Esc (o el botón X) cierran el diálogo.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.settingsTitle}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t.settingsTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="rounded-md p-1 text-foreground/50 hover:bg-surface-2 hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground/80">{t.language}</span>
            <select
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition-shadow focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_55%,transparent)]"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
            </select>
          </label>

          {confirmingClear ? (
            <div className="flex flex-col gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-3">
              <p className="text-sm text-red-300">{t.clearHistoryConfirm}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  {t.confirmYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-2"
                >
                  {t.confirmCancel}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="mt-1 rounded-lg border border-line px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40"
            >
              {t.clearHistory}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
