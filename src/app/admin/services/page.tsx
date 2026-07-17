import { ServicesCrud } from "@/components/admin/services-crud";
import { getAdminServices } from "@/lib/data";

export default async function AdminServicesPage() {
  try {
    const services = await getAdminServices();
    return <ServicesCrud services={services} />;
  } catch {
    return (
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Услуги</h1>
        <p className="mt-4 text-muted">
          Таблица услуг ещё не создана. На сервере выполните:{" "}
          <code className="rounded bg-background px-2 py-1 text-sm">npx prisma migrate deploy</code>
        </p>
      </section>
    );
  }
}
