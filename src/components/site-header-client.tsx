"use client";

import { useEffect, useState } from "react";
import { HeaderActions } from "@/components/header-actions";
import { HeaderContactIcons } from "@/components/header-contacts";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SearchBox } from "@/components/search-box";
import { SiteDesktopNav, SiteMobileNav } from "@/components/site-nav";
import { SiteLogo } from "@/components/site-logo";
import { cn } from "@/lib/utils";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: Array<{ id: string; name: string; slug: string }>;
};

type Contacts = { phone: string | null; email: string | null };

export function SiteHeaderClient({
  categories,
  contacts,
}: {
  categories: NavCategory[];
  contacts: Contacts;
}) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 1023px)");

    const sync = () => {
      if (!mobile.matches) {
        setCompact(false);
        return;
      }
      const y = window.scrollY;
      // Гистерезис: скрываем после 40px вниз, возвращаем только у самого верха.
      setCompact((current) => {
        if (!current && y > 40) return true;
        if (current && y <= 8) return false;
        return current;
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    mobile.addEventListener("change", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      mobile.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const value = compact ? "5.75rem" : "0px";
    document.documentElement.style.setProperty("--mobile-bottom-nav", value);
    return () => document.documentElement.style.setProperty("--mobile-bottom-nav", "0px");
  }, [compact]);

  return (
    <>
      <header className="sticky top-0 z-40 overflow-visible border-b border-border/80 bg-background/95 backdrop-blur-xl">
        <div
          className={cn(
            "mx-auto max-w-7xl px-3 transition-[padding] duration-300 ease-out sm:px-4 lg:px-8 lg:py-3",
            compact ? "py-2" : "py-3",
          )}
        >
          {/* Desktop */}
          <div className="hidden min-w-0 items-center gap-4 lg:flex">
            <SiteLogo priority imageClassName="h-[46px] w-auto max-w-none shrink-0" />
            <div className="min-w-0 flex-1 flex-col gap-3 lg:flex">
              <SiteDesktopNav categories={categories} />
              <div className="flex min-w-0 items-center gap-2">
                <HeaderContactIcons contacts={contacts} />
                <div className="min-w-0 flex-1">
                  <SearchBox />
                </div>
              </div>
            </div>
            <HeaderActions />
          </div>

          {/* Mobile */}
          <div className="lg:hidden">
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
                compact ? "mb-0 grid-rows-[0fr] opacity-0" : "mb-0 grid-rows-[1fr] opacity-100",
              )}
              aria-hidden={compact}
            >
              <div className="overflow-hidden">
                <div className={cn("flex min-w-0 items-start gap-2 pb-3", compact && "pointer-events-none")}>
                  <SiteLogo priority imageClassName="h-9 w-auto max-w-[140px] shrink-0" />
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <HeaderActions />
                    <SiteMobileNav categories={categories} contacts={contacts} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "flex min-w-0 items-center gap-2 transition-all duration-300 ease-out",
                compact ? "translate-y-0" : "",
              )}
            >
              <div
                className={cn(
                  "grid transition-[grid-template-columns,opacity] duration-300 ease-out",
                  compact ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100",
                )}
              >
                <div className="overflow-hidden">
                  <HeaderContactIcons contacts={contacts} className={cn(compact && "pointer-events-none")} />
                </div>
              </div>
              <div className="min-w-0 flex-1 transition-all duration-300">
                <SearchBox />
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileBottomNav visible={compact} contacts={contacts} />
    </>
  );
}
