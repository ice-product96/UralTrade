import { CategoriesCrud } from "@/components/admin/categories-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const [categories, templates] = await Promise.all([
    prisma.category.findMany({ include: { parent: true, template: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
    prisma.fieldTemplate.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <CategoriesCrud categories={categories} templates={templates} />;
}
