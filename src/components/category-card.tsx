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
}: {
  category: CategoryCardItem;
  size?: keyof typeof sizeClasses;
  showDescription?: boolean;
  compact?: boolean;
}) {
  const image = normalizeImageSrc(category.imageUrl ?? "/demo/pump-1.svg");

  return (
    <Link
      href={`/catalog/${category.slug}`}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10",
        compact ? "rounded-[24px] p-3" : sizeClasses[size],
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-background",
          compact ? "aspect-square rounded-[16px]" : imageSizeClasses[size],
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
      <div className={cn("flex flex-1 flex-col", compact ? "space-y-1 p-4 pt-3" : "mt-2 text-center sm:mt-4")}>
        <div
          className={cn(
            "font-bold leading-snug text-graphite transition-colors group-hover:text-petrol",
            compact ? "text-base" : "text-sm font-black sm:text-base lg:text-lg",
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
