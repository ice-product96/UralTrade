import { ContentCrud } from "@/components/admin/content-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  const banners = await prisma.homeBanner.findMany({ orderBy: { sortOrder: "asc" } });
  return <ContentCrud banners={banners} />;
}
