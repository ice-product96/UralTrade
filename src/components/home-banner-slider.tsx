"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { HERO_BANNER_SIZE_CLASS } from "@/lib/home-hero-features";
import { normalizeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

export type HomeBannerSlide = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  buttonLabel: string;
  link: string;
  imageUrl: string;
};

const AUTOPLAY_MS = 6000;


export function HomeBannerSlider({ banners }: { banners: HomeBannerSlide[] }) {
  const multiple = banners.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: multiple, align: "start" });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !multiple || paused) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [emblaApi, multiple, paused]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner, index) => (
            <div key={banner.id} className="relative min-w-0 flex-[0_0_100%]">
              <ProductImage
                src={normalizeImageSrc(banner.imageUrl)}
                alt={banner.title}
                width={2400}
                height={600}
                sizes="(min-width: 1280px) 1280px, 100vw"
                className={cn(HERO_BANNER_SIZE_CLASS, "object-cover")}
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-petrol/90 via-petrol/55 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center gap-1 px-5 sm:gap-2 sm:px-8 lg:px-12">
                {banner.kicker ? (
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime sm:text-xs">{banner.kicker}</div>
                ) : null}
                <div className="max-w-2xl text-balance text-base font-black leading-tight text-white sm:text-2xl lg:text-3xl">{banner.title}</div>
                {banner.text ? (
                  <p className="hidden max-w-xl text-sm leading-6 text-white/85 sm:line-clamp-2">{banner.text}</p>
                ) : null}
                {banner.link ? (
                  <Link
                    href={banner.link}
                    className="mt-1 inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-lime px-4 text-xs font-bold text-white transition hover:bg-lime-hover sm:mt-2 sm:h-10 sm:px-5 sm:text-sm"
                  >
                    {banner.buttonLabel || "Подробнее"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {multiple ? (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Предыдущий баннер"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-petrol shadow-lg transition hover:text-lime lg:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Следующий баннер"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-petrol shadow-lg transition hover:text-lime lg:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Баннер ${index + 1}`}
                className={cn("h-1.5 rounded-full transition-all", index === selected ? "w-6 bg-white" : "w-1.5 bg-white/50")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
