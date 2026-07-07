import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Акции",
  description: "Товары со скидкой в каталоге UralTrade.",
  alternates: {
    canonical: "/promotions",
  },
};

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <CatalogView
        searchParams={{ ...params, sale: "1", all: "1" }}
        pageTitle="Акции"
        pageDescription="Все товары со скидкой. Скидка рассчитывается по сравнению со старой ценой."
        basePath="/promotions"
        lockSaleFilter
        embedded
      />
      <SiteFooter />
    </>
  );
}
