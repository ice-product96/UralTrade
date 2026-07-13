import Image, { type ImageProps } from "next/image";
import { normalizeImageSrc, shouldUnoptimizeImage } from "@/lib/image-url";

/** Внешние и загруженные фото грузим напрямую, без /_next/image (обход ограничений Next.js 16). */
export function ProductImage({ src, alt, ...props }: ImageProps) {
  const normalized = normalizeImageSrc(String(src));

  return (
    <Image
      {...props}
      src={normalized}
      alt={alt}
      unoptimized={shouldUnoptimizeImage(normalized)}
    />
  );
}
