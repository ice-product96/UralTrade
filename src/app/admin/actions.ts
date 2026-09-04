"use server";

import { revalidatePath } from "next/cache";
import { FieldType, FilterWidget, OrderStatus, Prisma } from "@/generated/prisma/client";
import { formatPrismaError } from "@/lib/admin-errors";
import { NEW_FILTER_GROUP } from "@/lib/filter-groups";
import { prisma } from "@/lib/prisma";
import { parseSiteThemeForm, SITE_THEME_DEFAULTS } from "@/lib/site-theme";
import { slugify } from "@/lib/utils";

type Tx = Prisma.TransactionClient;

function required(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) throw new Error(`Поле ${name} обязательно`);
  return value;
}

function optional(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || undefined;
}

function resolveSlug(formData: FormData, source: string) {
  const slug = slugify(optional(formData, "slug") ?? source);
  if (!slug) throw new Error("Не удалось сформировать адрес (slug) — задайте его вручную латиницей");
  return slug;
}

function parseDecimal(formData: FormData, name: string, requiredField = false) {
  const raw = String(formData.get(name) ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (!raw) {
    if (requiredField) throw new Error(`Поле ${name} обязательно`);
    return null;
  }
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Некорректное значение поля ${name}`);
  }
  return raw;
}

function parseKeyValueLines(raw: string) {
  return raw
    .split("\n")
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return null;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return key && value ? { key, value } : null;
    })
    .filter((item): item is { key: string; value: string } => Boolean(item));
}

async function resolveProductTemplateId(formData: FormData) {
  const templateId = optional(formData, "templateId");
  if (templateId) return templateId;

  const categoryId = optional(formData, "categoryId");
  if (!categoryId) return null;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { templateId: true },
  });

  return category?.templateId ?? null;
}

async function saveProductFieldValues(
  tx: Tx,
  productId: string,
  templateId: string | null | undefined,
  formData: FormData,
) {
  if (!templateId) return;

  const fields = await tx.fieldDefinition.findMany({ where: { templateId }, include: { options: true } });
  await tx.productFieldValue.deleteMany({ where: { productId } });

  for (const field of fields) {
    const raw = String(formData.get(`field_${field.id}`) ?? "").trim();
    if (!raw) continue;

    if (field.type === FieldType.NUMBER || field.type === FieldType.RANGE) {
      const amount = Number(raw.replace(",", "."));
      if (!Number.isFinite(amount)) throw new Error(`Некорректное число в поле «${field.name}»`);
      await tx.productFieldValue.create({ data: { productId, fieldId: field.id, valueNumber: raw.replace(",", ".") } });
    } else if (field.type === FieldType.SELECT || field.type === FieldType.MULTISELECT) {
      const values = raw.split(",").map((item) => item.trim()).filter(Boolean);
      const options = field.options.filter((option) => values.includes(option.slug) || values.includes(option.label));
      if (!options.length) {
        throw new Error(`Выберите значение из списка для поля «${field.name}»`);
      }
      for (const option of options) {
        await tx.productFieldValue.create({ data: { productId, fieldId: field.id, optionId: option.id } });
      }
    } else if (field.type === FieldType.BOOLEAN) {
      await tx.productFieldValue.create({
        data: { productId, fieldId: field.id, valueBoolean: raw === "true" || raw === "1" || raw === "on" },
      });
    } else if (field.type === FieldType.FILE) {
      await tx.productFieldValue.create({ data: { productId, fieldId: field.id, valueFileUrl: raw } });
    } else if (field.type === FieldType.BRAND_REF) {
      const brand = await tx.brand.findFirst({
        where: { OR: [{ id: raw }, { slug: raw }, { name: { equals: raw, mode: "insensitive" } }] },
        select: { id: true },
      });
      if (!brand) throw new Error(`Бренд не найден для поля «${field.name}»`);
      await tx.productFieldValue.create({ data: { productId, fieldId: field.id, brandRefId: brand.id } });
    } else if (field.type === FieldType.KEY_VALUE) {
      const json = parseKeyValueLines(raw);
      if (!json.length) continue;
      await tx.productFieldValue.create({ data: { productId, fieldId: field.id, valueJson: json } });
    } else {
      await tx.productFieldValue.create({ data: { productId, fieldId: field.id, valueText: raw } });
    }
  }
}

async function saveProductImages(tx: Tx, productId: string, name: string, formData: FormData) {
  type ImagePayload = { url: string; alt?: string };

  let imageItems: ImagePayload[] = [];
  const imagesJson = String(formData.get("imagesJson") ?? "").trim();

  if (imagesJson) {
    try {
      const parsed = JSON.parse(imagesJson) as unknown;
      if (Array.isArray(parsed)) {
        imageItems = parsed
          .filter((item): item is ImagePayload => Boolean(item && typeof item === "object" && "url" in item && typeof item.url === "string"))
          .map((item) => ({ url: item.url.trim(), alt: typeof item.alt === "string" ? item.alt : undefined }))
          .filter((item) => item.url);
      }
    } catch {
      throw new Error("Некорректный список фото");
    }
  } else {
    imageItems = String(formData.get("images") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((url) => ({ url }));
  }

  await tx.productImage.deleteMany({ where: { productId } });

  if (imageItems.length) {
    await tx.productImage.createMany({
      data: imageItems.map((image, index) => ({
        productId,
        url: image.url,
        alt: image.alt ?? `${name} фото ${index + 1}`,
        sortOrder: index * 10,
      })),
    });
  }
}

async function saveProductDocuments(tx: Tx, productId: string, formData: FormData) {
  type DocumentPayload = { title: string; url: string; fileName?: string };

  const raw = String(formData.get("documentsJson") ?? "").trim();
  if (!raw) {
    await tx.productDocument.deleteMany({ where: { productId } });
    return;
  }

  let documents: DocumentPayload[] = [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error();
    documents = parsed
      .filter(
        (item): item is DocumentPayload =>
          Boolean(item && typeof item === "object" && "url" in item && typeof item.url === "string" && "title" in item && typeof item.title === "string"),
      )
      .map((item) => ({
        title: item.title.trim() || "Инструкция",
        url: item.url.trim(),
        fileName: typeof item.fileName === "string" ? item.fileName : undefined,
      }))
      .filter((item) => item.url);
  } catch {
    throw new Error("Некорректный список инструкций");
  }

  await tx.productDocument.deleteMany({ where: { productId } });

  if (documents.length) {
    await tx.productDocument.createMany({
      data: documents.map((document, index) => ({
        productId,
        title: document.title,
        url: document.url,
        fileName: document.fileName ?? null,
        sortOrder: index * 10,
      })),
    });
  }
}

function parseAnalogSkus(formData: FormData) {
  return Array.from(
    new Set(
      String(formData.get("analogSkus") ?? "")
        .split(/[\n,;]+/)
        .map((sku) => sku.trim())
        .filter(Boolean),
    ),
  ).slice(0, 100);
}

// --- Categories ---

export async function createCategory(formData: FormData) {
  const name = required(formData, "name");
  try {
    await prisma.category.create({
      data: {
        name,
        slug: resolveSlug(formData, name),
        description: optional(formData, "description"),
        imageUrl: optional(formData, "imageUrl"),
        parentId: optional(formData, "parentId"),
        templateId: optional(formData, "templateId"),
        h1: optional(formData, "h1") ?? name,
        metaTitle: optional(formData, "metaTitle"),
        metaDescription: optional(formData, "metaDescription"),
      },
    });
  } catch (error) {
    throw formatPrismaError(error, "Категория");
  }
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
}

export async function updateCategory(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  const slug = resolveSlug(formData, name);
  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: optional(formData, "description"),
        imageUrl: optional(formData, "imageUrl") ?? null,
        parentId: optional(formData, "parentId") ?? null,
        templateId: optional(formData, "templateId") ?? null,
        h1: optional(formData, "h1") ?? name,
        metaTitle: optional(formData, "metaTitle"),
        metaDescription: optional(formData, "metaDescription"),
      },
    });
  } catch (error) {
    throw formatPrismaError(error, "Категория");
  }
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
}

export async function deleteCategory(formData: FormData) {
  const id = required(formData, "id");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
}

// --- Field templates & definitions ---

export async function createFieldTemplate(formData: FormData) {
  await prisma.fieldTemplate.create({
    data: {
      name: required(formData, "name"),
      description: optional(formData, "description"),
    },
  });
  revalidatePath("/admin/fields");
}

export async function updateFieldTemplate(formData: FormData) {
  const id = required(formData, "id");
  await prisma.fieldTemplate.update({
    where: { id },
    data: {
      name: required(formData, "name"),
      description: optional(formData, "description"),
    },
  });
  revalidatePath("/admin/fields");
}

export async function deleteFieldTemplate(formData: FormData) {
  const id = required(formData, "id");
  await prisma.fieldTemplate.delete({ where: { id } });
  revalidatePath("/admin/fields");
}

async function mergeDuplicateFilterGroups(group: { id: string; name: string; categoryId: string | null }) {
  const duplicates = await prisma.filterGroup.findMany({
    where: { name: group.name, categoryId: group.categoryId, id: { not: group.id } },
    select: { id: true },
  });
  if (!duplicates.length) return;

  const ids = duplicates.map((item) => item.id);
  await prisma.fieldDefinition.updateMany({ where: { groupId: { in: ids } }, data: { groupId: group.id } });
  await prisma.filterGroup.deleteMany({ where: { id: { in: ids } } });
}

async function resolveFilterGroupId(formData: FormData) {
  const selectedId = optional(formData, "groupId");
  const newName = optional(formData, "groupName");

  let group =
    selectedId && selectedId !== NEW_FILTER_GROUP
      ? await prisma.filterGroup.findUnique({ where: { id: selectedId } })
      : null;

  if (!group) {
    if (!newName) return null;
    const existing = await prisma.filterGroup.findFirst({
      where: { name: newName, categoryId: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    if (existing) {
      group = existing;
    } else {
      const last = await prisma.filterGroup.aggregate({ _max: { sortOrder: true } });
      group = await prisma.filterGroup.create({
        data: { name: newName, sortOrder: (last._max.sortOrder ?? 0) + 10 },
      });
    }
  }

  // Одноимённые группы в фильтре выглядят как разные блоки, поэтому склеиваем их в одну.
  await mergeDuplicateFilterGroups(group);
  return group.id;
}

export async function createFieldDefinition(formData: FormData) {
  const name = required(formData, "name");
  const templateId = required(formData, "templateId");
  const type = required(formData, "type") as FieldType;
  const isFilterable = formData.get("isFilterable") === "on";
  const showInBrief = formData.get("showInBrief") === "on";
  const groupId = await resolveFilterGroupId(formData);

  const field = await prisma.fieldDefinition.create({
    data: {
      templateId,
      groupId,
      name,
      slug: resolveSlug(formData, name),
      type,
      unit: optional(formData, "unit"),
      isFilterable,
      showInBrief,
      filterWidget: isFilterable ? ((optional(formData, "filterWidget") ?? "CHECKBOX") as FilterWidget) : undefined,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    },
  });

  const options = String(formData.get("options") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (options.length && (type === FieldType.SELECT || type === FieldType.MULTISELECT)) {
    await prisma.fieldOption.createMany({
      data: options.map((label, index) => ({
        fieldId: field.id,
        label,
        slug: slugify(label),
        sortOrder: index * 10,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/fields");
  revalidatePath("/catalog");
  revalidatePath("/product", "layout");
}

export async function updateFieldDefinition(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  const type = required(formData, "type") as FieldType;
  const isFilterable = formData.get("isFilterable") === "on";
  const showInBrief = formData.get("showInBrief") === "on";
  const groupId = await resolveFilterGroupId(formData);

  await prisma.fieldDefinition.update({
    where: { id },
    data: {
      name,
      groupId,
      slug: resolveSlug(formData, name),
      type,
      unit: optional(formData, "unit"),
      isFilterable,
      showInBrief,
      filterWidget: isFilterable ? ((optional(formData, "filterWidget") ?? "CHECKBOX") as FilterWidget) : null,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    },
  });

  const options = String(formData.get("options") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (type === FieldType.SELECT || type === FieldType.MULTISELECT) {
    await prisma.fieldOption.deleteMany({ where: { fieldId: id } });
    if (options.length) {
      await prisma.fieldOption.createMany({
        data: options.map((label, index) => ({
          fieldId: id,
          label,
          slug: slugify(label),
          sortOrder: index * 10,
        })),
      });
    }
  }

  revalidatePath("/admin/fields");
  revalidatePath("/catalog");
  revalidatePath("/product", "layout");
}

export async function deleteFieldDefinition(formData: FormData) {
  const id = required(formData, "id");
  await prisma.fieldDefinition.delete({ where: { id } });
  revalidatePath("/admin/fields");
  revalidatePath("/catalog");
  revalidatePath("/product", "layout");
}

// --- Brands ---

export async function createBrand(formData: FormData) {
  const name = required(formData, "name");
  await prisma.brand.create({
    data: {
      name,
      slug: resolveSlug(formData, name),
      logoUrl: optional(formData, "logoUrl"),
      description: optional(formData, "description"),
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
    },
  });
  revalidatePath("/admin/brands");
  revalidatePath("/catalog");
}

export async function updateBrand(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  await prisma.brand.update({
    where: { id },
    data: {
      name,
      slug: resolveSlug(formData, name),
      logoUrl: optional(formData, "logoUrl"),
      description: optional(formData, "description"),
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
    },
  });
  revalidatePath("/admin/brands");
  revalidatePath("/catalog");
}

export async function deleteBrand(formData: FormData) {
  const id = required(formData, "id");
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  revalidatePath("/catalog");
}

// --- Products ---

function publicProductSaveError(error: unknown) {
  const formatted = formatPrismaError(error, "Товар");
  if (error instanceof Prisma.PrismaClientKnownRequestError) return formatted.message;
  if (
    /^(Не найдены товары|Некоррект|Выберите значение|Поле .+ обязательно|Товар с таким|Нарушено ограничение)/.test(
      formatted.message,
    )
  ) {
    return formatted.message;
  }
  return "Не удалось сохранить товар. Проверьте данные и повторите попытку.";
}

export async function createProduct(formData: FormData) {
  const name = required(formData, "name");
  const slug = resolveSlug(formData, name);
  const templateId = await resolveProductTemplateId(formData);

  try {
    await prisma.$transaction(
      async (tx) => {
        const product = await tx.product.create({
          data: {
            name,
            slug,
            sku: required(formData, "sku"),
            price: parseDecimal(formData, "price", true)!,
            oldPrice: parseDecimal(formData, "oldPrice"),
            inStock: formData.get("inStock") === "on",
            categoryId: required(formData, "categoryId"),
            brandId: optional(formData, "brandId"),
            templateId,
            shortDescription: required(formData, "shortDescription"),
            fullDescription: required(formData, "fullDescription"),
            h1: optional(formData, "h1") ?? name,
            metaTitle: optional(formData, "metaTitle"),
            metaDescription: optional(formData, "metaDescription"),
            analogSkus: parseAnalogSkus(formData),
          },
        });

        await saveProductImages(tx, product.id, name, formData);
        await saveProductDocuments(tx, product.id, formData);
        await saveProductFieldValues(tx, product.id, templateId, formData);
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
  } catch (error) {
    console.error("Failed to create product", error);
    return { error: publicProductSaveError(error) };
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/product/${slug}`);
  return { error: null };
}

