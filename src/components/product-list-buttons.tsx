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
  mini = false,
}: {
  productId: string;
  className?: string;
  compact?: boolean;
  mini?: boolean;
}) {
  return (
    <div className={cn("flex items-end gap-1 sm:flex-col sm:gap-2", className)}>
      {ACTIONS.map((action) => (
        <ExpandableListButton key={action.kind} action={action} productId={productId} compact={compact} mini={mini} />
      ))}
    </div>
  );
}

/** Те же иконки в блоке покупки на странице товара. */
export function ProductPageActions({ productId, className }: { productId: string; className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      {ACTIONS.map((action) => (
        <ExpandableListButton key={action.kind} action={action} productId={productId} variant="page" />
      ))}
    </div>
  );
}

function ExpandableListButton({
  action,
  productId,
  compact = false,
  mini = false,
  variant = compact ? "card" : "page",
}: {
  action: ActionConfig;
  productId: string;
  compact?: boolean;
  mini?: boolean;
  variant?: "card" | "page";
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
        "group/action inline-flex items-center rounded-full border bg-white/95 text-xs font-bold shadow-sm backdrop-blur transition-colors duration-200 hover:border-lime hover:text-lime",
        variant === "page" &&
          "h-10 w-10 shrink-0 justify-center overflow-hidden transition-[max-width,padding] duration-300 ease-out hover:w-auto hover:max-w-[220px] hover:px-3 sm:justify-start",
        variant === "card" &&
          (mini
            ? "h-6 w-6 shrink-0 justify-center sm:h-7 sm:w-7"
            : "h-7 w-7 shrink-0 justify-center sm:h-8 sm:w-auto sm:min-w-8 sm:justify-end sm:px-3"),
        active ? "border-lime text-lime" : "border-border text-graphite",
      )}
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/action:mr-2 group-hover/action:max-w-[160px] group-hover/action:opacity-100">
        {label}
      </span>
      <Icon
        className={cn(
          "shrink-0 transition-transform duration-200",
          variant === "card" ? (mini ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4") : "h-4 w-4",
          active && "fill-current",
        )}
      />
    </button>
  );
}
