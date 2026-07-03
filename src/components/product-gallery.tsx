"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[34px] border border-border bg-white p-4 shadow-xl shadow-petrol/5" ref={emblaRef}>
        <div className="flex">
          {safeImages.map((image) => (
            <div key={image.id} className="relative aspect-square min-w-0 flex-[0_0_100%] overflow-hidden rounded-[26px] bg-background">
              <Image src={image.url} alt={image.alt ?? productName} fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-6 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-petrol shadow-lg"
          aria-label="Предыдущее фото"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-6 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-petrol shadow-lg"
          aria-label="Следующее фото"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {safeImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => scrollTo(index)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white transition ${
              selectedIndex === index ? "border-lime ring-4 ring-lime/20" : "border-border"
            }`}
          >
            <Image src={image.url} alt={image.alt ?? productName} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