export async function updateProduct(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  const slug = resolveSlug(formData, name);
  const templateId = await resolveProductTemplateId(formData);

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            name,
            slug,
            sku: required(formData, "sku"),
            price: parseDecimal(formData, "price", true)!,
            oldPrice: parseDecimal(formData, "oldPrice"),
            inStock: formData.get("inStock") === "on",
            categoryId: required(formData, "categoryId"),
            brandId: optional(formData, "brandId") ?? null,
            templateId,
            shortDescription: required(formData, "shortDescription"),
            fullDescription: required(formData, "fullDescription"),
            h1: optional(formData, "h1") ?? name,
            metaTitle: optional(formData, "metaTitle"),
            metaDescription: optional(formData, "metaDescription"),
            analogSkus: parseAnalogSkus(formData),
          },
        });

        await saveProductImages(tx, id, name, formData);
        await saveProductDocuments(tx, id, formData);
        await saveProductFieldValues(tx, id, templateId, formData);
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
  } catch (error) {
    console.error("Failed to update product", error);
    return { error: publicProductSaveError(error) };
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/product/${slug}`);
  return { error: null };
}

export async function deleteProduct(formData: FormData) {
  const id = required(formData, "id");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
}

// --- Orders ---

export async function updateOrder(formData: FormData) {
  await prisma.order.update({
    where: { id: required(formData, "id") },
    data: {
      status: required(formData, "status") as OrderStatus,
      name: required(formData, "name"),
      phone: required(formData, "phone"),
      email: optional(formData, "email"),
      comment: optional(formData, "comment"),
    },
  });
  revalidatePath("/admin/orders");
}

export async function deleteOrder(formData: FormData) {
  const id = required(formData, "id");
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
}

// --- Home page ---

type HomeFeaturePayload = {
  title: string;
  text: string;
  icon: string;
  sortOrder: number;
};

function parseHomeFeatures(formData: FormData): HomeFeaturePayload[] {
  const raw = String(formData.get("featuresJson") ?? "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error();

    return parsed
      .filter(
        (item): item is HomeFeaturePayload =>
          Boolean(
            item &&
              typeof item === "object" &&
              "title" in item &&
              typeof item.title === "string" &&
              "text" in item &&
              typeof item.text === "string",
          ),
      )
      .map((item, index) => ({
        title: item.title.trim(),
        text: item.text.trim(),
        icon: typeof item.icon === "string" && item.icon.trim() ? item.icon.trim() : "wrench",
        sortOrder: Number(item.sortOrder) || (index + 1) * 10,
      }))
      .filter((item) => item.title && item.text);
  } catch {
    throw new Error("Некорректный список плашек");
  }
}

export async function updateHomePage(formData: FormData) {
  const title = required(formData, "title");
  const imageUrl = required(formData, "imageUrl");
  const features = parseHomeFeatures(formData);

  await prisma.$transaction(async (tx) => {
    await tx.homePage.upsert({
      where: { id: "default" },
      update: {
        title,
        subtitle: optional(formData, "subtitle") ?? null,
        imageUrl,
        textBlock: optional(formData, "textBlock") ?? "",
      },
      create: {
        id: "default",
        title,
        subtitle: optional(formData, "subtitle") ?? null,
        imageUrl,
        textBlock: optional(formData, "textBlock") ?? "",
      },
    });

    await tx.homeFeature.deleteMany();
    if (features.length) {
      await tx.homeFeature.createMany({
        data: features.map((feature) => ({
          title: feature.title,
          text: feature.text,
          icon: feature.icon,
          sortOrder: feature.sortOrder,
        })),
      });
    }
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
}

// --- Content pages ---

export async function updateContentPage(formData: FormData) {
  const id = required(formData, "id");
  const slug = required(formData, "slug");

  await prisma.contentPage.update({
    where: { id },
    data: {
      title: required(formData, "title"),
      description: optional(formData, "description"),
      body: optional(formData, "body") ?? "",
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
      h1: optional(formData, "h1"),
      published: formData.get("published") === "on",
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/page/${slug}`);
  revalidatePath("/sitemap.xml");
}

