import { ProductImage } from "@/components/product-image";
import { resolveHomeFeatureIcon } from "@/lib/home-features";
import { resolveHomeHeroFeatures, type HomeHeroFeature } from "@/lib/home-hero-features";
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

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-3xl">
          <ProductImage
            src={imageUrl}
            alt={title}
            width={1320}
            height={440}
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="aspect-[21/9] w-full object-cover sm:aspect-[5/2]"
            priority
          />
        </div>

        <div
          className={cn(
            "mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3",
            "lg:mt-4 lg:grid-cols-4 lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border lg:bg-white lg:shadow-sm",
          )}
        >
          {heroFeatures.map((feature, index) => {
            const Icon = resolveHomeFeatureIcon(feature.icon);

            return (
              <div
                key={feature.id ?? feature.title}
                className={cn(
                  "flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-white p-3 sm:p-4",
                  "lg:rounded-none lg:border-0 lg:shadow-none",
                  index > 0 && "lg:border-l lg:border-border",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/10 text-lime sm:h-11 sm:w-11">
                  <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
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
