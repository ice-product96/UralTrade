"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useState, type ReactNode } from "react";

export function HomeCarousel({
  children,
  itemClassName,
  previousLabel,
  nextLabel,
}: {
  children: ReactNode;
  itemClassName: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
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

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-3 flex items-stretch sm:-ml-4">
          {Children.map(children, (child) => (
            <div className={`min-w-0 pl-3 sm:pl-4 ${itemClassName}`}>{child}</div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        aria-label={previousLabel}
        className="absolute -left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-petrol shadow-lg transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0 sm:-left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        aria-label={nextLabel}
        className="absolute -right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-petrol shadow-lg transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0 sm:-right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
