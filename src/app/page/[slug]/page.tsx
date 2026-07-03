import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const pages = {
  about: {
    title: "О компании",
    description: "UralTrade поставляет инженерное оборудование и помогает подобрать товары по точным характеристикам.",
    body: [
      "Мы строим каталог вокруг точных данных: артикулов, брендов, технических параметров и документов.",
      "Админка позволяет быстро добавлять новые группы товаров, создавать шаблоны карточек и управлять SEO для каждой страницы.",
    ],
  },
  delivery: {
    title: "Доставка",
    description: "Доставка инженерного оборудования по России транспортными компаниями и самовывоз со склада.",
    body: [
      "После оформления заявки менеджер уточняет наличие, сроки и удобный способ доставки.",
      "Для крупногабаритного оборудования можно согласовать индивидуальную логистику.",
    ],
  },
  contacts: {
    title: "Контакты",
    description: "Свяжитесь с UralTrade для подбора оборудования и консультации по характеристикам.",
    body: ["Телефон: +7 (000) 000-00-00", "Email: sales@uraltrade.local", "Адрес: Екатеринбург, промышленная зона."],
  },
} as const;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: keyof typeof pages }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: keyof typeof pages }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
        <div className="rounded-[34px] border border-border bg-white p-8 shadow-xl shadow-petrol/5">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-lime">UralTrade</div>
          <h1 className="mt-4 text-4xl font-black text-graphite">{page.title}</h1>
          <p className="mt-4 text-lg leading-8 text-muted">{page.description}</p>
          <div className="rich-text mt-8">
            {page.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
