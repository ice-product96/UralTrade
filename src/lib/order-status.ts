export const ORDER_STATUSES = ["NEW", "IN_PROGRESS", "DONE", "CANCELED"] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  DONE: "Выполнен",
  CANCELED: "Отменён",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatusValue] ?? status;
}
