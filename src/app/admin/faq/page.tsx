import { FaqCrud } from "@/components/admin/faq-crud";
import { prisma } from "@/lib/prisma";

export default async function AdminFaqPage() {
  const items = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return <FaqCrud items={items} />;
}
