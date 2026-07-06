import { FieldsCrud } from "@/components/admin/fields-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminFieldsPage() {
  const templates = await prisma.fieldTemplate.findMany({
    include: {
      fields: { include: { group: true, options: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return <FieldsCrud templates={templates} />;
}
