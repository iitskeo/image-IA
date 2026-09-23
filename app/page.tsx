"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SettingsDialog } from "@/components/SettingsDialog";
import { BrandDnaDialog } from "@/components/BrandDnaDialog";
import { ClarificationCard, type ClarificationQuestion } from "@/components/ClarificationCard";
import {
  DownloadIcon,
  LoaderIcon,
  MenuIcon,
  PaperclipIcon,
  SendIcon,
  StopIcon,
} from "@/components/icons";
import {
  DICTIONARIES,
  SUPPORTED_LOCALES,
  detectBrowserLocale,
  getGreeting,
  type Locale,
} from "@/lib/i18n";
import { BRAND_DNA_DICTIONARIES } from "@/lib/brand-dna-i18n";
import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY,
  MAX_TURNS_PER_CHAT,
  type Chat,
  type ChatTurn,
} from "@/lib/history";
import { CATEGORIES, type Category } from "@/lib/categories";
import { ASPECT_RATIOS, type AspectRatio } from "@/lib/aspect-ratio";
import { BRAND_DNA_STORAGE_KEY, MAX_BRAND_DNA_PROFILES, type BrandDna } from "@/lib/brand-dna";
import { normalizeImageToAspectRatio, prepareReferenceImage } from "@/lib/image-client";

const LOCALE_STORAGE_KEY = "ia-images-locale";
const ADD_BRAND_DNA_OPTION = "__add_brand_dna__";

interface GenerationChoices {
  categoryHint: Category | "";
  aspectRatio: AspectRatio;
  referenceFile: File | null;
  brandDna: BrandDna | null;
}

type ChatSession =
  | { kind: "generating"; displayPrompt: string; controller: AbortController }
  | ({
      kind: "clarifying";
      displayPrompt: string;
      currentPrompt: string;
      round: number;
      questions: ClarificationQuestion[];
    } & GenerationChoices);

