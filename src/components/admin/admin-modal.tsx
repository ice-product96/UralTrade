"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type AdminModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export function AdminModal({ open, title, onClose, children, size = "md" }: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-graphite/55 backdrop-blur-sm" onClick={onClose} aria-label="Закрыть" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn("relative z-10 flex w-full flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl", sizes[size])}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-black text-graphite">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted transition hover:bg-background hover:text-graphite">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
