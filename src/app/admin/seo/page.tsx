import { SeoCrud } from "@/components/admin/seo-crud";
import { getSeoData } from "@/lib/data";

export default async function AdminSeoPage() {
  const { templates, redirects } = await getSeoData();
  return <SeoCrud templates={templates} redirects={redirects} />;
}