export default function Home() {
  const [locale, setLocale] = useState<Locale>("es");
  const [history, setHistory] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [categoryHint, setCategoryHint] = useState<Category | "">("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const [brandDnaProfiles, setBrandDnaProfiles] = useState<BrandDna[]>([]);
  const [brandDnaDialogOpen, setBrandDnaDialogOpen] = useState(false);
  const [brandDnaDialogView, setBrandDnaDialogView] = useState<"list" | "create">("list");
  // Cambiar la key remonta el diálogo, así cada apertura arranca limpia en la
  // vista pedida (lista desde el menú, crear desde el selector del composer).
  const [brandDnaDialogKey, setBrandDnaDialogKey] = useState(0);
  const [selectedBrandDnaId, setSelectedBrandDnaId] = useState("");

  // Referencias "en vivo" para que el código async siempre pueda comprobar
  // el estado más reciente (evita bugs de closures obsoletas al terminar una
  // generación en segundo plano mientras el usuario ya cambió de chat).
  const activeIdRef = useRef<string | null>(null);
  const historyRef = useRef<Chat[]>([]);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const t = DICTIONARIES[locale];
  const brandDnaT = BRAND_DNA_DICTIONARIES[locale];

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if ((SUPPORTED_LOCALES as string[]).includes(storedLocale ?? "")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocale(storedLocale as Locale);
      } else {
        setLocale(detectBrowserLocale());
      }

      const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        // Descarta datos de un formato de historial anterior (versiones
        // previas guardaban una lista plana de imágenes, no chats con
        // turnos) en vez de romper la app con ellos.
        if (Array.isArray(parsed) && parsed.every((chat) => Array.isArray(chat?.turns))) {
          setHistory(parsed);
        }
      }

      const storedBrandDna = window.localStorage.getItem(BRAND_DNA_STORAGE_KEY);
      if (storedBrandDna) {
        const parsed = JSON.parse(storedBrandDna);
        if (Array.isArray(parsed) && parsed.every((d) => typeof d?.id === "string")) {
          setBrandDnaProfiles(parsed);
        }
      }
    } catch {
      // localStorage puede no estar disponible (modo privado, cuota, etc.)
    }
  }, []);

  function handleLocaleChange(next: Locale) {
    setLocale(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignorar
    }
  }

  function persistHistory(updater: Chat[] | ((prev: Chat[]) => Chat[])) {
    setHistory((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // si se llena la cuota de localStorage, simplemente no persiste
      }
      return next;
    });
  }

  function persistBrandDna(updater: BrandDna[] | ((prev: BrandDna[]) => BrandDna[])) {
    setBrandDnaProfiles((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        window.localStorage.setItem(BRAND_DNA_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignorar cuota
      }
      return next;
    });
  }

  function openBrandDnaDialog(view: "list" | "create") {
    setBrandDnaDialogView(view);
    setBrandDnaDialogKey((k) => k + 1);
    setBrandDnaDialogOpen(true);
    setMobileSidebarOpen(false);
  }

  function handleSaveBrandDna(dna: BrandDna) {
    persistBrandDna((prev) => {
      const existingIndex = prev.findIndex((d) => d.id === dna.id);
      if (existingIndex === -1) return [dna, ...prev].slice(0, MAX_BRAND_DNA_PROFILES);
      const next = [...prev];
      next[existingIndex] = dna;
      return next;
    });
    setSelectedBrandDnaId(dna.id);
    // Si se creó desde el selector del composer, vuelve directo al prompt con
    // el ADN nuevo ya elegido.
    if (brandDnaDialogView === "create") setBrandDnaDialogOpen(false);
  }

  function handleDeleteBrandDna(id: string) {
    persistBrandDna((prev) => prev.filter((d) => d.id !== id));
    if (selectedBrandDnaId === id) setSelectedBrandDnaId("");
  }

  function setSession(chatId: string, session: ChatSession | null) {
    setSessions((prev) => {
      if (session === null) {
        if (!(chatId in prev)) return prev;
        const next = { ...prev };
        delete next[chatId];
        return next;
      }
      return { ...prev, [chatId]: session };
    });
  }

  function setChatError(chatId: string, message: string | null) {
    setErrors((prev) => {
      if (message === null) {
        if (!(chatId in prev)) return prev;
        const next = { ...prev };
        delete next[chatId];
        return next;
      }
      return { ...prev, [chatId]: message };
    });
  }

  function resetComposer() {
    setPrompt("");
    clearReferenceImage();
    setCategoryHint("");
    setAspectRatio("1:1");
    setSelectedBrandDnaId("");
  }

  // A diferencia de resetComposer(), esto solo limpia lo que ya se envió
  // (texto + imagen de referencia) y deja categoría, proporción y ADN de
  // marca seleccionados para el siguiente prompt del mismo chat.
  function clearSubmittedPrompt() {
    setPrompt("");
    clearReferenceImage();
  }

  function handleNewChat() {
    setActiveId(null);
    resetComposer();
    setMobileSidebarOpen(false);
  }

  function handleSelectChat(id: string) {
    setActiveId(id);
    resetComposer();
    setMobileSidebarOpen(false);
  }

  function handleDeleteChat(id: string) {
    // Si hay una generación en curso para este chat, cancélala primero — si
    // no, al terminar en segundo plano "resucitaría" el chat que se acaba de
    // borrar (persistHistory no encontraría el chat y crearía uno nuevo).
    const session = sessions[id];
    if (session?.kind === "generating") session.controller.abort();

    persistHistory((prev) => prev.filter((chat) => chat.id !== id));
    setSession(id, null);
    setChatError(id, null);
    if (activeId === id) setActiveId(null);
  }

  function handleClearHistory() {
    // Misma razón que en handleDeleteChat: cancela cualquier generación en
    // curso antes de borrar, para que ningún chat "resucite" después.
    Object.values(sessions).forEach((session) => {
      if (session.kind === "generating") session.controller.abort();
    });

    persistHistory([]);
    setSessions({});
    setErrors({});
    setActiveId(null);
    setSettingsOpen(false);
  }

  // Punto único para adjuntar la referencia: botón, pegar (Ctrl+V) o arrastrar.
  const attachReferenceFile = useCallback(async (file: File) => {
    const prepared = await prepareReferenceImage(file);
    setReferenceFile(prepared);
    setReferencePreview(URL.createObjectURL(prepared));
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void attachReferenceFile(file);
  }

  const anyDialogOpen = brandDnaDialogOpen || settingsOpen;

  // Pegar una imagen del portapapeles en cualquier parte del chat la adjunta
  // como referencia. El texto pegado sigue funcionando normal, y con un
  // diálogo abierto no se intercepta nada.
  useEffect(() => {
    if (anyDialogOpen) return;
    function handlePaste(e: ClipboardEvent) {
      const image = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (!image) return;
      e.preventDefault();
      void attachReferenceFile(image);
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [anyDialogOpen, attachReferenceFile]);

  // Arrastrar una imagen sobre la app la adjunta como referencia. El contador
  // evita el parpadeo del overlay al pasar por encima de elementos hijos.
  const [draggingFile, setDraggingFile] = useState(false);
  const dragDepthRef = useRef(0);

  function isFileDrag(e: DragEvent) {
    return !anyDialogOpen && Array.from(e.dataTransfer.types).includes("Files");
  }

  function handleAppDragEnter(e: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepthRef.current += 1;
    setDraggingFile(true);
  }

  function handleAppDragOver(e: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(e)) return;
    e.preventDefault(); // necesario para que el navegador permita soltar aquí
  }

  function handleAppDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(e)) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDraggingFile(false);
  }

  function handleAppDrop(e: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(e)) return;
    // Evita que el navegador abra la imagen y saque al usuario de la app.
    e.preventDefault();
    dragDepthRef.current = 0;
    setDraggingFile(false);
    const image = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (image) void attachReferenceFile(image);
  }

  function clearReferenceImage() {
    setReferenceFile(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleStopGeneration() {
    if (!activeId) return;
    const session = sessions[activeId];
    if (session?.kind === "generating") session.controller.abort();
  }

  async function runGeneration(
    apiPrompt: string,
    options: GenerationChoices & { round: number; displayPrompt: string; chatId: string }
  ) {
    const controller = new AbortController();
    const { chatId } = options;

    setChatError(chatId, null);
    setSession(chatId, { kind: "generating", displayPrompt: options.displayPrompt, controller });

    try {
      const formData = new FormData();
      formData.set("prompt", apiPrompt);
      formData.set("clarificationRound", String(options.round));
      formData.set("aspectRatio", options.aspectRatio);
      if (options.categoryHint) formData.set("categoryHint", options.categoryHint);
      if (options.referenceFile) formData.set("referenceImage", options.referenceFile);
      if (options.brandDna) formData.set("brandDna", JSON.stringify(options.brandDna));

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar la imagen.");
      }

      if (data.needsClarification) {
        setSession(chatId, {
          kind: "clarifying",
          displayPrompt: options.displayPrompt,
          currentPrompt: apiPrompt,
          round: options.round,
          questions: (data.questions ?? []) as ClarificationQuestion[],
          categoryHint: options.categoryHint,
          aspectRatio: options.aspectRatio,
          referenceFile: options.referenceFile,
          brandDna: options.brandDna,
        });
        return;
      }

      const image = await normalizeImageToAspectRatio(data.image, options.aspectRatio);

      const turn: ChatTurn = {
        id: crypto.randomUUID(),
        prompt: options.displayPrompt,
        image,
        category: data.category,
        createdAt: Date.now(),
      };

      persistHistory((prev) => {
        const existing = prev.find((chat) => chat.id === chatId);
        const rest = prev.filter((chat) => chat.id !== chatId);

        const updatedChat: Chat = existing
          ? {
              ...existing,
              turns: [...existing.turns, turn].slice(-MAX_TURNS_PER_CHAT),
              updatedAt: Date.now(),
            }
          : { id: chatId, turns: [turn], createdAt: Date.now(), updatedAt: Date.now() };

        return [updatedChat, ...rest].slice(0, MAX_HISTORY);
      });

      setSession(chatId, null);
    } catch (err) {
      setSession(chatId, null);
      if (err instanceof DOMException && err.name === "AbortError") {
        // Si se canceló el primerísimo turno de un chat nuevo (todavía no
        // existe en el historial) y el usuario lo sigue viendo, vuelve a la
        // pantalla de bienvenida en vez de dejar un chat vacío.
        if (activeIdRef.current === chatId && !historyRef.current.some((c) => c.id === chatId)) {
          setActiveId(null);
        }
      } else {
        setChatError(chatId, err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || activeSessionKind === "generating") return;
    const text = prompt.trim();
    const chatId = activeId ?? crypto.randomUUID();
    if (!activeId) setActiveId(chatId);

    // Captura los valores enviados ANTES de limpiar el composer, para que se
    // vacíe de inmediato (como un chat normal) sin perder lo que se mandó.
    const submittedCategoryHint = categoryHint;
    const submittedAspectRatio = aspectRatio;
    const submittedReferenceFile = referenceFile;
    const submittedBrandDna = brandDnaProfiles.find((d) => d.id === selectedBrandDnaId) ?? null;
    clearSubmittedPrompt();

    await runGeneration(text, {
      round: 0,
      displayPrompt: text,
      chatId,
      categoryHint: submittedCategoryHint,
      aspectRatio: submittedAspectRatio,
      referenceFile: submittedReferenceFile,
      brandDna: submittedBrandDna,
    });
  }

  function handleClarificationSubmit(answers: string[]) {
    if (!activeId) return;
    const session = sessions[activeId];
    if (!session || session.kind !== "clarifying") return;
    const details = session.questions
      .map((q, i) => `- ${q.pregunta}: ${answers[i]}`)
      .join("\n");
    const augmentedPrompt = `${session.currentPrompt}\n\nDetalles adicionales proporcionados por el usuario:\n${details}`;
    // Usa las elecciones capturadas en la sesión (no el estado actual del
    // composer, que ya se limpió tras el primer envío) para que categoría,
    // proporción, imagen de referencia y ADN de marca elegidos originalmente
    // se respeten también en esta ronda de aclaración.
    void runGeneration(augmentedPrompt, {
      round: session.round + 1,
      displayPrompt: session.displayPrompt,
      chatId: activeId,
      categoryHint: session.categoryHint,
      aspectRatio: session.aspectRatio,
      referenceFile: session.referenceFile,
      brandDna: session.brandDna,
    });
  }

  const activeChat = history.find((chat) => chat.id === activeId) ?? null;
  const turns = activeChat?.turns ?? [];
  const isChatView = activeId !== null;
  const activeSession = activeId ? sessions[activeId] : undefined;
  const activeSessionKind = activeSession?.kind;
  const activeError = activeId ? errors[activeId] : undefined;

  // Baja automáticamente al fondo cuando aparece un nuevo turno, empieza a
  // generar, llegan preguntas de aclaración, o se cambia de chat — para que
  // nunca parezca que "no está pasando nada".
  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeId, turns.length, activeSession]);

  const composer = (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition-shadow focus-within:border-transparent focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t.placeholder}
        rows={3}
        maxLength={800}
        className="w-full resize-none rounded-xl bg-transparent p-2 text-sm text-foreground outline-none placeholder:text-foreground/35"
      />

      {referencePreview && (
        <div className="flex items-center gap-3 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={referencePreview}
            alt={t.attach}
            className="h-14 w-14 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={clearReferenceImage}
            className="text-xs font-medium text-foreground/50 hover:text-foreground"
          >
            {t.removeImage}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-1">
        <select
          value={categoryHint}
          onChange={(e) => setCategoryHint(e.target.value as Category | "")}
          aria-label={t.categoryHintLabel}
          className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-xs font-medium text-foreground/70 outline-none focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
        >
          <option value="">{t.categoryAuto}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t.categories[c] ?? c}
            </option>
          ))}
        </select>

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

        <select
          value={selectedBrandDnaId}
          onChange={(e) => {
            // La opción "Agregar" no es una selección: abre el formulario y
            // el select vuelve solo a su valor anterior (es controlado).
            if (e.target.value === ADD_BRAND_DNA_OPTION) {
              openBrandDnaDialog("create");
              return;
            }
            setSelectedBrandDnaId(e.target.value);
          }}
          aria-label={brandDnaT.selectorLabel}
          className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-xs font-medium text-foreground/70 outline-none focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]"
        >
          <option value="">{brandDnaT.selectorNone}</option>
          {brandDnaProfiles.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
          <option value={ADD_BRAND_DNA_OPTION}>{brandDnaT.selectorAdd}</option>
        </select>
      </div>

      <div className="flex items-center justify-between px-1 pb-0.5">
        <label
          title={t.attachHint}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground/50 transition-colors hover:bg-surface-2 hover:text-foreground/80"
        >
          <PaperclipIcon className="h-4 w-4" />
          {t.attach}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          type={activeSessionKind === "generating" ? "button" : "submit"}
          onClick={activeSessionKind === "generating" ? handleStopGeneration : undefined}
          disabled={activeSessionKind !== "generating" && !prompt.trim()}
          className="btn-primary relative flex h-9 w-9 items-center justify-center rounded-full disabled:cursor-not-allowed"
          aria-label={activeSessionKind === "generating" ? t.stopGeneration : t.generate}
        >
          {activeSessionKind === "generating" && (
            <span className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-foreground/50" />
          )}
          {activeSessionKind === "generating" ? (
            <StopIcon className="h-3.5 w-3.5" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );

  const errorBanner = activeError && (
    <p className="mb-3 rounded-xl bg-red-950/50 px-4 py-2.5 text-sm text-red-300">
      {activeError}
    </p>
  );

  return (
    <div
      className="h-dvh w-full bg-background md:p-3"
      onDragEnter={handleAppDragEnter}
      onDragOver={handleAppDragOver}
      onDragLeave={handleAppDragLeave}
      onDrop={handleAppDrop}
    >
      {draggingFile && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--accent-from)] bg-surface/90 px-10 py-8 text-center">
            <PaperclipIcon className="h-6 w-6 text-[var(--accent-from)]" />
            <p className="text-sm font-medium text-foreground">{t.dropReference}</p>
          </div>
        </div>
      )}
      <div className="flex h-full w-full overflow-hidden md:rounded-2xl md:border md:border-[color-mix(in_srgb,var(--accent-from)_40%,var(--color-line))] md:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent-from)_10%,transparent),0_24px_64px_-28px_color-mix(in_srgb,var(--accent-to)_45%,transparent)]">
        <Sidebar
          history={history}
          activeId={activeId}
          locale={locale}
          t={t}
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onSelect={handleSelectChat}
          onNewChat={handleNewChat}
          onDelete={handleDeleteChat}
          onOpenSettings={() => {
            setSettingsOpen(true);
            setMobileSidebarOpen(false);
          }}
          onOpenBrandDna={() => openBrandDnaDialog("list")}
          brandDnaLabel={brandDnaT.title}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label={t.openMenu}
              className="rounded-lg p-1.5 text-foreground/70 hover:bg-surface-2"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-foreground">{t.appName}</span>
          </div>

          {isChatView ? (
            <>
              <div className="custom-scroll flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
                  {turns.map((turn) => (
                    <div key={turn.id} className="flex flex-col gap-6">
                      <div className="flex justify-end">
                        <div className="max-w-lg rounded-2xl rounded-tr-sm bg-surface-2 px-4 py-2.5 text-sm text-foreground">
                          {turn.prompt}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="w-fit rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground/60">
                          {t.categories[turn.category] ?? turn.category}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={turn.image}
                          alt={turn.prompt}
                          className="w-full rounded-2xl border border-line object-cover"
                        />
                        <a
                          href={turn.image}
                          download={`ia-image-${turn.id}.${turn.image.startsWith("data:image/png") ? "png" : "jpg"}`}
                          className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground/60 hover:bg-surface-2 hover:text-foreground"
                        >
                          <DownloadIcon className="h-3.5 w-3.5" />
                          {t.download}
                        </a>
                      </div>
                    </div>
                  ))}

                  {activeSession && (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-end">
                        <div className="max-w-lg rounded-2xl rounded-tr-sm bg-surface-2 px-4 py-2.5 text-sm text-foreground">
                          {activeSession.displayPrompt}
                        </div>
                      </div>

                      {activeSession.kind === "clarifying" ? (
                        <ClarificationCard
                          questions={activeSession.questions}
                          loading={false}
                          onSubmit={handleClarificationSubmit}
                          t={t}
                        />
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="flex w-fit items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground/60">
                            <LoaderIcon className="h-3 w-3 animate-spin" />
                            {t.generating}
                          </span>
                          <div className="flex aspect-[4/3] w-full animate-pulse items-center justify-center rounded-2xl border border-line bg-surface-2">
                            <LoaderIcon className="h-8 w-8 animate-spin text-foreground/25" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={scrollBottomRef} />
                </div>
              </div>

              <div className="border-t border-line px-6 py-4">
                <div className="mx-auto w-full max-w-2xl">
                  {errorBanner}
                  {composer}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                  <h1
                    suppressHydrationWarning
                    className="text-3xl font-semibold tracking-tight text-foreground"
                  >
                    {getGreeting(t)}
                  </h1>
                  <p className="mt-2 text-foreground/50">{t.greetingSubtitle}</p>
                </div>

                {errorBanner}
                {composer}
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onClearHistory={handleClearHistory}
        t={t}
      />

      <BrandDnaDialog
        key={brandDnaDialogKey}
        open={brandDnaDialogOpen}
        initialView={brandDnaDialogView}
        onClose={() => setBrandDnaDialogOpen(false)}
        profiles={brandDnaProfiles}
        onSave={handleSaveBrandDna}
        onDelete={handleDeleteBrandDna}
        t={brandDnaT}
      />
    </div>
  );
}
