import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

type BrandCardItem = {
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export function BrandCard({ brand, mini = false }: { brand: BrandCardItem; mini?: boolean }) {
  return (
    <Link
      href={`/catalog?brand=${brand.slug}`}
      title={brand.name}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10",
        mini ? "rounded-[12px] sm:rounded-[16px]" : "rounded-[18px] sm:rounded-[24px]",
      )}
    >
      <div className={cn("flex items-center justify-center bg-background", mini ? "aspect-[2/1] p-1.5 sm:p-2" : "aspect-square p-4 sm:p-6")}>
        {brand.logoUrl ? (
          <ProductImage
            src={normalizeImageSrc(brand.logoUrl)}
            alt={brand.name}
            width={160}
            height={64}
            className={cn(
              "w-auto max-w-full object-contain transition duration-500 group-hover:scale-105",
              mini ? "max-h-6 sm:max-h-8" : "max-h-10 sm:max-h-16",
            )}
          />
        ) : (
          <span className={cn("font-black text-petrol", mini ? "text-base sm:text-lg" : "text-xl sm:text-2xl")}>
            {brand.name.slice(0, 2)}
          </span>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col", mini ? "p-1 sm:p-1.5" : "p-2.5 sm:p-4")}>
        <div
          className={cn(
            "text-center font-bold leading-snug text-graphite transition-colors group-hover:text-petrol",
            mini ? "line-clamp-1 text-[11px] sm:text-xs" : "text-sm sm:text-base",
          )}
        >
          {brand.name}
        </div>
      </div>
    </Link>
  );
}
