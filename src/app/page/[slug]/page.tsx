import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContentPage } from "@/lib/data";
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
