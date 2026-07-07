"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ru">
      <body className="flex min-h-screen items-center justify-center bg-[#f5fafb] p-6 font-sans text-[#1a1a1a]">
        <div className="max-w-lg rounded-[28px] border border-[#dbe4e6] bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-black">Сайт временно недоступен</h1>
          <p className="mt-4 text-sm leading-6 text-[#5c6b73]">
            Не удалось загрузить данные каталога. Обычно это решается применением миграций базы данных после обновления.
          </p>
          {error.digest ? <p className="mt-3 text-xs text-[#8a9aa3]">Код: {error.digest}</p> : null}
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0f4c5c] px-6 text-sm font-bold text-white hover:bg-[#1a6b7c]"
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
