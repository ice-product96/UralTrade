"use client";

import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-white p-10 text-center text-muted">
        Вопросы пока не добавлены.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = openId === item.id;
        return (
          <article
            key={item.id}
            className={cn(
              "overflow-hidden rounded-[24px] border bg-white shadow-sm transition duration-300",
              open ? "border-lime/40 shadow-lg shadow-lime/10" : "border-border hover:border-petrol/20",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
              aria-expanded={open}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-background text-sm font-black text-petrol">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-base font-black text-graphite sm:text-lg">{item.question}</span>
                  <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 text-petrol transition-transform duration-300", open && "rotate-180")} />
                </span>
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border/80 px-5 pb-5 pt-4 sm:px-6 sm:pl-[4.75rem]">
                  <p className="whitespace-pre-line text-sm leading-7 text-muted sm:text-base">{item.answer}</p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function FaqPageIntro({ title, description }: { title: string; description?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-petrol px-5 py-8 text-white sm:rounded-[34px] sm:px-8 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,173,22,0.22),transparent_42%)]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-lime sm:text-sm">
          <MessageCircleQuestion className="h-4 w-4" />
          FAQ
        </div>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">{description}</p> : null}
      </div>
    </div>
  );
}
