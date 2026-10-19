"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie-consent-accepted";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function readAccepted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function CookieConsent() {
  // На сервере считаем согласие данным, чтобы баннер не мигал в SSR-разметке.
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);
  if (accepted) return null;

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    listeners.forEach((cb) => cb());
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-border bg-white p-4 text-sm text-muted shadow-2xl sm:flex-row sm:items-center">
        <p className="flex-1 leading-6">
          Сайт использует файлы cookie и обрабатывает IP-адрес. Продолжая пользоваться сайтом, вы соглашаетесь с{" "}
          <Link href="/privacy-policy" className="font-semibold text-petrol underline-offset-4 hover:underline">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="h-10 shrink-0 rounded-full bg-petrol px-6 text-sm font-bold text-white transition hover:bg-petrol-soft"
        >
          Хорошо
        </button>
      </div>
    </div>
  );
}

export function PersonalDataNote({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs leading-5 text-muted"}>
      Нажимая кнопку, вы даёте согласие на обработку персональных данных в соответствии с{" "}
      <Link href="/privacy-policy" target="_blank" className="font-semibold text-petrol underline-offset-4 hover:underline">
        политикой конфиденциальности
      </Link>
      .
    </p>
  );
}
