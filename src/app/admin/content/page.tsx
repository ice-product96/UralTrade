import { HomeContentCrud } from "@/components/admin/home-content-crud";
import { getHomePageSettings } from "@/lib/data";

export default async function AdminContentPage() {
  const { homePage, features } = await getHomePageSettings();

  return (
    <HomeContentCrud
      homePage={{
        title: homePage.title,
        subtitle: homePage.subtitle,
        imageUrl: homePage.imageUrl,
      }}
      features={features.map((feature) => ({
        id: feature.id,
        title: feature.title,
        text: feature.text,
        icon: feature.icon,
        sortOrder: feature.sortOrder,
      }))}
    />
  );
}
