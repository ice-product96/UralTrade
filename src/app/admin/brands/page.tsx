import { BrandsCrud } from "@/components/admin/brands-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  return <BrandsCrud brands={brands} />;
}
