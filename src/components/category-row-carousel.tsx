"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useState, type ReactNode } from "react";

/** Горизонтальный ряд категорий с круговой (loop) прокруткой. */
export function CategoryRowCarousel({ children }: { children: ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    containScroll: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const frame = requestAnimationFrame(updateButtons);
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  const items = Children.toArray(children);
  if (items.length === 0) return null;

  const showArrows = items.length > 1;

  return (
    <div className="relative w-full min-w-0">
      <div ref={emblaRef} className="w-full overflow-hidden">
        <div className="-ml-3 flex items-stretch">
          {items.map((child, index) => (
            <div
              key={index}
              className="min-w-0 shrink-0 basis-[46%] pl-3 sm:basis-[28%] md:basis-[22%] lg:basis-[18%] xl:basis-[15%]"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Предыдущие подкатегории"
            className="absolute left-1 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-petrol shadow-lg backdrop-blur-sm transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0 sm:left-2 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Следующие подкатегории"
            className="absolute right-1 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-petrol shadow-lg backdrop-blur-sm transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0 sm:right-2 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
