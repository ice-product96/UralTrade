import { PagesCrud } from "@/components/admin/pages-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminPagesPage() {
  const pages = await prisma.contentPage.findMany({ orderBy: { title: "asc" } });
  return <PagesCrud pages={pages} />;
}
