import { FieldsCrud } from "@/components/admin/fields-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminFieldsPage() {
  const [templates, filterGroups] = await Promise.all([
    prisma.fieldTemplate.findMany({
      include: {
        fields: { include: { group: true, options: true }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.filterGroup.findMany({
      where: { categoryId: null },
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return <FieldsCrud templates={templates} filterGroups={filterGroups} />;
}
