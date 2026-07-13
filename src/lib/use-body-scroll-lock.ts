"use client";

import { useEffect } from "react";

/** Блокирует прокрутку страницы, пока открыт оверлей (меню, фильтр, модалка). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
