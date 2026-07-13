"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteOrder, updateOrder } from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/order-status";

type OrderItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: string;
};

type OrderRow = {
  id: string;
  number: number;
  status: string;
  name: string;
  phone: string;
  email: string | null;
  comment: string | null;
  total: string;
  items: OrderItem[];
};

export function OrdersCrud({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const modal = useCrudModal<OrderRow>();
  const [pending, startTransition] = useTransition();
  const current = modal.item;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateOrder(formData);
      router.refresh();
      modal.close();
    });
  }

  function handleDelete() {
    if (!modal.item || !confirm(`Удалить заказ #${modal.item.number}?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      await deleteOrder(formData);
      router.refresh();
      modal.close();
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Заказы</h1>
        <p className="mt-2 text-muted">Заявки из корзины и статусы обработки.</p>
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? <div className="rounded-2xl bg-background p-6 text-muted">Заказов пока нет.</div> : null}
          {orders.map((order) => (
            <article key={order.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border p-4">
              <div>
                <div className="text-lg font-black text-graphite">Заказ #{order.number}</div>
                <div className="mt-1 text-sm text-muted">
                  {order.name} • {order.phone} {order.email ? `• ${order.email}` : ""}
                </div>
                <div className="mt-2 text-sm font-bold text-petrol">{orderStatusLabel(order.status)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-black text-graphite">{formatPrice(order.total)}</div>
                <button type="button" onClick={() => modal.openEdit(order)} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background">
                  <Eye className="h-4 w-4" />
                  Открыть
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AdminModal open={modal.open} onClose={modal.close} title={current ? `Заказ #${current.number}` : "Заказ"} size="lg">
        {current ? (
          <form onSubmit={submit} className="space-y-4">
            <input type="hidden" name="id" value={current.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required defaultValue={current.name} placeholder="Имя" className="admin-input" />
              <input name="phone" required defaultValue={current.phone} placeholder="Телефон" className="admin-input" />
            </div>
            <input name="email" type="email" defaultValue={current.email ?? ""} placeholder="Email" className="admin-input" />
            <select name="status" defaultValue={current.status} className="admin-input">
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabel(status)}
                </option>
              ))}
            </select>
            <textarea name="comment" defaultValue={current.comment ?? ""} rows={3} placeholder="Комментарий" className="admin-textarea" />
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-3 font-bold text-graphite">Состав заказа</div>
              <div className="space-y-2">
                {current.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} ({item.sku}) × {item.quantity}
                    </span>
                    <span className="font-bold">{formatPrice(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right text-lg font-black text-petrol">{formatPrice(current.total)}</div>
            </div>
            <AdminFormActions onCancel={modal.close} onDelete={handleDelete} />
            {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
