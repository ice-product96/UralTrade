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

/** Путь для next/image: uploads остаются относительными (localPatterns в next.config). */
export function resolveImageSrc(src: string) {
  return normalizeImageSrc(src);
}

/** Пути /uploadedFiles/... в HTML описания → абсолютные URL источника. */
export function absolutizeImportedHtml(html: string) {
  return html
    .replace(/src=(["'])\/uploadedFiles\//g, `src=$1${IMPORT_IMAGE_HOST}/uploadedFiles/`)
    .replace(/src=(["'])\/\/ural-trade96\.ru\//g, `src=$1https://ural-trade96.ru/`);
}