// --- FAQ ---

export async function createFaqItem(formData: FormData) {
  await prisma.faqItem.create({
    data: {
      question: required(formData, "question"),
      answer: required(formData, "answer"),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      published: formData.get("published") === "on",
    },
  });

  revalidatePath("/admin/faq");
  revalidatePath("/page/faq");
}

export async function updateFaqItem(formData: FormData) {
  const id = required(formData, "id");

  await prisma.faqItem.update({
    where: { id },
    data: {
      question: required(formData, "question"),
      answer: required(formData, "answer"),
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
      published: formData.get("published") === "on",
    },
  });

  revalidatePath("/admin/faq");
  revalidatePath("/page/faq");
}

export async function deleteFaqItem(formData: FormData) {
  const id = required(formData, "id");
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath("/admin/faq");
  revalidatePath("/page/faq");
}

// --- Site contacts ---

function nullableField(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

type ContactLocationPayload = {
  name: string;
  kind: "OFFICE" | "WAREHOUSE" | "OTHER";
  address: string;
  phone: string | null;
  workingHours: string | null;
  mapUrl: string | null;
  published: boolean;
};

function parseContactLocations(raw: string): ContactLocationPayload[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, 50).flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      const address = String(row.address ?? "").trim();
      if (!name || !address) return [];

      const rawKind = String(row.kind ?? "OFFICE");
      const kind = rawKind === "WAREHOUSE" || rawKind === "OTHER" ? rawKind : "OFFICE";
      const optional = (value: unknown) => String(value ?? "").trim() || null;

      return [{
        name,
        kind,
        address,
        phone: optional(row.phone),
        workingHours: optional(row.workingHours),
        mapUrl: optional(row.mapUrl),
        published: row.published !== false,
      }];
    });
  } catch {
    return [];
  }
}

