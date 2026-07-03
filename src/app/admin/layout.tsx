import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminSignOut } from "@/components/admin-sign-out";
import { AdminNav } from "@/components/admin-nav";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <main className="min-w-0 flex-1">
        <div className="border-b border-border bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted">Админ-панель</div>
              <div className="font-bold text-graphite">{session.user.name ?? session.user.email}</div>
            </div>
            <AdminSignOut />
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
