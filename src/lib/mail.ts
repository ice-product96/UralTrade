import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/format";

type OrderEmail = {
  number: number;
  name: string;
  phone: string;
  email?: string | null;
  total: number;
  items: Array<{ name: string; sku: string; quantity: number; price: number | string | { toString(): string } }>;
};

export async function sendOrderNotification(order: OrderEmail) {
  if (!process.env.SMTP_HOST || !process.env.ORDER_EMAIL_TO) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: process.env.ORDER_EMAIL_TO,
    subject: `Новый заказ UralTrade #${order.number}`,
    html: `
      <h1>Новый заказ #${order.number}</h1>
      <p><b>Клиент:</b> ${order.name}</p>
      <p><b>Телефон:</b> ${order.phone}</p>
      <p><b>Email:</b> ${order.email ?? "-"}</p>
      <ul>
        ${order.items
          .map((item) => `<li>${item.name} (${item.sku}) x ${item.quantity} — ${formatPrice(Number(item.price) * item.quantity)}</li>`)
          .join("")}
      </ul>
      <p><b>Итого:</b> ${formatPrice(order.total)}</p>
    `,
  });
}
