"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateHomePage } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin/admin-file-upload";

type FeatureRow = {
  id?: string;
  title: string;
  text: string;
  icon: string;
  sortOrder: number;
};

type HomePageRow = {
  title: string;
  subtitle: string | null;
  imageUrl: string;
};

const ICON_OPTIONS = [
  { value: "wrench", label: "Инструмент" },
  { value: "truck", label: "Доставка" },
  { value: "shield", label: "Гарантия" },
  { value: "package", label: "Товар" },
  { value: "support", label: "Поддержка" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-petrol">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function HomeContentCrud({ homePage, features }: { homePage: HomePageRow; features: FeatureRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [featureRows, setFeatureRows] = useState<FeatureRow[]>(features);

  useEffect(() => {
    setFeatureRows(features);
  }, [features]);

  function addFeature() {
    setFeatureRows((rows) => [
      ...rows,
      {
        title: "",
        text: "",
        icon: "wrench",
        sortOrder: (rows.length + 1) * 10,
      },
    ]);
  }

  function updateFeature(index: number, patch: Partial<FeatureRow>) {
    setFeatureRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function removeFeature(index: number) {
    setFeatureRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set(
      "featuresJson",
      JSON.stringify(
        featureRows
          .map((row, index) => ({
            title: row.title.trim(),
            text: row.text.trim(),
            icon: row.icon,
            sortOrder: (index + 1) * 10,
          }))
          .filter((row) => row.title && row.text),
      ),
    );

    startTransition(async () => {
      try {
        setError(null);
        await updateHomePage(formData);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Не удалось сохранить главную");
      }
    });
  }

  return (
    <section className="rounded-[30px] border border-border bg-white p-6">
      <div>
        <h1 className="text-3xl font-black text-graphite">Главная страница</h1>
        <p className="mt-2 text-sm text-muted">Заголовок, описание, фото и плашки в верхнем блоке сайта.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4">
        <Section title="Контент">
          <input name="title" required defaultValue={homePage.title} placeholder="Заголовок" className="admin-input bg-white" />
          <textarea name="subtitle" defaultValue={homePage.subtitle ?? ""} rows={3} placeholder="Подзаголовок" className="admin-textarea bg-white" />
        </Section>

        <Section title="Фото">
          <AdminImageUpload name="imageUrl" defaultValue={homePage.imageUrl} label="Изображение справа" required scope="site-image" />
        </Section>

        <Section title="Плашки">
          <div className="space-y-3">
            {featureRows.length ? (
              featureRows.map((feature, index) => (
                <div key={`${feature.id ?? "new"}-${index}`} className="rounded-2xl border border-border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-graphite">Плашка {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-petrol hover:bg-red-50 hover:text-red-600"
                      aria-label="Удалить плашку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3">
                    <select
                      value={feature.icon}
                      onChange={(event) => updateFeature(index, { icon: event.target.value })}
                      className="admin-input bg-white"
                    >
                      {ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={feature.title}
                      onChange={(event) => updateFeature(index, { title: event.target.value })}
                      placeholder="Заголовок"
                      className="admin-input bg-white"
                    />
                    <textarea
                      value={feature.text}
                      onChange={(event) => updateFeature(index, { text: event.target.value })}
                      rows={2}
                      placeholder="Описание"
                      className="admin-textarea bg-white"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Плашки пока не добавлены.</p>
            )}
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol hover:bg-background"
          >
            <Plus className="h-4 w-4" />
            Добавить плашку
          </button>
        </Section>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-lime px-6 text-sm font-bold text-white hover:bg-lime-hover disabled:opacity-60"
        >
          {pending ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </section>
  );
}
