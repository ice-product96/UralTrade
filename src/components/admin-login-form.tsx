"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") ?? "/admin",
    });
    setLoading(false);

    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push(result?.url ?? "/admin");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input
        name="email"
        type="email"
        defaultValue="admin@uraltrade.local"
        placeholder="Email"
        required
        className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20"
      />
      <input
        name="password"
        type="password"
        defaultValue="admin12345"
        placeholder="Пароль"
        required
        className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20"
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <Button disabled={loading} className="w-full">
        {loading ? "Вход..." : "Войти в админку"}
      </Button>
    </form>
  );
}
