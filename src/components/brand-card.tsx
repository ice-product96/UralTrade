import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";

type BrandCardItem = {
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export function BrandCard({ brand }: { brand: BrandCardItem }) {
  return (
    <Link
      href={`/catalog?brand=${brand.slug}`}
      title={brand.name}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10"
    >
      <div className="flex aspect-square items-center justify-center bg-background p-6">
        {brand.logoUrl ? (
          <ProductImage
            src={normalizeImageSrc(brand.logoUrl)}
            alt={brand.name}
            width={160}
            height={64}
            className="max-h-16 w-auto max-w-full object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-2xl font-black text-petrol">{brand.name.slice(0, 2)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-center text-base font-bold leading-snug text-graphite transition-colors group-hover:text-petrol">
          {brand.name}
        </div>
      </div>
    </Link>
  );
}
