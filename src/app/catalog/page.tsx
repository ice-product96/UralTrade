import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Каталог инженерного оборудования UralTrade с поиском по артикулу и фасетным фильтром.",
};

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogView searchParams={await searchParams} />;
}
