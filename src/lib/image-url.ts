const IMPORT_IMAGE_HOST = "https://ural-trade96.ru";

/** Нормализует URL изображений с импортированного каталога. */
export function normalizeImageSrc(src: string) {
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/uploadedFiles/")) return `${IMPORT_IMAGE_HOST}${src}`;
  return src;
}

export function isExternalProductImage(src: string) {
  const normalized = normalizeImageSrc(src);
  return normalized.startsWith("http://") || normalized.startsWith("https://");
}

/** Только внешний каталог ural-trade96.ru — без next/image. Локальные /uploads/ оптимизируются. */
export function shouldUnoptimizeImage(src: string) {
  return isExternalProductImage(normalizeImageSrc(src));
}

/** Абсолютный URL для next/image (uploads лежат вне public, отдаются через route). */
export function resolveImageSrc(src: string) {
  const normalized = normalizeImageSrc(src);
  if (normalized.startsWith("/uploads/")) {
    const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    return `${base}${normalized}`;
  }
  return normalized;
}

/** Пути /uploadedFiles/... в HTML описания → абсолютные URL источника. */
export function absolutizeImportedHtml(html: string) {
  return html
    .replace(/src=(["'])\/uploadedFiles\//g, `src=$1${IMPORT_IMAGE_HOST}/uploadedFiles/`)
    .replace(/src=(["'])\/\/ural-trade96\.ru\//g, `src=$1https://ural-trade96.ru/`);
}
