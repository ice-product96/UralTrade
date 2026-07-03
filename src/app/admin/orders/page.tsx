import { OrderStatus } from "@/generated/prisma/client";
import { updateOrderStatus } from "@/app/admin/actions";
import { getAdminOrders } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <section className="rounded-[30px] border border-border bg-white p-6">
      <h1 className="text-3xl font-black text-graphite">Заказы</h1>
      <p className="mt-2 text-muted">Заявки из корзины и статусы обработки менеджером.</p>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? <div className="rounded-2xl bg-background p-6 text-muted">Заказов пока нет.</div> : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-lg font-black text-graphite">Заказ #{order.number}</div>
                <div className="mt-1 text-sm text-muted">
                  {order.name} • {order.phone} {order.email ? `• ${order.email}` : ""}
                </div>
              </div>
              <form action={updateOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="admin-input h-10">
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="h-10 rounded-full bg-petrol px-4 text-sm font-bold text-white">OK</button>
              </form>
            </div>
            <div className="mt-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between rounded-xl bg-background px-3 py-2 text-sm">
                  <span>
                    {item.name} ({item.sku}) × {item.quantity}
                  </span>
                  <span className="font-bold">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right text-lg font-black text-petrol">{formatPrice(order.total)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
