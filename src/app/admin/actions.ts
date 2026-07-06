"use server";

import { revalidatePath } from "next/cache";
import { FieldType, FilterWidget, OrderStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function required(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) throw new Error(`Поле ${name} обязательно`);
  return value;
}

function optional(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || undefined;
}

async function saveProductFieldValues(productId: string, templateId: string | null | undefined, formData: FormData) {
  if (!templateId) return;

  const fields = await prisma.fieldDefinition.findMany({ where: { templateId }, include: { options: true } });
  await prisma.productFieldValue.deleteMany({ where: { productId } });

  for (const field of fields) {
    const raw = String(formData.get(`field_${field.id}`) ?? "").trim();
    if (!raw) continue;

    if (field.type === FieldType.NUMBER || field.type === FieldType.RANGE) {
      await prisma.productFieldValue.create({ data: { productId, fieldId: field.id, valueNumber: raw } });
    } else if (field.type === FieldType.SELECT || field.type === FieldType.MULTISELECT) {
      const values = raw.split(",").map((item) => item.trim());
      const options = field.options.filter((option) => values.includes(option.slug) || values.includes(option.label));
      for (const option of options) {
        await prisma.productFieldValue.create({ data: { productId, fieldId: field.id, optionId: option.id } });
      }
    } else if (field.type === FieldType.FILE) {
      await prisma.productFieldValue.create({ data: { productId, fieldId: field.id, valueFileUrl: raw } });
    } else if (field.type === FieldType.KEY_VALUE) {
      const json = raw
        .split("\n")
        .map((line) => line.split(":"))
        .filter(([key, value]) => key && value)
        .map(([key, value]) => ({ key: key.trim(), value: value.trim() }));
      await prisma.productFieldValue.create({ data: { productId, fieldId: field.id, valueJson: json } });
    } else {
      await prisma.productFieldValue.create({ data: { productId, fieldId: field.id, valueText: raw } });
    }
  }
}

async function saveProductImages(productId: string, name: string, formData: FormData) {
  const imageUrls = String(formData.get("images") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  await prisma.productImage.deleteMany({ where: { productId } });

  if (imageUrls.length) {
    await prisma.productImage.createMany({
      data: imageUrls.map((url, index) => ({
        productId,
        url,
        alt: `${name} фото ${index + 1}`,
        sortOrder: index * 10,
      })),
    });
  }
}

// --- Categories ---

export async function createCategory(formData: FormData) {
  const name = required(formData, "name");
  await prisma.category.create({
    data: {
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      description: optional(formData, "description"),
      parentId: optional(formData, "parentId"),
      templateId: optional(formData, "templateId"),
      h1: optional(formData, "h1") ?? name,
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
}

export async function updateCategory(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      description: optional(formData, "description"),
      parentId: optional(formData, "parentId") ?? null,
      templateId: optional(formData, "templateId") ?? null,
      h1: optional(formData, "h1") ?? name,
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
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

export async function createFieldDefinition(formData: FormData) {
  const name = required(formData, "name");
  const templateId = required(formData, "templateId");
  const groupName = optional(formData, "groupName");
  const type = required(formData, "type") as FieldType;
  const isFilterable = formData.get("isFilterable") === "on";
  const group = groupName
    ? await prisma.filterGroup.create({
        data: { name: groupName, sortOrder: Number(formData.get("groupSortOrder") ?? 0) },
      })
    : null;

  const field = await prisma.fieldDefinition.create({
    data: {
      templateId,
      groupId: group?.id,
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      type,
      unit: optional(formData, "unit"),
      isFilterable,
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
}

export async function updateFieldDefinition(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  const type = required(formData, "type") as FieldType;
  const isFilterable = formData.get("isFilterable") === "on";

  await prisma.fieldDefinition.update({
    where: { id },
    data: {
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      type,
      unit: optional(formData, "unit"),
      isFilterable,
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
}

export async function deleteFieldDefinition(formData: FormData) {
  const id = required(formData, "id");
  await prisma.fieldDefinition.delete({ where: { id } });
  revalidatePath("/admin/fields");
}

// --- Brands ---

export async function createBrand(formData: FormData) {
  const name = required(formData, "name");
  await prisma.brand.create({
    data: {
      name,
      slug: optional(formData, "slug") ?? slugify(name),
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
      slug: optional(formData, "slug") ?? slugify(name),
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

export async function createProduct(formData: FormData) {
  const name = required(formData, "name");
  const templateId = optional(formData, "templateId");
  const product = await prisma.product.create({
    data: {
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      sku: required(formData, "sku"),
      price: required(formData, "price"),
      oldPrice: optional(formData, "oldPrice"),
      inStock: formData.get("inStock") === "on",
      categoryId: required(formData, "categoryId"),
      brandId: optional(formData, "brandId"),
      templateId,
      shortDescription: required(formData, "shortDescription"),
      fullDescription: required(formData, "fullDescription"),
      h1: optional(formData, "h1") ?? name,
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
    },
  });

  await saveProductImages(product.id, name, formData);
  await saveProductFieldValues(product.id, templateId, formData);

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
}

export async function updateProduct(formData: FormData) {
  const id = required(formData, "id");
  const name = required(formData, "name");
  const templateId = optional(formData, "templateId");

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug: optional(formData, "slug") ?? slugify(name),
      sku: required(formData, "sku"),
      price: required(formData, "price"),
      oldPrice: optional(formData, "oldPrice") ?? null,
      inStock: formData.get("inStock") === "on",
      categoryId: required(formData, "categoryId"),
      brandId: optional(formData, "brandId") ?? null,
      templateId: templateId ?? null,
      shortDescription: required(formData, "shortDescription"),
      fullDescription: required(formData, "fullDescription"),
      h1: optional(formData, "h1") ?? name,
      metaTitle: optional(formData, "metaTitle"),
      metaDescription: optional(formData, "metaDescription"),
    },
  });

  await saveProductImages(id, name, formData);
  await saveProductFieldValues(id, templateId, formData);

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
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

// --- Home banners ---

export async function createHomeBanner(formData: FormData) {
  await prisma.homeBanner.create({
    data: {
      title: required(formData, "title"),
      subtitle: optional(formData, "subtitle"),
      imageUrl: required(formData, "imageUrl"),
      href: optional(formData, "href"),
      buttonLabel: optional(formData, "buttonLabel"),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function updateHomeBanner(formData: FormData) {
  const id = required(formData, "id");
  await prisma.homeBanner.update({
    where: { id },
    data: {
      title: required(formData, "title"),
      subtitle: optional(formData, "subtitle"),
      imageUrl: required(formData, "imageUrl"),
      href: optional(formData, "href"),
      buttonLabel: optional(formData, "buttonLabel"),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function deleteHomeBanner(formData: FormData) {
  const id = required(formData, "id");
  await prisma.homeBanner.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/");
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
