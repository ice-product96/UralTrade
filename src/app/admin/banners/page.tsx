import { HomeBannersCrud } from "@/components/admin/home-banners-crud";
import { getAdminHomeBanners } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await getAdminHomeBanners();
  return <HomeBannersCrud banners={banners} />;
}
