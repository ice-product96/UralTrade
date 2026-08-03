import { SiteHeaderClient } from "@/components/site-header-client";
import { getNavigationCategories, getSiteContacts } from "@/lib/data";

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

  return (
    <SiteHeaderClient
      categories={navCategories}
      contacts={{ phone: contacts.phone, email: contacts.email }}
    />
  );
}
