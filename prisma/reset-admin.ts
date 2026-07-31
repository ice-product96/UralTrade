import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "admin@uraltrade.local").trim().toLowerCase();
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Пароль не задан. Укажите ADMIN_PASSWORD в .env или передайте аргументом: npm run db:admin -- email пароль");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.ADMIN },
    create: {
      name: "Администратор",
      email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Пароль обновлён. Вход: ${user.email}`);

  const others = await prisma.user.findMany({
    where: { email: { not: email } },
    select: { email: true, role: true },
    orderBy: { email: "asc" },
  });

  if (others.length) {
    console.log(`Другие учётные записи: ${others.map((item) => `${item.email} (${item.role})`).join(", ")}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
