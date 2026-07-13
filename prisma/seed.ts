import { PrismaClient, FieldType, FilterWidget, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@uraltrade.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: UserRole.ADMIN },
    create: {
      name: "Администратор",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const pumpsTemplate = await prisma.fieldTemplate.upsert({
    where: { id: "template-pumps" },
    update: {},
    create: {
      id: "template-pumps",
      name: "Шаблон: Насосное оборудование",
      description: "Поля и фильтры для промышленных насосов.",
    },
  });

  const dimensionsGroup = await prisma.filterGroup.upsert({
    where: { id: "filter-dimensions" },
    update: {},
    create: { id: "filter-dimensions", name: "Параметры", sortOrder: 10 },
  });

  const docsGroup = await prisma.filterGroup.upsert({
    where: { id: "filter-docs" },
    update: {},
    create: { id: "filter-docs", name: "Документация", sortOrder: 30, collapsed: true },
  });

  const powerField = await prisma.fieldDefinition.upsert({
    where: { templateId_slug: { templateId: pumpsTemplate.id, slug: "power" } },
    update: {},
    create: {
      templateId: pumpsTemplate.id,
      groupId: dimensionsGroup.id,
      name: "Мощность",
      slug: "power",
      type: FieldType.NUMBER,
      unit: "кВт",
      isFilterable: true,
      filterWidget: FilterWidget.RANGE,
      sortOrder: 10,
    },
  });

  const pressureField = await prisma.fieldDefinition.upsert({
    where: { templateId_slug: { templateId: pumpsTemplate.id, slug: "pressure" } },
    update: {},
    create: {
      templateId: pumpsTemplate.id,
      groupId: dimensionsGroup.id,
      name: "Напор",
      slug: "pressure",
      type: FieldType.NUMBER,
      unit: "м",
      isFilterable: true,
      filterWidget: FilterWidget.RANGE,
      sortOrder: 20,
    },
  });

  const materialField = await prisma.fieldDefinition.upsert({
    where: { templateId_slug: { templateId: pumpsTemplate.id, slug: "material" } },
    update: {},
    create: {
      templateId: pumpsTemplate.id,
      groupId: dimensionsGroup.id,
      name: "Материал корпуса",
      slug: "material",
      type: FieldType.SELECT,
      isFilterable: true,
      filterWidget: FilterWidget.CHECKBOX,
      sortOrder: 30,
    },
  });

  const manualField = await prisma.fieldDefinition.upsert({
    where: { templateId_slug: { templateId: pumpsTemplate.id, slug: "manual" } },
    update: {},
    create: {
      templateId: pumpsTemplate.id,
      groupId: docsGroup.id,
      name: "Инструкция",
      slug: "manual",
      type: FieldType.FILE,
      sortOrder: 40,
    },
  });

  const specsField = await prisma.fieldDefinition.upsert({
    where: { templateId_slug: { templateId: pumpsTemplate.id, slug: "specs" } },
    update: {},
    create: {
      templateId: pumpsTemplate.id,
      groupId: dimensionsGroup.id,
      name: "Характеристики",
      slug: "specs",
      type: FieldType.KEY_VALUE,
      sortOrder: 50,
    },
  });

  const castIron = await prisma.fieldOption.upsert({
    where: { fieldId_slug: { fieldId: materialField.id, slug: "cast-iron" } },
    update: {},
    create: { fieldId: materialField.id, label: "Чугун", slug: "cast-iron" },
  });

  const stainless = await prisma.fieldOption.upsert({
    where: { fieldId_slug: { fieldId: materialField.id, slug: "stainless-steel" } },
    update: {},
    create: { fieldId: materialField.id, label: "Нержавеющая сталь", slug: "stainless-steel" },
  });

  const pumps = await prisma.category.upsert({
    where: { slug: "nasosy" },
    update: {},
    create: {
      name: "Насосы",
      slug: "nasosy",
      description: "Промышленные насосы для инженерных систем.",
      templateId: pumpsTemplate.id,
      h1: "Насосное оборудование",
      metaTitle: "Насосы купить в UralTrade",
      metaDescription: "Каталог насосного оборудования с фильтрами по мощности, напору и материалу корпуса.",
    },
  });

  const submersible = await prisma.category.upsert({
    where: { slug: "pogruzhnye-nasosy" },
    update: {},
    create: {
      name: "Погружные насосы",
      slug: "pogruzhnye-nasosy",
      parentId: pumps.id,
      templateId: pumpsTemplate.id,
      h1: "Погружные насосы",
      metaTitle: "Погружные насосы купить в UralTrade",
      metaDescription: "Подберите погружной насос по напору, мощности и материалу корпуса.",
    },
  });

  const grundfos = await prisma.brand.upsert({
    where: { slug: "grundfos" },
    update: {},
    create: {
      name: "Grundfos",
      slug: "grundfos",
      logoUrl: "/demo/brand-grundfos.svg",
      description: "Надёжное насосное оборудование для промышленности и инженерных систем.",
    },
  });

  const wilo = await prisma.brand.upsert({
    where: { slug: "wilo" },
    update: {},
    create: {
      name: "Wilo",
      slug: "wilo",
      logoUrl: "/demo/brand-wilo.svg",
      description: "Европейские насосные решения для водоснабжения и отопления.",
    },
  });

  const productA = await prisma.product.upsert({
    where: { sku: "UT-GR-SQ-255" },
    update: {},
    create: {
      name: "Grundfos SQ 2-55",
      slug: "grundfos-sq-2-55",
      sku: "UT-GR-SQ-255",
      price: 72900,
      oldPrice: 78900,
      shortDescription: "Компактный погружной насос с плавным запуском и защитой от сухого хода.",
      fullDescription:
        "<p>Grundfos SQ 2-55 подходит для частного и промышленного водоснабжения. Корпус из нержавеющей стали, встроенная защита и стабильная работа при перепадах напряжения.</p>",
      categoryId: submersible.id,
      brandId: grundfos.id,
      templateId: pumpsTemplate.id,
      metaTitle: "Grundfos SQ 2-55 купить — UralTrade",
      metaDescription: "Погружной насос Grundfos SQ 2-55: цена, фото, характеристики, инструкция и наличие.",
      images: {
        create: [
          { url: "/demo/pump-1.svg", alt: "Насос Grundfos SQ 2-55", sortOrder: 10 },
          { url: "/demo/pump-2.svg", alt: "Корпус насоса Grundfos SQ", sortOrder: 20 },
        ],
      },
    },
  });

  const productB = await prisma.product.upsert({
    where: { sku: "UT-WL-TOP-040" },
    update: {},
    create: {
      name: "Wilo TWI 4.04",
      slug: "wilo-twi-4-04",
      sku: "UT-WL-TOP-040",
      price: 51400,
      shortDescription: "Погружной многоступенчатый насос для скважин и резервуаров.",
      fullDescription:
        "<p>Wilo TWI 4.04 рассчитан на стабильную подачу воды и удобное сервисное обслуживание. Хорошо подходит для объектов с переменной нагрузкой.</p>",
      categoryId: submersible.id,
      brandId: wilo.id,
      templateId: pumpsTemplate.id,
      images: {
        create: [{ url: "/demo/pump-3.svg", alt: "Насос Wilo TWI 4.04", sortOrder: 10 }],
      },
    },
  });

  await prisma.productFieldValue.createMany({
    data: [
      { productId: productA.id, fieldId: powerField.id, valueNumber: 1.15 },
      { productId: productA.id, fieldId: pressureField.id, valueNumber: 55 },
      { productId: productA.id, fieldId: materialField.id, optionId: stainless.id },
      { productId: productA.id, fieldId: manualField.id, valueFileUrl: "/demo/manual.pdf" },
      {
        productId: productA.id,
        fieldId: specsField.id,
        valueJson: [
          { key: "Диаметр", value: "74 мм" },
          { key: "Подключение", value: "1 1/4\"" },
        ],
      },
      { productId: productB.id, fieldId: powerField.id, valueNumber: 0.75 },
      { productId: productB.id, fieldId: pressureField.id, valueNumber: 42 },
      { productId: productB.id, fieldId: materialField.id, optionId: castIron.id },
      {
        productId: productB.id,
        fieldId: specsField.id,
        valueJson: [
          { key: "Диаметр", value: "98 мм" },
          { key: "Подключение", value: "1\"" },
        ],
      },
    ],
    skipDuplicates: true,
  });

  await prisma.productRelation.upsert({
    where: { productId_relatedId: { productId: productA.id, relatedId: productB.id } },
    update: {},
    create: { productId: productA.id, relatedId: productB.id },
  });

  await prisma.productDocument.upsert({
    where: { id: "seed-manual-a" },
    update: { title: "Инструкция по эксплуатации", url: "/demo/manual.pdf", fileName: "manual.pdf", sortOrder: 10 },
    create: {
      id: "seed-manual-a",
      productId: productA.id,
      title: "Инструкция по эксплуатации",
      url: "/demo/manual.pdf",
      fileName: "manual.pdf",
      sortOrder: 10,
    },
  });

  await prisma.homeBanner.upsert({
    where: { id: "banner-main" },
    update: { imageUrl: "/demo/hero-equipment.jpg" },
    create: {
      id: "banner-main",
      title: "Инженерное оборудование с умным подбором",
      subtitle: "Каталог UralTrade помогает быстро найти товар по артикулу, бренду и точным техническим параметрам.",
      imageUrl: "/demo/hero-equipment.jpg",
      href: "/catalog/nasosy",
      buttonLabel: "Перейти в каталог",
    },
  });

  await prisma.seoTemplate.upsert({
    where: { id: "product-default" },
    update: {},
    create: {
      id: "product-default",
      entityType: "product",
      metaTitle: "{name} купить — UralTrade",
      metaDescription: "{name}: фото, характеристики, инструкция, цена и наличие. Быстрый подбор по артикулу.",
      h1: "{name}",
    },
  });

  const contentPages = [
    {
      slug: "about",
      title: "О компании",
      description: "UralTrade поставляет инженерное оборудование и помогает подобрать товары по точным характеристикам.",
      body: `<p>Мы строим каталог вокруг точных данных: артикулов, брендов, технических параметров и документов.</p>
<p>Админка позволяет быстро добавлять новые группы товаров, создавать шаблоны карточек и управлять SEO для каждой страницы.</p>`,
    },
    {
      slug: "contacts",
      title: "Контакты",
      description: "Свяжитесь с UralTrade для подбора оборудования и консультации по характеристикам.",
      body: `<p><strong>Телефон:</strong> +7 (343) 000-00-00</p>
<p><strong>Email:</strong> sales@uraltrade.local</p>
<p><strong>Адрес:</strong> Екатеринбург, промышленная зона.</p>`,
    },
    {
      slug: "faq",
      title: "Вопрос ответ",
      description: "Ответы на частые вопросы о заказе, доставке и оплате оборудования.",
      body: `<h3>Как оформить заказ?</h3>
<p>Добавьте товары в корзину и оставьте заявку. Менеджер свяжется с вами для подтверждения наличия и условий.</p>
<h3>Какие способы оплаты доступны?</h3>
<p>Безналичный расчёт для юридических лиц. Для физических лиц — по согласованию с менеджером.</p>`,
    },
    {
      slug: "delivery",
      title: "Доставка и оплата",
      description: "Условия доставки инженерного оборудования по России и варианты оплаты.",
      body: `<h3>Доставка</h3>
<p>После оформления заявки менеджер уточняет наличие, сроки и удобный способ доставки.</p>
<h3>Оплата</h3>
<p>Для юридических лиц — безналичный расчёт по счёту.</p>`,
    },
  ];

  for (const page of contentPages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  const faqItems = [
    {
      question: "Как оформить заказ?",
      answer: "Добавьте товары в корзину и оставьте заявку. Менеджер свяжется с вами для подтверждения наличия и условий.",
      sortOrder: 10,
    },
    {
      question: "Какие способы оплаты доступны?",
      answer: "Безналичный расчёт для юридических лиц. Для физических лиц — по согласованию с менеджером.",
      sortOrder: 20,
    },
    {
      question: "Как рассчитывается доставка?",
      answer: "Стоимость и сроки зависят от региона и габаритов. После заявки менеджер предложит оптимальный вариант.",
      sortOrder: 30,
    },
    {
      question: "Можно ли подобрать аналог?",
      answer: "Да. Укажите артикул, бренд или характеристики — мы поможем найти подходящее оборудование.",
      sortOrder: 40,
    },
  ];

  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    await prisma.faqItem.createMany({ data: faqItems });
  }

  await prisma.siteContact.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      phone: "+7 (343) 000-00-00",
      email: "sales@uraltrade.local",
      telegram: "@uraltrade",
      whatsapp: "+79001234567",
      maxMessenger: null,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
