import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ContactsPage } from "@/components/contacts-page";
import { FaqAccordion, FaqPageIntro } from "@/components/faq-accordion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContentPage, getPublishedFaqItems, getSiteContacts } from "@/lib/data";
import { absolutizeImportedHtml } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getContentPage(slug);
  if (!page || !page.published) return {};

  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.description ?? undefined,
    alternates: {
      canonical: `/page/${page.slug}`,
    },
  };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getContentPage(slug);
  if (!page || !page.published) notFound();

  if (slug === "contacts") {
    const contacts = await getSiteContacts();

    return (
      <>
        <SiteHeader />
        <main>
          <ContactsPage title={page.h1 ?? page.title} description={page.description} contacts={contacts} />
        </main>
        <SiteFooter />
      </>
    );
  }

  if (slug === "faq") {
    const faqItems = await getPublishedFaqItems();

    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-3 py-10 sm:px-4 sm:py-14 lg:px-8">
          <FaqPageIntro title={page.h1 ?? page.title} description={page.description} />
          <div className="mt-8">
            <FaqAccordion items={faqItems} />
          </div>
          <div className="mt-10 rounded-[28px] border border-border bg-white p-6 text-center shadow-sm">
            <h2 className="text-xl font-black text-graphite">Не нашли ответ?</h2>
            <p className="mt-2 text-sm text-muted">Напишите или позвоните — поможем подобрать оборудование и оформить заказ.</p>
            <Link
              href="/page/contacts"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-petrol px-6 text-sm font-bold text-white hover:bg-petrol-soft"
            >
              Связаться с нами
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-14 lg:px-8">
        <div className="rounded-[28px] border border-border bg-white p-5 shadow-xl shadow-petrol/5 sm:rounded-[34px] sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-lime sm:text-sm">UralTrade</div>
          <h1 className="mt-4 text-3xl font-black text-graphite sm:text-4xl">{page.h1 ?? page.title}</h1>
          {page.description ? <p className="mt-4 text-lg leading-8 text-muted">{page.description}</p> : null}
          <div className="rich-text mt-8" dangerouslySetInnerHTML={{ __html: absolutizeImportedHtml(page.body) }} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