export async function updateSiteContacts(formData: FormData) {
  const contacts = {
    phone: nullableField(formData, "phone"),
    email: nullableField(formData, "email"),
    address: nullableField(formData, "address"),
    telegram: nullableField(formData, "telegram"),
    whatsapp: nullableField(formData, "whatsapp"),
    maxMessenger: nullableField(formData, "maxMessenger"),
  };
  const locations = parseContactLocations(String(formData.get("locationsJson") ?? "[]"));

  await prisma.$transaction(async (tx) => {
    await tx.siteContact.upsert({
      where: { id: "default" },
      update: contacts,
      create: { id: "default", ...contacts },
    });

    await tx.contactLocation.deleteMany({ where: { siteContactId: "default" } });
    if (locations.length) {
      await tx.contactLocation.createMany({
        data: locations.map((location, index) => ({
          siteContactId: "default",
          ...location,
          sortOrder: index * 10,
        })),
      });
    }
  });

  revalidatePath("/admin/contacts");
  revalidatePath("/page/contacts");
  revalidatePath("/", "layout");
}

// --- Theme ---

export async function updateSiteTheme(formData: FormData) {
  try {
    const colors = parseSiteThemeForm(formData);

    await prisma.siteTheme.upsert({
      where: { id: "default" },
      update: { colors },
      create: { id: "default", colors },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не удалось сохранить цвета" };
  }

  revalidatePath("/admin/theme");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function resetSiteTheme() {
  try {
    await prisma.siteTheme.upsert({
      where: { id: "default" },
      update: { colors: SITE_THEME_DEFAULTS },
      create: { id: "default", colors: SITE_THEME_DEFAULTS },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не удалось сбросить цвета" };
  }

  revalidatePath("/admin/theme");
  revalidatePath("/", "layout");
  return { error: null };
}

// --- SEO ---

export async function createSeoTemplate(formData: FormData) {
  await prisma.seoTemplate.create({
    data: {
      entityType: required(formData, "entityType"),
      metaTitle: required(formData, "metaTitle"),
      metaDescription: required(formData, "metaDescription"),
      h1: optional(formData, "h1"),
    },
  });
  revalidatePath("/admin/seo");
}

export async function updateSeoTemplate(formData: FormData) {
  const id = required(formData, "id");
  await prisma.seoTemplate.update({
    where: { id },
    data: {
      entityType: required(formData, "entityType"),
      metaTitle: required(formData, "metaTitle"),
      metaDescription: required(formData, "metaDescription"),
      h1: optional(formData, "h1"),
    },
  });
  revalidatePath("/admin/seo");
}

export async function deleteSeoTemplate(formData: FormData) {
  const id = required(formData, "id");
  await prisma.seoTemplate.delete({ where: { id } });
  revalidatePath("/admin/seo");
}

export async function createRedirect(formData: FormData) {
  await prisma.redirect.create({
    data: {
      fromPath: required(formData, "fromPath"),
      toPath: required(formData, "toPath"),
      code: Number(formData.get("code") ?? 301),
    },
  });
  revalidatePath("/admin/seo");
}

export async function updateRedirect(formData: FormData) {
  const id = required(formData, "id");
  await prisma.redirect.update({
    where: { id },
    data: {
      fromPath: required(formData, "fromPath"),
      toPath: required(formData, "toPath"),
      code: Number(formData.get("code") ?? 301),
    },
  });
  revalidatePath("/admin/seo");
}

export async function deleteRedirect(formData: FormData) {
  const id = required(formData, "id");
  await prisma.redirect.delete({ where: { id } });
  revalidatePath("/admin/seo");
}

// --- Services ---

type ServiceExamplePayload = { title: string; description?: string; imageUrl: string };

function parseServiceExamples(raw: string): ServiceExamplePayload[] {
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error();

    return parsed
      .filter(
        (item): item is ServiceExamplePayload =>
          Boolean(item && typeof item === "object" && "title" in item && "imageUrl" in item && typeof item.title === "string" && typeof item.imageUrl === "string"),
      )
      .map((item) => ({
        title: item.title.trim(),
        description: typeof item.description === "string" ? item.description.trim() || undefined : undefined,
        imageUrl: item.imageUrl.trim(),
      }))
      .filter((item) => item.title && item.imageUrl);
  } catch {
    throw new Error("Некорректный список примеров работ");
  }
}

async function saveServiceExamples(tx: Tx, serviceId: string, formData: FormData) {
  const examples = parseServiceExamples(String(formData.get("examplesJson") ?? ""));

  await tx.serviceExample.deleteMany({ where: { serviceId } });

  if (examples.length) {
    await tx.serviceExample.createMany({
      data: examples.map((example, index) => ({
        serviceId,
        title: example.title,
        description: example.description ?? null,
        imageUrl: example.imageUrl,
        sortOrder: index * 10,
      })),
    });
  }
}

export async function createService(formData: FormData) {
  const title = required(formData, "title");
  const slug = resolveSlug(formData, title);

  await prisma.$transaction(async (tx) => {
    const service = await tx.service.create({
      data: {
        title,
        slug,
        shortDescription: required(formData, "shortDescription"),
        body: optional(formData, "body") ?? "",
        imageUrl: optional(formData, "imageUrl"),
        sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
        published: formData.get("published") === "on",
        h1: optional(formData, "h1") ?? title,
        metaTitle: optional(formData, "metaTitle"),
        metaDescription: optional(formData, "metaDescription"),
      },
    });

    await saveServiceExamples(tx, service.id, formData);
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function updateService(formData: FormData) {
  const id = required(formData, "id");
  const title = required(formData, "title");
  const slug = resolveSlug(formData, title);

  await prisma.$transaction(async (tx) => {
    await tx.service.update({
      where: { id },
      data: {
        title,
        slug,
        shortDescription: required(formData, "shortDescription"),
        body: optional(formData, "body") ?? "",
        imageUrl: optional(formData, "imageUrl") ?? null,
        sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
        published: formData.get("published") === "on",
        h1: optional(formData, "h1") ?? title,
        metaTitle: optional(formData, "metaTitle"),
        metaDescription: optional(formData, "metaDescription"),
      },
    });

    await saveServiceExamples(tx, id, formData);
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function deleteService(formData: FormData) {
  const id = required(formData, "id");
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/sitemap.xml");
}
