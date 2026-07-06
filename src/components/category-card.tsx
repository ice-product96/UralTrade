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
  sm: "rounded-[22px] p-3",
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
}: {
  category: CategoryCardItem;
  size?: keyof typeof sizeClasses;
  showDescription?: boolean;
}) {
  const image = normalizeImageSrc(category.imageUrl ?? "/demo/pump-1.svg");

  return (
    <Link
      href={`/catalog/${category.slug}`}
      className={cn(
        "group block overflow-hidden border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-petrol/10",
        sizeClasses[size],
      )}
    >
      <div className={cn("relative overflow-hidden bg-background", imageSizeClasses[size])}>
        <ProductImage
          src={image}
          alt={category.name}
          fill
          sizes={size === "lg" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 20vw, 50vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <div className="text-lg font-black text-graphite transition-colors group-hover:text-petrol">{category.name}</div>
        {showDescription && category.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{category.description}</p>
        ) : null}
      </div>
    </Link>
  );
}
