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
    <div className={cn("flex flex-col items-end gap-0.5 sm:gap-2", className)}>
      {ACTIONS.map((action) => (
        <ExpandableListButton key={action.kind} action={action} productId={productId} compact={compact} mini={mini} />
      ))}
    </div>
  );
}

/** Кнопки избранного и сравнения на странице товара — сразу с подписью. */
export function ProductPageActions({ productId, className }: { productId: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
      {ACTIONS.map((action) => (
        <PageListButton key={action.kind} action={action} productId={productId} />
      ))}
    </div>
  );
}

function PageListButton({ action, productId }: { action: ActionConfig; productId: string }) {
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
        "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border bg-white px-3 text-xs font-bold shadow-sm transition-colors hover:border-lime hover:text-lime sm:flex-none sm:px-4",
        active ? "border-lime text-lime" : "border-border text-graphite",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active && "fill-current")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function ExpandableListButton({
  action,
  productId,
  compact = false,
  mini = false,
}: {
  action: ActionConfig;
  productId: string;
  compact?: boolean;
  mini?: boolean;
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
        mini
          ? "h-6 w-6 shrink-0 justify-center sm:h-7 sm:w-7"
          : "h-7 w-7 shrink-0 justify-center sm:h-8 sm:w-auto sm:min-w-8 sm:justify-end sm:px-3",
        active ? "border-lime text-lime" : "border-border text-graphite",
      )}
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/action:mr-2 group-hover/action:max-w-[160px] group-hover/action:opacity-100">
        {label}
      </span>
      <Icon
        className={cn(
          "shrink-0 transition-transform duration-200",
          mini ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4",
          active && "fill-current",
        )}
      />
    </button>
  );
}
