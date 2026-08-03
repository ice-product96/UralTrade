import { ThemeCrud } from "@/components/admin/theme-crud";
import { getSiteThemeColors } from "@/lib/site-theme-data";

export default async function AdminThemePage() {
  const colors = await getSiteThemeColors();
  return <ThemeCrud key={Object.values(colors).join("-")} colors={colors} />;
}
