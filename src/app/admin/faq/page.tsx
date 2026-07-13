import { FaqCrud } from "@/components/admin/faq-crud";
import { prisma } from "@/lib/prisma";
import { parseFaqHtml } from "@/lib/faq";

export default async function AdminFaqPage() {
  try {
    const count = await prisma.faqItem.count();
    if (count === 0) {
      const page = await prisma.contentPage.findUnique({ where: { slug: "faq" } });
      const parsed = parseFaqHtml(page?.body ?? "");
      if (parsed.length) {
        await prisma.faqItem.createMany({
          data: parsed.map((item, index) => ({
            question: item.question,
            answer: item.answer,
            sortOrder: (index + 1) * 10,
            published: true,
          })),
        });
      }
    }
  } catch {
    return (
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Вопрос — ответ</h1>
        <p className="mt-4 text-muted">
          Таблица FAQ ещё не создана. На сервере выполните:{" "}
          <code className="rounded bg-background px-2 py-1 text-sm">npm run db:migrate</code>
        </p>
      </section>
    );
  }

  const items = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return <FaqCrud items={items} />;
}
