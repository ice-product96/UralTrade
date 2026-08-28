"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Children, type ReactNode } from "react";

/** Горизонтальный ряд категорий с круговой (loop) прокруткой. */
export function CategoryRowCarousel({ children }: { children: ReactNode }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    containScroll: false,
  });

  const items = Children.toArray(children);
  if (items.length === 0) return null;

  return (
    <div className="w-full min-w-0 overflow-hidden">
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
    </div>
  );
}
