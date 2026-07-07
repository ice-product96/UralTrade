import { Prisma } from "@/generated/prisma/client";

export function formatPrismaError(error: unknown, entity = "запись"): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : String(error.meta?.target ?? "");

      if (target.includes("sku")) return new Error("Товар с таким артикулом уже существует");
      if (target.includes("slug")) return new Error(`${entity} с таким slug уже существует`);
      return new Error("Нарушено ограничение уникальности. Проверьте slug и артикул.");
    }
    if (error.code === "P2003") return new Error("Связанная запись не найдена. Проверьте категорию, бренд или шаблон.");
    if (error.code === "P2025") return new Error("Запись не найдена или уже удалена.");
  }

  if (error instanceof Error) return error;
  return new Error(`Не удалось сохранить ${entity}`);
}
