"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, slugify } from "@/lib/utils";

type SlugFieldProps = {
  sourceName: string;
  defaultValue?: string | null;
  name?: string;
  className?: string;
  prefix?: string;
};

function findSource(input: HTMLInputElement | null, sourceName: string) {
  return input?.form?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${sourceName}"]`) ?? null;
}

export function SlugField({ sourceName, defaultValue, name = "slug", className, prefix }: SlugFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = (defaultValue ?? "").trim();
  const [value, setValue] = useState(initial);
  const [auto, setAuto] = useState(!initial);

  useEffect(() => {
    if (!auto) return;
    const source = findSource(inputRef.current, sourceName);
    if (!source) return;

    const sync = () => setValue(slugify(source.value));
    source.addEventListener("input", sync);
    return () => source.removeEventListener("input", sync);
  }, [auto, sourceName]);

  function regenerate() {
    const source = findSource(inputRef.current, sourceName);
    if (!source) return;
    setAuto(true);
    setValue(slugify(source.value));
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          name={name}
          value={value}
          onChange={(event) => {
            setAuto(false);
            setValue(event.target.value);
          }}
          onBlur={(event) => setValue(slugify(event.target.value))}
          placeholder="slug"
          className={cn("admin-input", className)}
        />
        <button
          type="button"
          onClick={regenerate}
          title="Сформировать из названия"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border text-petrol transition hover:bg-background"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <p className="px-1 text-xs text-muted">
        {auto ? "Формируется из названия автоматически" : "Задан вручную"}
        {prefix && value ? ` · ${prefix}${value}` : ""}
      </p>
    </div>
  );
}
