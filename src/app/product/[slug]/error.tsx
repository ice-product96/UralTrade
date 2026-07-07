"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-graphite">Не удалось загрузить товар</h1>
      <p className="mt-3 text-sm text-muted">Карточка временно недоступна. Попробуйте позже или выберите другой товар.</p>
      {error.digest ? <p className="mt-2 text-xs text-muted">Код: {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="h-11 rounded-full bg-petrol px-6 text-sm font-bold text-white">
          Повторить
        </button>
        <Link href="/catalog" className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-bold text-petrol">
          В каталог
        </Link>
      </div>
    </div>
  );
}
