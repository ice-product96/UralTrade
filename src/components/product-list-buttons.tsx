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
export function ProductCardActions({ productId, className }: { productId: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-end gap-2", className)}>
      {ACTIONS.map((action) => (
        <ExpandableListButton key={action.kind} action={action} productId={productId} />
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

function ExpandableListButton({ action, productId }: { action: ActionConfig; productId: string }) {
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
        "group/action inline-flex h-10 items-center justify-end rounded-full border bg-white/95 px-3 text-xs font-bold shadow-sm backdrop-blur transition-colors duration-200 hover:border-lime hover:text-lime",
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
