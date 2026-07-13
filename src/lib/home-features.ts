import { Headphones, Package, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";

export const HOME_FEATURE_ICONS = {
  wrench: Wrench,
  truck: Truck,
  shield: ShieldCheck,
  package: Package,
  support: Headphones,
} as const;

export type HomeFeatureIcon = keyof typeof HOME_FEATURE_ICONS;

export const HOME_FEATURE_ICON_OPTIONS: Array<{ value: HomeFeatureIcon; label: string }> = [
  { value: "wrench", label: "Инструмент" },
  { value: "truck", label: "Доставка" },
  { value: "shield", label: "Гарантия" },
  { value: "package", label: "Товар" },
  { value: "support", label: "Поддержка" },
];

export function resolveHomeFeatureIcon(icon: string): LucideIcon {
  if (icon in HOME_FEATURE_ICONS) {
    return HOME_FEATURE_ICONS[icon as HomeFeatureIcon];
  }
  return Wrench;
}
