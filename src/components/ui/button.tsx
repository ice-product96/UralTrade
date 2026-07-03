import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-lime text-white hover:bg-lime-hover shadow-lg shadow-lime/20",
  secondary: "bg-petrol text-white hover:bg-petrol-soft",
  ghost: "bg-white text-petrol ring-1 ring-border hover:bg-background",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
