import { HomeHeroFeatureCarousel } from "@/components/home-hero-feature-carousel";
import { ProductImage } from "@/components/product-image";
import { HERO_TAGLINE, resolveHomeHeroCarouselFeatures, type HomeHeroFeature } from "@/lib/home-hero-features";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  features: HomeHeroFeature[];
};

export function HomeHero({ title, subtitle, imageUrl, features }: HomeHeroProps) {
  const carouselFeatures = resolveHomeHeroCarouselFeatures(features);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-8 lg:py-6">
        <div className="sr-only">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <p className="text-balance text-center text-lg font-bold leading-snug text-graphite sm:text-xl lg:text-left lg:text-2xl">
          {HERO_TAGLINE}
        </p>

        <div className={cn("mt-3 flex flex-col gap-3 sm:mt-4 sm:gap-4", "lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-stretch lg:gap-6")}>
          <HomeHeroFeatureCarousel features={carouselFeatures} />

          <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-3xl">
            <ProductImage
              src={imageUrl}
              alt={title}
              width={1320}
              height={440}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[21/9] w-full object-cover sm:aspect-[5/2] lg:h-full lg:min-h-[12.5rem] lg:object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
