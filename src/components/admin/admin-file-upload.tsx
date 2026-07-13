"use client";

import { FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";
import type { UploadScope } from "@/lib/uploads";

type UploadResult = { url: string; fileName: string };

export async function uploadAdminFile(file: File, kind: "image" | "document", scope?: UploadScope) {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", kind);
  if (scope) body.set("scope", scope);

  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await response.json()) as UploadResult & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Не удалось загрузить файл");
  }

  return data;
}

export function AdminImageUpload({
  name,
  defaultValue = "",
  label = "Изображение",
  required = false,
  scope = "site-image",
  previewClassName = "relative aspect-video overflow-hidden rounded-2xl border border-border bg-background",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  required?: boolean;
  scope?: Extract<UploadScope, "site-image" | "product-image">;
  previewClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const saved = await uploadAdminFile(file, "image", scope);
      setValue(saved.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</span>
      <input type="hidden" name={name} value={value} required={required} />
      {value ? (
        <div className={previewClassName}>
          <ProductImage src={normalizeImageSrc(value)} alt="" fill sizes="320px" className="object-cover" />
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-petrol shadow-sm hover:bg-red-50 hover:text-red-600"
            aria-label="Удалить изображение"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">Изображение не загружено.</p>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol hover:bg-background disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {uploading ? "Загрузка…" : value ? "Заменить изображение" : "Загрузить изображение"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

export function AdminDocumentUpload({
  name,
  defaultValue = "",
  label,
}: {
  name: string;
  defaultValue?: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const saved = await uploadAdminFile(file, "document", "product-document");
      setValue(saved.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm">
          <FileText className="h-4 w-4 text-lime" />
          <a href={value} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-semibold text-petrol hover:text-lime">
            {value.split("/").pop()}
          </a>
          <button type="button" onClick={() => setValue("")} className="font-bold text-muted hover:text-red-600">
            Удалить
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted">Файл не прикреплён.</p>
      )}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol hover:bg-background disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Загрузка…" : `Загрузить ${label.toLowerCase()}`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
