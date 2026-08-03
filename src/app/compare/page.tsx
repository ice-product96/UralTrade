import type { Metadata } from "next";
import { CompareClient } from "@/components/compare-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Сравнение товаров",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ComparePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-8">
        <CompareClient />
      </main>
      <SiteFooter />
    </>
  );
}
