"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmitButton({ label = "Сохранить" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-11 rounded-full bg-petrol px-6 text-sm font-bold text-white hover:bg-petrol-soft disabled:opacity-60">
      {pending ? "Сохранение..." : label}
    </button>
  );
}

export function AdminFormActions({ onCancel, onDelete }: { onCancel: () => void; onDelete?: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
      {onDelete ? (
        <button type="button" onClick={onDelete} className="mr-auto h-11 rounded-full border border-red-200 px-5 text-sm font-bold text-red-600 hover:bg-red-50">
          Удалить
        </button>
      ) : null}
      <button type="button" onClick={onCancel} className="h-11 rounded-full border border-border px-5 text-sm font-bold text-petrol hover:bg-background">
        Отмена
      </button>
      <AdminSubmitButton />
    </div>
  );
}
