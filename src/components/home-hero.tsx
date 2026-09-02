import { ProductImage } from "@/components/product-image";
import { resolveHomeFeatureIcon } from "@/lib/home-features";
import { HERO_TAGLINE, resolveHomeHeroFeatures, type HomeHeroFeature } from "@/lib/home-hero-features";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  features: HomeHeroFeature[];
};

export function HomeHero({ title, subtitle, imageUrl, features }: HomeHeroProps) {
  const heroFeatures = resolveHomeHeroFeatures(features);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-8 lg:py-6">
        <div className="sr-only">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-3xl">
          <ProductImage
            src={imageUrl}
            alt={title}
            width={1320}
            height={440}
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="aspect-[21/9] w-full object-cover sm:aspect-[5/2]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-petrol/90 via-petrol/60 to-petrol/25" />
          <div className="absolute inset-0 flex items-center px-5 sm:px-8 lg:px-10">
            <p className="max-w-2xl text-balance text-xl font-bold leading-tight text-white sm:text-2xl lg:text-4xl">
              {HERO_TAGLINE}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3",
            "lg:mt-4 lg:grid-cols-4 lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border lg:bg-white lg:shadow-sm",
          )}
        >
          {heroFeatures.map((feature, index) => {
            const Icon = resolveHomeFeatureIcon(feature.icon);

            return (
              <div
                key={feature.id ?? feature.title}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 sm:px-5 sm:py-4",
                  "lg:rounded-none lg:border-0 lg:shadow-none",
                  index > 0 && "lg:border-l lg:border-border",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/10 text-lime">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold leading-snug text-graphite sm:text-sm">{feature.title}</div>
                  {feature.text ? (
                    <div className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted sm:text-xs sm:leading-5">
                      {feature.text}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
