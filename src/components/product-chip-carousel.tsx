import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Горизонтальный ряд чипов: на мобильной — прокрутка свайпом без стрелок, на десктопе — перенос строк. */
export function ProductChipCarousel({
  children,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const items = Children.toArray(children);
  if (items.length === 0) return null;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        className={cn(
          "flex gap-1.5 pb-1",
          "max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:[scrollbar-width:none] max-sm:[-ms-overflow-style:none] max-sm:[&::-webkit-scrollbar]:hidden",
          "sm:flex-wrap sm:overflow-visible",
        )}
        aria-label={ariaLabel}
      >
        {items.map((child, index) => (
          <div key={index} className="max-sm:snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
