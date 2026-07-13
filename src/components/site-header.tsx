import { SiteDesktopNav, SiteMobileNav } from "@/components/site-nav";
import { CartNavLink } from "@/components/cart-nav-link";
import { HeaderContactIcons } from "@/components/header-contacts";
import { getNavigationCategories, getSiteContacts } from "@/lib/data";
import { SearchBox } from "@/components/search-box";
import { SiteLogo } from "@/components/site-logo";

export async function SiteHeader() {
  const [categories, contacts] = await Promise.all([getNavigationCategories(), getSiteContacts()]);
  const navCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
    })),
  }));

  const headerContacts = { phone: contacts.phone, email: contacts.email };

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-8">
        <div className="flex min-w-0 items-start gap-2 sm:gap-3 lg:items-center lg:gap-4">
          <SiteLogo priority imageClassName="h-9 w-auto max-w-[140px] shrink-0 sm:h-[46px] sm:max-w-none" />

          <div className="hidden min-w-0 flex-1 flex-col gap-3 lg:flex">
            <SiteDesktopNav categories={navCategories} />
            <div className="flex min-w-0 items-center gap-2">
              <HeaderContactIcons contacts={headerContacts} />
              <div className="min-w-0 flex-1">
                <SearchBox />
              </div>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <CartNavLink />
            <SiteMobileNav categories={navCategories} contacts={headerContacts} />
          </div>
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-2 lg:hidden">
          <HeaderContactIcons contacts={headerContacts} />
          <div className="min-w-0 flex-1">
            <SearchBox />
          </div>
        </div>
      </div>
    </header>
  );
}
