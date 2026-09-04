import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

type CategoryCardItem = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

const sizeClasses = {
  sm: "rounded-[18px] p-2 sm:rounded-[22px] sm:p-3",
  md: "rounded-[28px] p-4",
  lg: "rounded-[32px] p-5",
};

const imageSizeClasses = {
  sm: "aspect-[4/3] rounded-[16px]",
  md: "aspect-[4/3] rounded-[20px]",
  lg: "aspect-[5/4] rounded-[24px]",
};

export function CategoryCard({
  category,
  size = "md",
  showDescription = true,
  compact = false,
  mini = false,
}: {
  category: CategoryCardItem;
  size?: keyof typeof sizeClasses;
  showDescription?: boolean;
  compact?: boolean;
  mini?: boolean;
}) {
  const image = normalizeImageSrc(category.imageUrl ?? "/demo/pump-1.svg");

  return (
    <Link
      href={`/catalog/${category.slug}`}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10",
        compact
          ? mini
            ? "rounded-[12px] p-1.5 sm:rounded-[16px] sm:p-2"
            : "rounded-[18px] p-2 sm:rounded-[24px] sm:p-3"
          : sizeClasses[size],
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-background",
          compact
            ? mini
              ? "aspect-[2/1] rounded-[8px] sm:rounded-[10px]"
              : "aspect-square rounded-[12px] sm:rounded-[16px]"
            : imageSizeClasses[size],
        )}
      >
        <ProductImage
          src={image}
          alt={category.name}
          fill
          sizes={compact ? "(min-width: 1280px) 20vw, (min-width: 640px) 47vw, 86vw" : size === "lg" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 20vw, 50vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          compact
            ? mini
              ? "space-y-0 p-1 pt-1 sm:p-1.5 sm:pt-1.5"
              : "space-y-0.5 p-2.5 pt-2 sm:space-y-1 sm:p-4 sm:pt-3"
            : "mt-2 text-center sm:mt-4",
        )}
      >
        <div
          className={cn(
            "font-bold leading-snug text-graphite transition-colors group-hover:text-petrol",
            compact
              ? mini
                ? "line-clamp-1 text-[11px] sm:text-xs"
                : "text-sm sm:text-base"
              : "text-sm font-black sm:text-base lg:text-lg",
          )}
        >
          {category.name}
        </div>
        {showDescription && category.description ? (
          <p className={cn("line-clamp-2 text-sm text-muted", compact ? "text-center" : "mt-2")}>{category.description}</p>
        ) : null}
      </div>
    </Link>
  );
}
