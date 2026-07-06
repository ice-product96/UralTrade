import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  href?: string | null;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const LOGO_WIDTH = 200;
const LOGO_HEIGHT = 67;

export function SiteLogo({
  href = "/",
  width = LOGO_WIDTH,
  height = LOGO_HEIGHT,
  className,
  imageClassName,
  priority = false,
}: SiteLogoProps) {
  const image = (
    <span className={cn("inline-flex overflow-hidden rounded-xl bg-black", className)}>
      <Image
        src="/logo.png"
        alt="УралТрейд — запчасти, гидравлика, сервис"
        width={width}
        height={height}
        priority={priority}
        className={cn("h-auto w-auto object-contain", imageClassName)}
      />
    </span>
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0" aria-label="УралТрейд">
      {image}
    </Link>
  );
}
