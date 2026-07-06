"use client";

import { useState } from "react";

export function useCrudModal<T>() {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<T | null>(null);

  return {
    open,
    item,
    isEdit: item !== null,
    openCreate: () => {
      setItem(null);
      setOpen(true);
    },
    openEdit: (record: T) => {
      setItem(record);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setItem(null);
    },
  };
}
