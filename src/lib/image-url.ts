/** Нормализует URL изображений с импортированного каталога (//host → https://host). */
export function normalizeImageSrc(src: string) {
  if (src.startsWith("//")) return `https:${src}`;
  return src;
}

export function isExternalProductImage(src: string) {
  const normalized = normalizeImageSrc(src);
  return normalized.startsWith("http://") || normalized.startsWith("https://");
}
