import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_INTRINSIC_WIDTH = 2172;
const LOGO_INTRINSIC_HEIGHT = 724;

type SiteLogoProps = {
  href?: string | null;
  height?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function SiteLogo({
  href = "/",
  height,
  className,
  imageClassName,
  priority = false,
}: SiteLogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="УралТрейд — запчасти, гидравлика, сервис"
      width={LOGO_INTRINSIC_WIDTH}
      height={LOGO_INTRINSIC_HEIGHT}
      priority={priority}
      className={cn("block w-auto max-w-none object-contain object-left", imageClassName ?? "h-11")}
      style={height != null ? { height: `${height}px`, width: "auto" } : undefined}
    />
  );

  const content = <span className={cn("inline-flex shrink-0 items-center", className)}>{image}</span>;

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="УралТрейд">
      {content}
    </Link>
  );
}
