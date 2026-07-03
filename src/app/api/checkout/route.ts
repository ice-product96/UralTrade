import { redirect } from "next/navigation";
import { sendOrderNotification } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

type CartLine = {
  id: string;
  quantity: number;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const lines = JSON.parse(String(formData.get("items") ?? "[]")) as CartLine[];
  const ids = lines.map((line) => line.id);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });

  const items = products.map((product) => {
    const quantity = lines.find((line) => line.id === product.id)?.quantity ?? 1;
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity,
    };
  });

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  if (!items.length) {
    redirect("/cart");
  }

  const order = await prisma.order.create({
    data: {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? "") || undefined,
      comment: String(formData.get("comment") ?? "") || undefined,
      total,
      items: { create: items },
    },
    include: { items: true },
  });

  await sendOrderNotification({
    number: order.number,
    name: order.name,
    phone: order.phone,
    email: order.email,
    total: Number(order.total),
    items: order.items,
  });

  redirect("/cart/success");
}
