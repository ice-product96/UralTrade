import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "UralTrade — инженерное оборудование",
    template: "%s | UralTrade",
  },
  description: "Интернет-магазин инженерного оборудования с умным подбором, фильтрами и SEO-карточками товаров.",
  openGraph: {
    title: "UralTrade",
    description: "Инженерное оборудование с подбором по артикулу, бренду и характеристикам.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
