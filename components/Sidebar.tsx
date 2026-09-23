"use client";

import type { Dictionary, Locale } from "@/lib/i18n";
import type { Chat } from "@/lib/history";
import { formatRelativeTime } from "@/lib/format";
import { DnaIcon, GearIcon, PlusIcon, SparkleIcon, TrashIcon, XIcon } from "./icons";

interface SidebarProps {
  history: Chat[];
  activeId: string | null;
  locale: Locale;
  t: Dictionary;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  onOpenBrandDna: () => void;
  brandDnaLabel: string;
}

export function Sidebar({
  history,
  activeId,
  locale,
  t,
  open,
  onClose,
  onSelect,
  onNewChat,
  onDelete,
  onOpenSettings,
  onOpenBrandDna,
  brandDnaLabel,
}: SidebarProps) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 -translate-x-full flex-col border-r border-line bg-surface-2 transition-transform duration-200 md:relative md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <div className="btn-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <SparkleIcon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {t.appName}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="ml-auto rounded-md p-1.5 text-foreground/50 hover:bg-surface hover:text-foreground md:hidden"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-from)_55%,transparent)]"
        >
          <PlusIcon className="h-4 w-4" />
          {t.newChat}
        </button>
      </div>

      <nav className="custom-scroll flex-1 overflow-y-auto px-3 py-2">
        {history.length === 0 ? (
          <p className="px-2 py-4 text-xs text-foreground/40">{t.historyEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {history.map((chat) => {
              const isActive = chat.id === activeId;
              const firstTurn = chat.turns[0];
              const lastTurn = chat.turns[chat.turns.length - 1];
              if (!firstTurn || !lastTurn) return null;
              return (
                <li key={chat.id} className="group relative">
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full"
                      style={{
                        backgroundImage: "linear-gradient(var(--accent-from), var(--accent-to))",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(chat.id)}
                    className={`w-full rounded-lg px-2.5 py-2 pr-8 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)] ${
                      isActive ? "bg-surface shadow-sm" : "hover:bg-surface/70"
                    }`}
                  >
                    <p className="truncate text-sm text-foreground/90">{firstTurn.prompt}</p>
                    <p className="mt-0.5 truncate text-xs text-foreground/40">
                      {t.categories[lastTurn.category] ?? lastTurn.category} ·{" "}
                      {formatRelativeTime(chat.updatedAt, locale)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chat.id);
                    }}
                    aria-label={t.deleteChat}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-foreground/40 transition-colors hover:bg-background hover:text-red-500"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-line px-3 py-3 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={onOpenBrandDna}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-from)_55%,transparent)]"
        >
          <DnaIcon className="h-4 w-4" />
          {brandDnaLabel}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-from)_55%,transparent)]"
        >
          <GearIcon className="h-4 w-4" />
          {t.settings}
        </button>
      </div>
      </aside>
    </>
  );
}
