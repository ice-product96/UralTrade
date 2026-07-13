import Image, { type ImageProps } from "next/image";
import { normalizeImageSrc, shouldUnoptimizeImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";

/** Внешние и загруженные фото — через <img>, остальное через next/image. */
export function ProductImage({ src, alt, className, fill, priority, width, height, style, ...props }: ImageProps) {
  const normalized = normalizeImageSrc(String(src));

  if (shouldUnoptimizeImage(normalized)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalized}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          className={cn("absolute inset-0 h-full w-full", className)}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalized}
        alt={alt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      {...props}
      src={normalized}
      alt={alt}
      className={className}
      fill={fill}
      priority={priority}
      width={width}
      height={height}
      style={style}
    />
  );
}
