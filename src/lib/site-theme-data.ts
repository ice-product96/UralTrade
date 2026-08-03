import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import {
  buildSiteThemeCss,
  mergeSiteThemeColors,
  SITE_THEME_DEFAULTS,
  type SiteThemeColors,
} from "@/lib/site-theme";

export async function getSiteThemeColors(): Promise<SiteThemeColors> {
  return safeQuery(
    "siteTheme",
    async () => {
      const theme = await prisma.siteTheme.findUnique({ where: { id: "default" } });
      return mergeSiteThemeColors(theme?.colors ?? SITE_THEME_DEFAULTS);
    },
    SITE_THEME_DEFAULTS,
  );
}

export async function getSiteThemeCss() {
  const colors = await getSiteThemeColors();
  return buildSiteThemeCss(colors);
}
