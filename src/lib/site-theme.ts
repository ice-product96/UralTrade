export const SITE_THEME_KEYS = [
  "background",
  "foreground",
  "graphite",
  "petrol",
  "petrol-soft",
  "lime",
  "lime-hover",
  "sale",
  "sale-hover",
  "sale-soft",
  "border",
  "surface",
  "muted",
] as const;

export type SiteThemeKey = (typeof SITE_THEME_KEYS)[number];
export type SiteThemeColors = Record<SiteThemeKey, string>;

export const SITE_THEME_DEFAULTS: SiteThemeColors = {
  background: "#f5fafb",
  foreground: "#181c20",
  graphite: "#181c20",
  petrol: "#1a365d",
  "petrol-soft": "#234e85",
  lime: "#257d74",
  "lime-hover": "#1e6a62",
  sale: "#dc2626",
  "sale-hover": "#b91c1c",
  "sale-soft": "#fef2f2",
  border: "#dce8ea",
  surface: "#ffffff",
  muted: "#63737a",
};

export const SITE_THEME_FIELDS: Array<{ key: SiteThemeKey; label: string; hint: string }> = [
  { key: "background", label: "Фон страницы", hint: "Общий фон сайта" },
  { key: "surface", label: "Карточки / панели", hint: "Белые блоки контента" },
  { key: "foreground", label: "Основной текст", hint: "Цвет обычного текста" },
  { key: "graphite", label: "Заголовки", hint: "Крупные заголовки" },
  { key: "muted", label: "Приглушённый текст", hint: "Подписи и второстепенный текст" },
  { key: "border", label: "Границы", hint: "Рамки и разделители" },
  { key: "petrol", label: "Основной синий", hint: "Шапка категорий, акценты навигации" },
  { key: "petrol-soft", label: "Синий светлее", hint: "Второстепенные синие элементы" },
  { key: "lime", label: "Акцент", hint: "Кнопки, бейджи, активные состояния" },
  { key: "lime-hover", label: "Акцент при наведении", hint: "Hover для акцентных кнопок" },
  { key: "sale", label: "Скидка", hint: "Цены со скидкой и бейдж «Скидка»" },
  { key: "sale-hover", label: "Скидка при наведении", hint: "Hover для скидочных элементов" },
  { key: "sale-soft", label: "Фон скидки", hint: "Мягкий фон рядом со скидкой" },
];

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(value: string) {
  return HEX_RE.test(value.trim());
}

export function normalizeHexColor(value: string) {
  const raw = value.trim();
  if (!isHexColor(raw)) return null;
  if (raw.length === 4) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return raw.toLowerCase();
}

export function mergeSiteThemeColors(input: unknown): SiteThemeColors {
  const source = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const colors = { ...SITE_THEME_DEFAULTS };

  for (const key of SITE_THEME_KEYS) {
    const value = source[key];
    if (typeof value !== "string") continue;
    const normalized = normalizeHexColor(value);
    if (normalized) colors[key] = normalized;
  }

  return colors;
}

export function buildSiteThemeCss(colors: SiteThemeColors) {
  const lines = SITE_THEME_KEYS.map((key) => `  --${key}: ${colors[key]};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

export function parseSiteThemeForm(formData: FormData): SiteThemeColors {
  const colors = { ...SITE_THEME_DEFAULTS };
  const errors: string[] = [];

  for (const field of SITE_THEME_FIELDS) {
    const raw = String(formData.get(`color_${field.key}`) ?? "").trim();
    if (!raw) {
      errors.push(`Не задан цвет «${field.label}»`);
      continue;
    }
    const normalized = normalizeHexColor(raw);
    if (!normalized) {
      errors.push(`Некорректный цвет «${field.label}»: ${raw}`);
      continue;
    }
    colors[field.key] = normalized;
  }

  if (errors.length) throw new Error(errors.join(". "));
  return colors;
}
