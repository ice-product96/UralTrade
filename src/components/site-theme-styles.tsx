import { getSiteThemeCss } from "@/lib/site-theme-data";

/** Подставляет CSS-переменные темы из админки поверх defaults в globals.css. */
export async function SiteThemeStyles() {
  const css = await getSiteThemeCss();
  return <style id="site-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
