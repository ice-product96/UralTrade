"use client";

import { FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { uploadAdminFile, AdminDocumentUpload } from "@/components/admin/admin-file-upload";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";

type ImageItem = { url: string; alt?: string };
type DocumentItem = { title: string; url: string; fileName?: string };

function fileTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || fileName;
}

export function ProductImagesManager({
  images,
  onChange,
  productName,
}: {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  productName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    setError(null);

    try {
      const next = [...images];
      for (const file of Array.from(fileList)) {
        const saved = await uploadAdminFile(file, "image", "product-image");
        next.push({
          url: saved.url,
          alt: productName ? `${productName} фото ${next.length + 1}` : undefined,
        });
      }
      onChange(next);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple className="hidden" onChange={(event) => void handleFiles(event.target.files)} />

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="group relative overflow-hidden rounded-2xl border border-border bg-white">
              <div className="relative aspect-square">
                <ProductImage src={normalizeImageSrc(image.url)} alt={image.alt ?? "Фото товара"} fill sizes="160px" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-petrol shadow-sm hover:bg-red-50 hover:text-red-600"
                aria-label="Удалить фото"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="truncate px-3 py-2 text-xs text-muted">{image.url.split("/").pop()}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Фото пока не добавлены.</p>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol hover:bg-background disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {uploading ? "Загрузка…" : "Загрузить фото"}
      </button>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

export function ProductDocumentsManager({
  documents,
  onChange,
}: {
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    setError(null);

    try {
      const next = [...documents];
      for (const file of Array.from(fileList)) {
        const saved = await uploadAdminFile(file, "document", "product-document");
        next.push({
          title: fileTitle(saved.fileName),
          url: saved.url,
          fileName: saved.fileName,
        });
      }
      onChange(next);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(documents.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateTitle(index: number, title: string) {
    onChange(documents.map((item, itemIndex) => (itemIndex === index ? { ...item, title } : item)));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {documents.length ? (
        <div className="space-y-2">
          {documents.map((document, index) => (
            <div key={`${document.url}-${index}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-lime">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <input
                  value={document.title}
                  onChange={(event) => updateTitle(index, event.target.value)}
                  placeholder="Название инструкции"
                  className="admin-input bg-white py-2"
                />
                <div className="truncate text-xs text-muted">{document.fileName ?? document.url.split("/").pop()}</div>
              </div>
              <a href={document.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-petrol hover:text-lime">
                Открыть
              </a>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-petrol hover:bg-red-50 hover:text-red-600"
                aria-label="Удалить инструкцию"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Инструкции пока не добавлены.</p>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol hover:bg-background disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Загрузка…" : "Загрузить инструкцию"}
      </button>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

export function ProductFileFieldInput({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue: string;
  label: string;
}) {
  return <AdminDocumentUpload name={name} defaultValue={defaultValue} label={label} />;
}
