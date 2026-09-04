import { ProductImage } from "@/components/product-image";
import { HOME_FEATURE_ICONS, type HomeFeatureIcon } from "@/lib/home-features";
import { HERO_TAGLINE, resolveHomeHeroFeatures, type HomeHeroFeature } from "@/lib/home-hero-features";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  features: HomeHeroFeature[];
};

function HomeFeatureIconGlyph({ icon }: { icon: string }) {
  const key: HomeFeatureIcon = icon in HOME_FEATURE_ICONS ? (icon as HomeFeatureIcon) : "wrench";
  const Icon = HOME_FEATURE_ICONS[key];
  return <Icon className="h-5 w-5" aria-hidden />;
}

function HeroFeatureCard({
  feature,
  className,
}: {
  feature: HomeHeroFeature;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-white px-4 py-1.5",
        className,
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/10 text-lime">
        <HomeFeatureIconGlyph icon={feature.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold leading-snug text-graphite">{feature.title}</div>
        {feature.text ? (
          <div className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-muted">{feature.text}</div>
        ) : null}
      </div>
    </div>
  );
}

export function HomeHero({ title, subtitle, imageUrl, features }: HomeHeroProps) {
  const heroFeatures = resolveHomeHeroFeatures(features);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3 lg:px-8 lg:py-2">
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
            className="aspect-[21/9] w-full object-cover sm:aspect-[4/1] lg:h-24 lg:max-h-24 lg:aspect-auto xl:h-28 xl:max-h-28"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-petrol/90 via-petrol/60 to-petrol/25" />
          <div className="absolute inset-0 flex items-center px-5 sm:px-8 lg:px-10">
            <p className="max-w-2xl text-balance text-base font-bold leading-tight text-white sm:text-xl lg:text-2xl">
              {HERO_TAGLINE}
            </p>
          </div>
        </div>

        <div
          className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Преимущества"
        >
          {heroFeatures.map((feature) => (
            <div key={feature.id ?? feature.title} className="w-[88%] shrink-0 snap-start sm:w-[70%]">
              <HeroFeatureCard feature={feature} className="h-full" />
            </div>
          ))}
        </div>

          <div className="mt-2 hidden gap-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:grid lg:grid-cols-4 [@media(max-height:850px)]:lg:hidden">
          {heroFeatures.map((feature, index) => (
            <HeroFeatureCard
              key={feature.id ?? feature.title}
              feature={feature}
              className={cn("rounded-none border-0 py-2 sm:px-5", index > 0 && "border-l border-border")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
