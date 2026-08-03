import type { Metadata } from "next";
import { FavoritesClient } from "@/components/favorites-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Избранное",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-8">
        <FavoritesClient />
      </main>
      <SiteFooter />
    </>
  );
}
