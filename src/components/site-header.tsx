import { SiteDesktopNav, SiteMobileNav } from "@/components/site-nav";
import { CartNavLink } from "@/components/cart-nav-link";
import { HeaderContacts } from "@/components/header-contacts";
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
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4">
          <SiteLogo priority imageClassName="h-9 w-auto max-w-[140px] sm:h-[46px] sm:max-w-none" />
          <SiteDesktopNav categories={navCategories} />
          <HeaderContacts contacts={headerContacts} className="ml-auto hidden lg:flex" />
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
            <HeaderContacts contacts={headerContacts} className="lg:hidden" />
            <CartNavLink />
            <SiteMobileNav categories={navCategories} contacts={headerContacts} />
          </div>
        </div>
        <div className="relative z-50 mt-3">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
