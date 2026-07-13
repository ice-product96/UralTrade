import { ContactsCrud } from "@/components/admin/contacts-crud";
import { getSiteContacts } from "@/lib/data";

export default async function AdminContactsPage() {
  const contacts = await getSiteContacts();

  return <ContactsCrud contacts={contacts} />;
}
