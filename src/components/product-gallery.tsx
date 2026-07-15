"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const safeImages = images.length ? images : [{ id: "fallback", url: "/demo/pump-1.svg", alt: productName }];

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  emblaApi?.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[22px] border border-border bg-white p-2.5 shadow-xl shadow-petrol/5 sm:p-3" ref={emblaRef}>
        <div className="flex">
          {safeImages.map((image) => (
            <div key={image.id} className="relative aspect-square min-w-0 flex-[0_0_100%] overflow-hidden rounded-[18px] bg-background">
              <ProductImage src={normalizeImageSrc(image.url)} alt={image.alt ?? productName} fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-petrol shadow-lg sm:left-4 sm:h-10 sm:w-10"
          aria-label="Предыдущее фото"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-petrol shadow-lg sm:right-4 sm:h-10 sm:w-10"
          aria-label="Следующее фото"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {safeImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => scrollTo(index)}
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-white transition sm:h-16 sm:w-16 ${
              selectedIndex === index ? "border-lime ring-2 ring-lime/25" : "border-border"
            }`}
          >
            <ProductImage src={normalizeImageSrc(image.url)} alt={image.alt ?? productName} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
