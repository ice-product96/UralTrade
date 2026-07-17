"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadAdminFile } from "@/components/admin/admin-file-upload";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";

export type ServiceExampleItem = {
  title: string;
  description?: string;
  imageUrl: string;
};

export function ServiceExamplesManager({
  examples,
  onChange,
}: {
  examples: ServiceExampleItem[];
  onChange: (examples: ServiceExampleItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    setError(null);

    try {
      const next = [...examples];
      for (const file of Array.from(fileList)) {
        const saved = await uploadAdminFile(file, "image", "site-image");
        next.push({
          title: file.name.replace(/\.[^.]+$/, ""),
          description: "",
          imageUrl: saved.url,
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

  function updateAt(index: number, patch: Partial<ServiceExampleItem>) {
    onChange(examples.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeAt(index: number) {
    onChange(examples.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleFiles(event.target.files)} />

      {examples.length ? (
        <div className="space-y-3">
          {examples.map((example, index) => (
            <div key={`${example.imageUrl}-${index}`} className="grid gap-3 rounded-2xl border border-border bg-background p-3 sm:grid-cols-[88px_1fr_auto]">
              <div className="relative h-20 w-full overflow-hidden rounded-xl bg-white sm:h-[88px] sm:w-[88px]">
                <ProductImage src={normalizeImageSrc(example.imageUrl)} alt={example.title} fill sizes="88px" className="object-cover" />
              </div>
              <div className="min-w-0 space-y-2">
                <input
                  value={example.title}
                  onChange={(event) => updateAt(index, { title: event.target.value })}
                  placeholder="Название примера"
                  className="admin-input bg-white py-2"
                />
                <textarea
                  value={example.description ?? ""}
                  onChange={(event) => updateAt(index, { description: event.target.value })}
                  placeholder="Краткое описание работы"
                  rows={2}
                  className="admin-textarea bg-white py-2"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full border border-border text-petrol hover:bg-red-50 hover:text-red-600"
                aria-label="Удалить пример"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Примеры работ пока не добавлены.</p>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-white disabled:opacity-60"
      >
        <ImagePlus className="h-4 w-4" />
        {uploading ? "Загрузка…" : "Добавить фото примера"}
      </button>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
