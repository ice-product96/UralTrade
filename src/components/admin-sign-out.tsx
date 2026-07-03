"use client";

import { signOut } from "next-auth/react";

export function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-petrol hover:bg-background"
    >
      Выйти
    </button>
  );
}
