import type { HomeFeatureIcon } from "@/lib/home-features";

export type HomeHeroFeature = {
  id?: string;
  title: string;
  text: string;
  icon: string;
  sortOrder: number;
};

export const HERO_TAGLINE = "Онлайн-маркет гидравлического оборудования";

export const CAROUSEL_FEATURE_TITLES = [
  "Оригинальные товары с гарантией",
  "Подбор по параметрам",
  "Консультация",
  "Доставка по РФ",
] as const;

export const DEFAULT_HOME_HERO_FEATURES: HomeHeroFeature[] = [
  {
    title: "Подбор по параметрам",
    text: "Фильтры по характеристикам и брендам",
    icon: "wrench",
    sortOrder: 10,
  },
  {
    title: "Доставка по РФ",
    text: "Отправка до транспортной компании",
    icon: "truck",
    sortOrder: 20,
  },
  {
    title: "Консультация",
    text: "Поможем подобрать оборудование",
    icon: "support",
    sortOrder: 30,
  },
  {
    title: "Оригинальные товары с гарантией",
    text: "Работаем с проверенными поставщиками",
    icon: "shield",
    sortOrder: 40,
  },
];

const REQUIRED_TITLES = DEFAULT_HOME_HERO_FEATURES.map((feature) => feature.title);

export function resolveHomeHeroFeatures(features: HomeHeroFeature[]): HomeHeroFeature[] {
  return REQUIRED_TITLES.map((title, index) => {
    const fromDb = features.find((feature) => feature.title.trim() === title);
    return fromDb ?? DEFAULT_HOME_HERO_FEATURES[index]!;
  });
}

export function resolveHomeHeroCarouselFeatures(features: HomeHeroFeature[]): HomeHeroFeature[] {
  return CAROUSEL_FEATURE_TITLES.map((title) => {
    const fromDb = features.find((feature) => feature.title.trim() === title);
    const fromDefault = DEFAULT_HOME_HERO_FEATURES.find((feature) => feature.title === title);
    return fromDb ?? fromDefault!;
  });
}

export function isHomeFeatureIcon(value: string): value is HomeFeatureIcon {
  return ["wrench", "truck", "shield", "package", "support"].includes(value);
}
