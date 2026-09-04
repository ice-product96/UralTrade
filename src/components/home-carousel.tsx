"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const MIN_LOOP_SLIDES = 14;

function expandForLoop(children: ReactNode, minSlides = MIN_LOOP_SLIDES) {
  const items = Children.toArray(children);
  if (items.length <= 1) return items;

  const slides: ReactNode[] = [];
  let copy = 0;
  while (slides.length < minSlides) {
    items.forEach((child, index) => {
      slides.push(isValidElement(child) ? cloneElement(child, { key: `loop-${copy}-${child.key ?? index}` }) : child);
    });
    copy += 1;
  }
  return slides;
}

export function HomeCarousel({
  children,
  itemClassName,
  previousLabel,
  nextLabel,
  dense = false,
}: {
  children: ReactNode;
  itemClassName: string;
  previousLabel: string;
  nextLabel: string;
  dense?: boolean;
}) {
  const slides = useMemo(() => expandForLoop(children), [children]);
  const loop = slides.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop,
    containScroll: loop ? false : "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(loop);
  const [canScrollNext, setCanScrollNext] = useState(loop);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(loop || emblaApi.canScrollPrev());
    setCanScrollNext(loop || emblaApi.canScrollNext());
  }, [emblaApi, loop]);

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
        <div className={dense ? "-ml-1.5 flex items-stretch sm:-ml-2.5" : "-ml-2 flex items-stretch sm:-ml-4"}>
          {slides.map((child, index) => (
            <div key={index} className={`min-w-0 ${dense ? "pl-1.5 sm:pl-2.5" : "pl-2 sm:pl-4"} ${itemClassName}`}>
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        aria-label={previousLabel}
        className={cn(
          "absolute -left-2 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-petrol shadow-lg transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0",
          dense ? "h-8 w-8 sm:-left-3 sm:h-9 sm:w-9" : "h-10 w-10 sm:-left-5",
        )}
      >
        <ChevronLeft className={dense ? "h-4 w-4" : "h-5 w-5"} />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        aria-label={nextLabel}
        className={cn(
          "absolute -right-2 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-petrol shadow-lg transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0",
          dense ? "h-8 w-8 sm:-right-3 sm:h-9 sm:w-9" : "h-10 w-10 sm:-right-5",
        )}
      >
        <ChevronRight className={dense ? "h-4 w-4" : "h-5 w-5"} />
      </button>
    </div>
  );
}
