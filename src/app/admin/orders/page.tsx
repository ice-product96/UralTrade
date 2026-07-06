import { OrdersCrud } from "@/components/admin/orders-crud";
import { getAdminOrders } from "@/lib/data";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  const serialized = orders.map((order) => ({
    ...order,
    total: order.total.toString(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toString(),
    })),
  }));

  return <OrdersCrud orders={serialized} />;
}
