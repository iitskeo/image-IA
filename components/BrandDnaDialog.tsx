"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { BrandDnaDictionary } from "@/lib/brand-dna-i18n";
import {
  MAX_BRAND_DNA_IMAGES,
  type BrandDna,
  type BrandDnaMode,
} from "@/lib/brand-dna";
import { extractDominantColors } from "@/lib/image-client";
import {
  ChevronLeftIcon,
  DnaIcon,
  LoaderIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "./icons";

type View = "list" | "create" | "edit";

interface BrandDnaDialogProps {
  open: boolean;
  initialView?: Extract<View, "list" | "create">;
  onClose: () => void;
  profiles: BrandDna[];
  onSave: (dna: BrandDna) => void;
  onDelete: (id: string) => void;
  t: BrandDnaDictionary;
}

interface UploadedImage {
  file: File;
  preview: string;
}

const fieldClass =
  "rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-transparent focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-from)_45%,transparent)]";

const MAX_LOGO_DIMENSION = 480;

export function BrandDnaDialog({
  open,
  initialView = "list",
  onClose,
  profiles,
  onSave,
  onDelete,
  t,
}: BrandDnaDialogProps) {
  const [view, setView] = useState<View>(initialView);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCreatedAt, setEditingCreatedAt] = useState<number | null>(null);
  const [mode, setMode] = useState<BrandDnaMode>("automatico");
  const [name, setName] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [whatTheyDo, setWhatTheyDo] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [logoImage, setLogoImage] = useState<string | undefined>(undefined);
  const [contactPhone, setContactPhone] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = view === "edit";
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Cerrar con click afuera es fácil de disparar sin querer y perdía lo que
  // se estaba editando/creando — se quitó ese cierre y en su lugar solo Esc
  // (o los botones explícitos) cierran el diálogo.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function resetForm() {
    setMode("automatico");
    setName("");
    setSocialLink("");
    setImages([]);
    setColors([]);
    setWhatTheyDo("");
    setTone("");
    setAudience("");
    setStyleNotes("");
    setLogoImage(undefined);
    setContactPhone("");
    setContactWebsite("");
    setContactAddress("");
    setError(null);
  }

  function startCreate() {
    resetForm();
    setEditingId(null);
    setEditingCreatedAt(null);
    setView("create");
  }

  function startEdit(profile: BrandDna) {
    setMode(profile.mode);
    setName(profile.name);
    setSocialLink(profile.socialLink ?? "");
    setImages([]);
    setColors(profile.colors);
    setWhatTheyDo(profile.whatTheyDo ?? "");
    setTone(profile.tone ?? "");
    setAudience(profile.audience ?? "");
    setStyleNotes(profile.styleNotes ?? "");
    setLogoImage(profile.logoImage);
    setContactPhone(profile.contactPhone ?? "");
    setContactWebsite(profile.contactWebsite ?? "");
    setContactAddress(profile.contactAddress ?? "");
    setError(null);
    setEditingId(profile.id);
    setEditingCreatedAt(profile.createdAt);
    setView("edit");
  }

  const addColor = useCallback((hex: string) => {
    setColors((prev) => (prev.includes(hex) ? prev : [...prev, hex].slice(0, 10)));
  }, []);

  function removeColor(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  // El input nativo type="color" dispara el evento "input" (y por lo tanto
  // React onChange) en cada frame mientras el usuario arrastra el cursor
  // dentro del selector — usar eso aquí llenaba la fila de colores con cada
  // posición intermedia. El evento nativo "change" solo dispara una vez,
  // cuando el usuario confirma/cierra el selector, así que lo escuchamos
  // directo en el DOM en vez de usar onChange.
  // El diálogo completo queda montado todo el tiempo (solo alterna
  // `open`/`view`), así que este input no existe todavía en el primer
  // render — sin `view` en las dependencias, el ref seguiría siendo null
  // para siempre y el listener nunca se conectaría.
  useEffect(() => {
    const node = colorInputRef.current;
    if (!node) return;
    function handleChange(e: Event) {
      addColor((e.target as HTMLInputElement).value);
    }
    node.addEventListener("change", handleChange);
    return () => node.removeEventListener("change", handleChange);
  }, [addColor, view]);

  async function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo procesar el logo.");
      ctx.drawImage(bitmap, 0, 0, width, height);
      setLogoImage(canvas.toDataURL("image/png"));
    } catch {
      setError("No se pudo procesar el logo. Intenta con otra imagen.");
    }
  }

  function handleLogoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleLogoFile(file);
  }

  async function extractColors(files: File[]) {
    if (!files.length) {
      setColors([]);
      return;
    }

    setError(null);
    setExtracting(true);

    try {
      setColors(await extractDominantColors(files));
    } finally {
      setExtracting(false);
    }
  }

  function addFiles(newFiles: File[]) {
    const validNew = newFiles.filter((f) => f.type.startsWith("image/"));
    if (!validNew.length) return;

    const next = [
      ...images,
      ...validNew.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ].slice(0, MAX_BRAND_DNA_IMAGES);

    setImages(next);
    void extractColors(next.map((img) => img.file));
  }

  function removeImage(index: number) {
    const removed = images[index];
    if (removed) URL.revokeObjectURL(removed.preview);

    const next = images.filter((_, i) => i !== index);
    setImages(next);
    void extractColors(next.map((img) => img.file));
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files ?? []));
  }

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);

    let inferredAudience: string | undefined;
    let inferredStyleNotes: string | undefined;

    // Al editar, los campos ya son visibles y editables a mano — no tiene
    // sentido volver a inferirlos y pisar una corrección manual del usuario.
    if (mode === "automatico" && !isEditing) {
      try {
        const formData = new FormData();
        formData.set("whatTheyDo", whatTheyDo.trim());
        formData.set("tone", tone.trim());
        formData.set("colors", JSON.stringify(colors));
        // Las imágenes se mandan de verdad para análisis visual, no solo
        // para extraer colores por pixeles.
        images.forEach((img) => formData.append("images", img.file));

        const res = await fetch("/api/brand-dna/infer", { method: "POST", body: formData });
        const data = await res.json();
        inferredAudience = data.audience;
        inferredStyleNotes = data.styleNotes;
      } catch {
        // Blindaje: si la inferencia falla, se guarda igual sin esos campos.
      }
    }

    const showExtraFields = mode === "manual" || isEditing;

    const dna: BrandDna = {
      id: editingId ?? crypto.randomUUID(),
      name: name.trim(),
      mode,
      socialLink: socialLink.trim() || undefined,
      colors,
      whatTheyDo: whatTheyDo.trim() || undefined,
      tone: tone.trim() || undefined,
      audience: showExtraFields ? audience.trim() || undefined : inferredAudience,
      styleNotes: showExtraFields ? styleNotes.trim() || undefined : inferredStyleNotes,
      logoImage: showExtraFields ? logoImage : undefined,
      contactPhone: showExtraFields ? contactPhone.trim() || undefined : undefined,
      contactWebsite: showExtraFields ? contactWebsite.trim() || undefined : undefined,
      contactAddress: showExtraFields ? contactAddress.trim() || undefined : undefined,
      createdAt: editingCreatedAt ?? Date.now(),
    };

    setSaving(false);
    onSave(dna);
    setView("list");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className="custom-scroll flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {view !== "list" && (
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label={t.back}
                disabled={saving}
                className="rounded-md p-1 text-foreground/50 hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? t.editTitle : t.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.back}
            className="rounded-md p-1 text-foreground/50 hover:bg-surface-2 hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {view === "list" ? (
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={startCreate}
              className="btn-primary flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              <DnaIcon className="h-4 w-4" />
              {t.createNew}
            </button>

            {profiles.length === 0 ? (
              <p className="py-6 text-center text-sm text-foreground/40">{t.empty}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {profiles.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1.5">
                        {p.colors.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="h-5 w-5 rounded-full border-2 border-surface"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-foreground/40">
                          {p.mode === "manual" ? t.modeManual : t.modeAuto}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        aria-label={t.edit}
                        className="rounded-md p-1.5 text-foreground/40 hover:bg-background hover:text-foreground"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        aria-label={t.delete}
                        className="rounded-md p-1.5 text-foreground/40 hover:bg-background hover:text-red-500"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="relative mt-5">
            {saving && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-surface/90 backdrop-blur-sm">
                <LoaderIcon className="h-6 w-6 animate-spin text-[var(--accent-from)]" />
                <p className="text-sm text-foreground/70">
                  {mode === "automatico" && !isEditing ? t.inferring : t.saving}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {!isEditing && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("automatico")}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      mode === "automatico"
                        ? "border-transparent bg-surface-2 ring-2 ring-[var(--accent-from)]"
                        : "border-line hover:bg-surface-2"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{t.modeAuto}</p>
                    <p className="text-xs text-foreground/50">{t.modeAutoDesc}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      mode === "manual"
                        ? "border-transparent bg-surface-2 ring-2 ring-[var(--accent-from)]"
                        : "border-line hover:bg-surface-2"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{t.modeManual}</p>
                    <p className="text-xs text-foreground/50">{t.modeManualDesc}</p>
                  </button>
                </div>
              )}

              {mode === "automatico" && !isEditing && (
                <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-foreground/60">
                  {t.autoInferNote}
                </p>
              )}

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground/80">{t.nameLabel}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={60}
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground/80">{t.linkLabel}</span>
                <input
                  type="text"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="instagram.com/…"
                  maxLength={200}
                  className={fieldClass}
                />
                <span className="text-xs text-foreground/40">{t.linkHelp}</span>
              </label>

              {!isEditing && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground/80">{t.uploadLabel}</span>
                  {images.length < MAX_BRAND_DNA_IMAGES && (
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors ${
                        dragging
                          ? "border-transparent bg-surface-2 ring-2 ring-[var(--accent-from)]"
                          : "border-line text-foreground/50 hover:bg-surface-2"
                      }`}
                    >
                      <UploadIcon className="h-4 w-4" />
                      {dragging ? t.uploadDrop : t.uploadLabel}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFilesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <span className="text-xs text-foreground/40">{t.uploadHelp}</span>

                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <div key={img.preview} className="group relative h-14 w-14">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.preview}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            aria-label={t.delete}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground/70 shadow ring-1 ring-line hover:text-foreground"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {extracting && <p className="text-xs text-foreground/50">{t.extracting}</p>}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground/80">{t.colorsLabel}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {colors.map((c, i) => (
                    <div key={`${c}-${i}`} className="group relative">
                      <span
                        className="block h-8 w-8 rounded-full border border-line"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(i)}
                        aria-label={t.delete}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-foreground/70 shadow ring-1 ring-line hover:text-foreground"
                      >
                        <XIcon className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  <label
                    aria-label={t.addColor}
                    title={t.addColor}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line text-foreground/40 hover:bg-surface-2 hover:text-foreground"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    <input ref={colorInputRef} type="color" defaultValue="#000000" className="hidden" />
                  </label>
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground/80">{t.q1}</span>
                <textarea
                  value={whatTheyDo}
                  onChange={(e) => setWhatTheyDo(e.target.value)}
                  rows={2}
                  maxLength={300}
                  className={`resize-none ${fieldClass}`}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground/80">{t.q2}</span>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  maxLength={150}
                  className={fieldClass}
                />
              </label>

              {(mode === "manual" || isEditing) && (
                <>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-foreground/80">{t.q3}</span>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      maxLength={200}
                      className={fieldClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-foreground/80">{t.q5}</span>
                    <textarea
                      value={styleNotes}
                      onChange={(e) => setStyleNotes(e.target.value)}
                      rows={2}
                      maxLength={300}
                      className={`resize-none ${fieldClass}`}
                    />
                  </label>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground/80">{t.logoLabel}</span>
                    {logoImage ? (
                      <div className="group relative h-16 w-16">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoImage}
                          alt=""
                          className="h-16 w-16 rounded-lg border border-line bg-background object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setLogoImage(undefined)}
                          aria-label={t.delete}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground/70 shadow ring-1 ring-line hover:text-foreground"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-4 py-2.5 text-sm text-foreground/50 hover:bg-surface-2">
                        <UploadIcon className="h-4 w-4" />
                        {t.logoUpload}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground/80">{t.contactLabel}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder={t.contactPhone}
                        maxLength={60}
                        className={fieldClass}
                      />
                      <input
                        type="text"
                        value={contactWebsite}
                        onChange={(e) => setContactWebsite(e.target.value)}
                        placeholder={t.contactWebsite}
                        maxLength={100}
                        className={fieldClass}
                      />
                      <input
                        type="text"
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        placeholder={t.contactAddress}
                        maxLength={150}
                        className={`col-span-2 ${fieldClass}`}
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim() || saving || extracting}
                className="btn-primary rounded-xl px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed"
              >
                {t.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
