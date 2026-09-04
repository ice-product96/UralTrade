import { absolutizeImportedHtml } from "@/lib/image-url";

const HAS_HTML_TAG = /<[a-z][\s\S]*>/i;
const HAS_ESCAPED_HTML_TAG = /&lt;\/?[a-zA-Z]/;

function escapePlainText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unescapeHtmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function sanitizeRichHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/** Готовит HTML описания товара: теги рендерятся, скрипты вырезаются. */
export function prepareRichHtml(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return "";

  const unescaped = HAS_ESCAPED_HTML_TAG.test(raw) ? unescapeHtmlEntities(raw) : raw;
  const html = HAS_HTML_TAG.test(unescaped) ? unescaped : escapePlainText(unescaped).replace(/\r\n|\r|\n/g, "<br>");

  return sanitizeRichHtml(absolutizeImportedHtml(html));
}

/** Текст без тегов — для meta, JSON-LD и кратких подписей. */
export function stripHtml(value: string | null | undefined) {
  const prepared = prepareRichHtml(value);
  if (!prepared) return "";

  return prepared
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
