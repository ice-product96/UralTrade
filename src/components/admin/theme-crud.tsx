"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetSiteTheme, updateSiteTheme } from "@/app/admin/actions";
import {
  SITE_THEME_DEFAULTS,
  SITE_THEME_FIELDS,
  type SiteThemeColors,
  type SiteThemeKey,
} from "@/lib/site-theme";

export function ThemeCrud({ colors: initialColors }: { colors: SiteThemeColors }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [colors, setColors] = useState(initialColors);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setColor(key: SiteThemeKey, value: string) {
    setColors((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updateSiteTheme(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMessage("Цвета сохранены и применены на сайте.");
      router.refresh();
    });
  }

  function handleReset() {
    if (!confirm("Сбросить цвета к стандартным значениям UralTrade?")) return;
    setMessage(null);
    setError(null);
    setColors(SITE_THEME_DEFAULTS);
    startTransition(async () => {
      const result = await resetSiteTheme();
      if (result?.error) {
        setError(result.error);
        return;
      }
      setMessage("Стандартные цвета восстановлены.");
      router.refresh();
    });
  }

  return (
    <section className="rounded-[30px] border border-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-graphite">Цвета сайта</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Настройте палитру витрины. После сохранения цвета сразу применятся на всём сайте.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-bold text-graphite transition hover:border-sale hover:text-sale disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" />
          Сбросить
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SITE_THEME_FIELDS.map((field) => (
            <label key={field.key} className="rounded-2xl border border-border bg-background p-4">
              <span className="block text-sm font-bold text-graphite">{field.label}</span>
              <span className="mt-1 block text-xs text-muted">{field.hint}</span>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="color"
                  value={normalizeColorInput(colors[field.key])}
                  onChange={(event) => setColor(field.key, event.target.value)}
                  className="h-12 w-14 cursor-pointer rounded-xl border border-border bg-white p-1"
                  aria-label={`${field.label}: выбор цвета`}
                />
                <input
                  name={`color_${field.key}`}
                  value={colors[field.key]}
                  onChange={(event) => setColor(field.key, event.target.value)}
                  placeholder="#000000"
                  className="admin-input font-mono uppercase"
                  pattern="#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})"
                  required
                />
              </div>
            </label>
          ))}
        </div>

        <div className="rounded-[28px] border border-border bg-background p-5">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-petrol">Превью</div>
          <div className="mt-4 overflow-hidden rounded-[24px] border border-border shadow-sm" style={{ background: colors.background }}>
            <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
              <div className="text-sm font-black" style={{ color: colors.graphite }}>
                UralTrade
              </div>
              <div className="flex gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: colors.lime }}>
                  В корзину
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: colors.petrol }}>
                  Каталог
                </span>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <div className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: colors.muted }}>
                  Артикул: UT-100
                </div>
                <div className="mt-2 text-base font-bold" style={{ color: colors.graphite }}>
                  Пример товара
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <div className="text-xl font-black" style={{ color: colors.petrol }}>
                    12 500 ₽
                  </div>
                  <div className="pb-0.5 text-sm line-through" style={{ color: colors.sale }}>
                    15 000 ₽
                  </div>
                </div>
                <div className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: colors.sale }}>
                  Скидка
                </div>
              </div>
              <div className="rounded-2xl p-4 text-white" style={{ background: colors.petrol }}>
                <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: colors.lime }}>
                  Каталог
                </div>
                <div className="mt-2 text-lg font-black">Гидроцилиндры</div>
                <p className="mt-2 text-sm text-white/75">Превью акцентного баннера категории.</p>
              </div>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm font-semibold text-sale">{error}</p> : null}
        {message ? <p className="text-sm font-semibold text-lime">{message}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-lime px-6 text-sm font-bold text-white hover:bg-lime-hover disabled:opacity-60"
        >
          {pending ? "Сохранение…" : "Сохранить цвета"}
        </button>
      </form>
    </section>
  );
}

function normalizeColorInput(value: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}
