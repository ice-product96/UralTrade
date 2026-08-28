"use client";

import { BarChart3, Heart, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { COMPARE_LIMIT, toggleProductList, type ProductListKind } from "@/lib/product-lists";
import { useProductList } from "@/lib/use-shop-storage";
import { cn } from "@/lib/utils";

type ActionConfig = {
  kind: ProductListKind;
  icon: LucideIcon;
  activeLabel: string;
  idleLabel: string;
};

const ACTIONS: ActionConfig[] = [
  { kind: "favorites", icon: Heart, activeLabel: "В избранном", idleLabel: "В избранное" },
  { kind: "compare", icon: BarChart3, activeLabel: "В сравнении", idleLabel: "К сравнению" },
];

function useToggle(kind: ProductListKind, productId: string) {
  const ids = useProductList(kind);
  const [limitReached, setLimitReached] = useState(false);
  const active = ids.includes(productId);

  function toggle() {
    const result = toggleProductList(kind, productId);
    setLimitReached(result.limitReached);
  }

  return { active, limitReached, toggle };
}

/** Иконки поверх карточки: по наведению раскрываются вместе с подписью. */
export function ProductCardActions({
  productId,
  className,
  compact = false,
}: {
  productId: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-end gap-1.5 sm:gap-2", className)}>
      {ACTIONS.map((action) => (
        <ExpandableListButton key={action.kind} action={action} productId={productId} compact={compact} />
      ))}
    </div>
  );
}

/** Те же иконки в блоке покупки на странице товара. */
export function ProductPageActions({ productId, className }: { productId: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {ACTIONS.map((action) => (
        <ExpandableListButton key={action.kind} action={action} productId={productId} />
      ))}
    </div>
  );
}

function ExpandableListButton({
  action,
  productId,
  compact = false,
}: {
  action: ActionConfig;
  productId: string;
  compact?: boolean;
}) {
  const { active, limitReached, toggle } = useToggle(action.kind, productId);
  const Icon = action.icon;
  const label = limitReached ? `Максимум ${COMPARE_LIMIT}` : active ? action.activeLabel : action.idleLabel;

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "group/action inline-flex items-center justify-center rounded-full border bg-white/95 text-xs font-bold shadow-sm backdrop-blur transition-colors duration-200 hover:border-lime hover:text-lime sm:justify-end sm:px-3",
        compact ? "h-8 w-8" : "h-8 w-8 sm:h-10",
        active ? "border-lime text-lime" : "border-border text-graphite",
      )}
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/action:mr-2 group-hover/action:max-w-[160px] group-hover/action:opacity-100">
        {label}
      </span>
      <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", active && "fill-current")} />
    </button>
  );
}
