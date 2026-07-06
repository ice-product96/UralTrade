/**
 * Импорт каталога с ural-trade96.ru в UralTrade.
 *
 * npm run db:import
 * npm run db:import -- --dry-run          # только парсинг, без записи в БД
 * npm run db:import -- --clear-demo       # удалить демо-данные перед импортом
 * npm run db:import -- --limit-categories 3 --limit-products 20
 */

import { PrismaClient, FieldType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const BASE_URL = "https://ural-trade96.ru";
const DELAY_MS = 350;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const clearDemo = args.includes("--clear-demo");
const limitCategories = readFlagNumber("--limit-categories");
const limitProducts = readFlagNumber("--limit-products");

function readFlagNumber(flag: string): number | undefined {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return undefined;
  const value = Number(args[index + 1]);
  return Number.isFinite(value) ? value : undefined;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type CategoryNode = {
  path: string;
  name: string;
  depth: number;
  parentPath: string | null;
};

type ParsedProduct = {
  url: string;
  name: string;
  sku: string;
  price: number;
  brand: string | null;
  shortDescription: string;
  fullDescription: string;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryPath: string;
  images: { url: string; alt: string }[];
  specs: { key: string; value: string }[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripTags(html: string) {
  return decodeHtml(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ё/g, "e")
    .replace(/й/g, "i")
    .replace(/[а]/g, "a")
    .replace(/[б]/g, "b")
    .replace(/[в]/g, "v")
    .replace(/[г]/g, "g")
    .replace(/[д]/g, "d")
    .replace(/[еэ]/g, "e")
    .replace(/[ж]/g, "zh")
    .replace(/[з]/g, "z")
    .replace(/[и]/g, "i")
    .replace(/[к]/g, "k")
    .replace(/[л]/g, "l")
    .replace(/[м]/g, "m")
    .replace(/[н]/g, "n")
    .replace(/[о]/g, "o")
    .replace(/[п]/g, "p")
    .replace(/[р]/g, "r")
    .replace(/[с]/g, "s")
    .replace(/[т]/g, "t")
    .replace(/[у]/g, "u")
    .replace(/[ф]/g, "f")
    .replace(/[х]/g, "h")
    .replace(/[ц]/g, "c")
    .replace(/[ч]/g, "ch")
    .replace(/[шщ]/g, "sh")
    .replace(/[ы]/g, "y")
    .replace(/[ю]/g, "yu")
    .replace(/[я]/g, "ya")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeStorePath(href: string): string | null {
  let path = href.trim();
  if (path.startsWith("http")) {
    try {
      path = new URL(path).pathname;
    } catch {
      return null;
    }
  }
  const queryIndex = path.indexOf("?");
  if (queryIndex !== -1) path = path.slice(0, queryIndex);
  path = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path.startsWith("store")) return null;
  path = path.replace(/^store\/?/, "");
  return path || "";
}

function isProductStorePath(path: string) {
  return path.split("/").filter(Boolean).length >= 3;
}

function isPosProductUrl(url: string) {
  try {
    const parsed = new URL(url, BASE_URL);
    return parsed.searchParams.has("pos") && normalizeStorePath(parsed.pathname) !== null;
  } catch {
    return false;
  }
}

function normalizeProductUrl(url: string): string | null {
  try {
    const parsed = new URL(url, BASE_URL);
    parsed.search = "";
    parsed.hash = "";
    const storePath = normalizeStorePath(parsed.pathname);
    if (!storePath || !isProductStorePath(storePath)) return null;
    parsed.pathname = `/store/${storePath}/`;
    return parsed.toString();
  } catch {
    return null;
  }
}

function registerProductLink(href: string, productUrls: Set<string>) {
  if (isPosProductUrl(href)) {
    productUrls.add(href.split("#")[0]);
    return;
  }
  const normalized = normalizeProductUrl(href);
  if (normalized) productUrls.add(normalized);
}

function buildProductSlug(storePath: string, sku: string, name: string) {
  const base = isProductStorePath(storePath)
    ? pathToSlug(storePath)
    : slugify(name) || "product";
  return `${base}-${sku}`;
}

function pathToSlug(path: string) {
  return path.replace(/\//g, "-").replace(/_/g, "-");
}

/** Убираем корень «Мобильная гидравлика» (store/), верхний уровень — Гидроцилиндры, Гидронасосы и т.д. */
function prepareStoreCategories(categories: CategoryNode[]): CategoryNode[] {
  return categories
    .filter((category) => category.path !== "")
    .map((category) => ({
      ...category,
      parentPath: !category.parentPath ? null : category.parentPath,
    }));
}

function toAbsoluteUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function fetchHtml(relativePath: string, attempt = 1): Promise<string> {
  const url = relativePath.startsWith("http") ? relativePath : `${BASE_URL}/${relativePath.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "UralTrade-Importer/1.0",
      Accept: "text/html",
    },
  });
  if (!response.ok) {
    if (attempt < 3) {
      await sleep(1000 * attempt);
      return fetchHtml(relativePath, attempt + 1);
    }
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

function parseSitemapCategories(html: string): CategoryNode[] {
  const start = html.indexOf('<ul class="uss_sitemap">');
  if (start === -1) return [];
  const end = html.indexOf('<div class="cleaner"></div>', start);
  const section = end === -1 ? html.slice(start) : html.slice(start, end);

  const links = [...section.matchAll(/<a href="([^"]+)" class="map_(\d+)">([^<]+)<\/a>/g)];
  const stack: { path: string; depth: number }[] = [];
  const categories: CategoryNode[] = [];

  for (const [, href, depthRaw, name] of links) {
    const depth = Number(depthRaw);
    const path = normalizeStorePath(href);
    if (path === null) continue;

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    const parentPath = stack.length > 0 ? stack[stack.length - 1].path : null;
    categories.push({
      path,
      name: decodeHtml(name),
      depth,
      parentPath,
    });
    stack.push({ path, depth });
  }

  return categories;
}

function parseCategoryPage(html: string, currentPath: string) {
  const subcategories: { path: string; name: string }[] = [];
  const productUrls = new Set<string>();

  const catsBlock = html.match(/<div class="uss_shop_block_cat uss_shop_cats">([\s\S]*?)<\/div>\s*<div class="(?:filter|uss_cleaner)"/);
  if (catsBlock) {
    const links = [...catsBlock[1].matchAll(/<div class="uss_shop_cat_name">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
    for (const [, href, name] of links) {
      const path = normalizeStorePath(href);
      if (path && path !== currentPath && path.startsWith(currentPath ? `${currentPath}/` : "")) {
        subcategories.push({ path, name: decodeHtml(name) });
      }
    }
  }

  const items = [...html.matchAll(/<div class="uss_eshop_item[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g)];
  for (const item of items) {
    const block = item[0];
    const hrefMatch = block.match(/<a href="([^"]+)"[^>]*title="Подробное описание товара"/);
    if (hrefMatch) {
      registerProductLink(hrefMatch[1], productUrls);
      continue;
    }
    const anyLink = block.match(/<a href="(https?:\/\/ural-trade96\.ru\/store\/[^"]+)"/);
    if (anyLink) registerProductLink(anyLink[1], productUrls);
  }

  return {
    subcategories,
    productUrls: [...productUrls],
    isProductPage: html.includes("uss_shop_detail") && !html.includes("uss_shop_blocks_view"),
  };
}

function parseDescriptionSpecs(descriptionHtml: string) {
  const text = descriptionHtml.replace(/<br\s*\/?>/gi, "\n");
  const lines = stripTags(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const specs: { key: string; value: string }[] = [];
  let shortText = "";

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(.+)$/);
    if (match) {
      specs.push({ key: match[1].trim(), value: match[2].trim() });
    } else if (!shortText) {
      shortText = line;
    }
  }

  return { shortText, specs };
}

function parseProductPage(html: string, url: string): ParsedProduct | null {
  if (!html.includes("uss_shop_detail")) return null;

  const name =
    decodeHtml(html.match(/<h1>([^<]+)<\/h1>/)?.[1] ?? "") ||
    decodeHtml(html.match(/<meta itemprop="name" content="([^"]+)"/)?.[1] ?? "");
  if (!name) return null;

  const sku = html.match(/<div class="uss_shop_uid"><strong>Код:<\/strong>\s*([^<]+)<\/div>/)?.[1]?.trim() ?? "";
  if (!sku) return null;

  const brand = html.match(/<div class="uss_shop_producer"><strong>Производитель:<\/strong>\s*([^<]+)<\/div>/)?.[1]?.trim() ?? null;
  const descriptionHtml = html.match(/<div class="uss_shop_description"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const { shortText, specs } = parseDescriptionSpecs(descriptionHtml);

  const priceMeta = html.match(/<meta itemprop="price" content="([^"]+)"/)?.[1];
  let price = Number(priceMeta ?? 0);
  if (!Number.isFinite(price)) price = 0;

  const priceText = html.match(/<div class="uss_shop_price">[\s\S]*?<span class="price">([\s\S]*?)<\/span>/)?.[1] ?? "";
  if (price === 0 && priceText && !priceText.includes("по запросу")) {
    const digits = priceText.replace(/[^\d.,]/g, "").replace(",", ".");
    const parsed = Number(digits);
    if (Number.isFinite(parsed) && parsed > 0) price = parsed;
  }

  const metaTitle = decodeHtml(html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "") || null;
  const metaDescription = decodeHtml(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "") || null;

  const breadcrumbLinks = [...html.matchAll(/<div class="l_speedbar">[\s\S]*?<\/div>/g)]
    .flatMap((match) => [...match[0].matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)])
    .filter(([, href]) => href.includes("store"));

  const categoryHref = breadcrumbLinks.length > 0 ? breadcrumbLinks[breadcrumbLinks.length - 1][1] : "";
  const categoryPath = normalizeStorePath(categoryHref) ?? "";

  const images: { url: string; alt: string }[] = [];
  const seen = new Set<string>();

  const addImage = (src: string | undefined, alt: string) => {
    if (!src) return;
    const absolute = toAbsoluteUrl(src);
    if (seen.has(absolute)) return;
    seen.add(absolute);
    images.push({ url: absolute, alt });
  };

  addImage(html.match(/<a[^>]*class="[^"]*big_image_wrap[^"]*"[^>]*href="([^"]+)"/)?.[1], name);
  addImage(html.match(/<img class="big_image"[^>]*src="([^"]+)"/)?.[1], name);

  const tab0 = html.match(/<div id="tab_0" class="tab_item">([\s\S]*?)<\/div>/)?.[1] ?? "";
  for (const img of tab0.matchAll(/<img[^>]*src="([^"]+)"/g)) {
    addImage(img[1], `${name} — схема`);
  }

  const tab1 = html.match(/<div id="tab_1" class="tab_item"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const applicability = stripTags(tab1);

  const fullDescriptionParts = [];
  if (descriptionHtml) fullDescriptionParts.push(`<p>${descriptionHtml}</p>`);
  if (tab0.trim()) fullDescriptionParts.push(`<div class="product-tab-specs">${tab0}</div>`);
  if (applicability) fullDescriptionParts.push(`<h3>Применяемость</h3><p>${applicability}</p>`);

  return {
    url,
    name,
    sku,
    price,
    brand,
    shortDescription: shortText || stripTags(descriptionHtml) || name,
    fullDescription: fullDescriptionParts.join("\n") || `<p>${name}</p>`,
    metaTitle,
    metaDescription,
    categoryPath,
    images,
    specs,
  };
}

async function ensureHydraulicsTemplate() {
  const template = await prisma.fieldTemplate.upsert({
    where: { id: "template-hydraulics" },
    update: { name: "Шаблон: Мобильная гидравлика" },
    create: {
      id: "template-hydraulics",
      name: "Шаблон: Мобильная гидравлика",
      description: "Характеристики запчастей, импортированные с ural-trade96.ru",
    },
  });

  const specsField = await prisma.fieldDefinition.upsert({
    where: { templateId_slug: { templateId: template.id, slug: "specs" } },
    update: {},
    create: {
      templateId: template.id,
      name: "Характеристики",
      slug: "specs",
      type: FieldType.KEY_VALUE,
      sortOrder: 10,
    },
  });

  return { template, specsField };
}

async function clearDemoCatalog() {
  await prisma.productRelation.deleteMany();
  await prisma.productFieldValue.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.redirect.deleteMany({ where: { fromPath: { startsWith: "/store/" } } });
}

async function importCategories(categories: CategoryNode[], templateId: string) {
  const byPath = new Map<string, string>();

  const sorted = [...categories].sort((a, b) => a.depth - b.depth || a.path.localeCompare(b.path));
  const slice = limitCategories ? sorted.slice(0, limitCategories) : sorted;

  for (const [index, category] of slice.entries()) {
    const slug = pathToSlug(category.path);
    let parentId: string | null = null;
    if (category.parentPath && byPath.has(category.parentPath)) {
      parentId = byPath.get(category.parentPath)!;
    }

    if (dryRun) {
      console.log(`[category] ${category.path} -> ${slug}`);
      byPath.set(category.path, `dry-${slug}`);
      continue;
    }

    const record = await prisma.category.upsert({
      where: { slug },
      update: {
        name: category.name,
        parentId,
        templateId,
        sortOrder: index * 10,
        h1: category.name,
      },
      create: {
        name: category.name,
        slug,
        parentId,
        templateId,
        sortOrder: index * 10,
        h1: category.name,
        metaTitle: `${category.name} купить — UralTrade`,
        metaDescription: `${category.name}: каталог запчастей с доставкой по России.`,
      },
    });
    byPath.set(category.path, record.id);

    await prisma.redirect.upsert({
      where: { fromPath: `/store/${category.path}/` },
      update: { toPath: `/catalog/${slug}` },
      create: { fromPath: `/store/${category.path}/`, toPath: `/catalog/${slug}` },
    });
  }

  if (!dryRun) {
    await prisma.redirect.upsert({
      where: { fromPath: "/store/" },
      update: { toPath: "/catalog" },
      create: { fromPath: "/store/", toPath: "/catalog" },
    });
  }

  return byPath;
}

async function getOrCreateBrand(name: string, cache: Map<string, string>) {
  const slug = slugify(name);
  if (cache.has(slug)) return cache.get(slug)!;

  if (dryRun) {
    cache.set(slug, `dry-brand-${slug}`);
    return cache.get(slug)!;
  }

  const brand = await prisma.brand.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  });
  cache.set(slug, brand.id);
  return brand.id;
}

async function importProduct(
  product: ParsedProduct,
  categoryPathToId: Map<string, string>,
  templateId: string,
  specsFieldId: string,
  brandCache: Map<string, string>,
) {
  let categoryId = categoryPathToId.get(product.categoryPath);
  if (!categoryId) {
    const fallback = [...categoryPathToId.entries()].find(([path]) => product.categoryPath.startsWith(path));
    categoryId = fallback?.[1];
  }
  if (!categoryId) {
    console.warn(`  ! категория не найдена: ${product.categoryPath} для ${product.sku}`);
    return;
  }

  const urlPath = normalizeStorePath(product.url) ?? "";
  const slug = buildProductSlug(urlPath, product.sku, product.name);

  const brandId = product.brand ? await getOrCreateBrand(product.brand, brandCache) : null;

  if (dryRun) {
    console.log(`[product] ${product.sku} ${product.name}`);
    return;
  }

  const record = await prisma.product.upsert({
    where: { sku: product.sku },
    update: {
      name: product.name,
      slug,
      price: product.price,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      categoryId,
      brandId,
      templateId,
      metaTitle: product.metaTitle ?? undefined,
      metaDescription: product.metaDescription ?? undefined,
      h1: product.name,
    },
    create: {
      name: product.name,
      slug,
      sku: product.sku,
      price: product.price,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      categoryId,
      brandId,
      templateId,
      metaTitle: product.metaTitle ?? `${product.name} купить — UralTrade`,
      metaDescription: product.metaDescription ?? `${product.name}: характеристики, фото, цена.`,
      h1: product.name,
    },
  }).catch(async (error: { code?: string }) => {
    if (error.code !== "P2002") throw error;
    const fallbackSlug = `p-${product.sku}`;
    return prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: fallbackSlug,
        price: product.price,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        categoryId,
        brandId,
        templateId,
        metaTitle: product.metaTitle ?? undefined,
        metaDescription: product.metaDescription ?? undefined,
        h1: product.name,
      },
      create: {
        name: product.name,
        slug: fallbackSlug,
        sku: product.sku,
        price: product.price,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        categoryId,
        brandId,
        templateId,
        metaTitle: product.metaTitle ?? `${product.name} купить — UralTrade`,
        metaDescription: product.metaDescription ?? `${product.name}: характеристики, фото, цена.`,
        h1: product.name,
      },
    });
  });

  await prisma.productImage.deleteMany({ where: { productId: record.id } });
  if (product.images.length > 0) {
    await prisma.productImage.createMany({
      data: product.images.map((image, index) => ({
        productId: record.id,
        url: image.url,
        alt: image.alt,
        sortOrder: (index + 1) * 10,
      })),
    });
  }

  await prisma.productFieldValue.deleteMany({
    where: { productId: record.id, fieldId: specsFieldId },
  });
  if (product.specs.length > 0) {
    await prisma.productFieldValue.create({
      data: {
        productId: record.id,
        fieldId: specsFieldId,
        valueJson: product.specs,
      },
    });
  }

  const parsedUrl = new URL(product.url, BASE_URL);
  const oldPath = `${parsedUrl.pathname.replace(/\/+$/, "")}${parsedUrl.search}`;
  await prisma.redirect.upsert({
    where: { fromPath: oldPath },
    update: { toPath: `/product/${record.slug}` },
    create: { fromPath: oldPath, toPath: `/product/${record.slug}` },
  });
}

async function discoverCatalog(initialCategories: CategoryNode[]) {
  const categories = new Map<string, CategoryNode>();
  for (const category of prepareStoreCategories(initialCategories)) {
    categories.set(category.path, category);
  }

  const queue = [...categories.keys()];
  const seen = new Set(queue);
  const productUrls = new Set<string>();

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (limitCategories && categories.size > limitCategories && !categories.has(path)) continue;

    const html = await fetchHtml(`store/${path}/`);
    await sleep(DELAY_MS);

    const parsed = parseCategoryPage(html, path);
    if (parsed.isProductPage) {
      const normalized = normalizeProductUrl(`${BASE_URL}/store/${path}/`);
      if (normalized) productUrls.add(normalized);
      continue;
    }

    for (const sub of parsed.subcategories) {
      if (!categories.has(sub.path)) {
        categories.set(sub.path, {
          path: sub.path,
          name: sub.name,
          depth: path ? path.split("/").length + 1 : 1,
          parentPath: path || null,
        });
      }
      if (!seen.has(sub.path)) {
        seen.add(sub.path);
        queue.push(sub.path);
      }
    }

    for (const url of parsed.productUrls) {
      productUrls.add(url);
    }

    console.log(`  crawled ${path}: +${parsed.subcategories.length} subcats, +${parsed.productUrls.length} products`);
  }

  return {
    categories: prepareStoreCategories([...categories.values()]),
    productUrls: [...productUrls],
  };
}

async function main() {
  console.log("Импорт каталога с ural-trade96.ru");
  console.log(`dryRun=${dryRun}, clearDemo=${clearDemo}`);

  if (clearDemo && !dryRun) {
    console.log("Очистка демо-каталога...");
    await clearDemoCatalog();
  }

  console.log("Загрузка sitemap...");
  const sitemapHtml = await fetchHtml("/sitemap/");
  const sitemapCategories = prepareStoreCategories(parseSitemapCategories(sitemapHtml));
  console.log(`Категорий в sitemap: ${sitemapCategories.length}`);

  console.log("Обход категорий...");
  const discovered = await discoverCatalog(sitemapCategories);
  console.log(`Всего категорий: ${discovered.categories.length}, товаров: ${discovered.productUrls.length}`);

  let templateId = "template-hydraulics";
  let specsFieldId = "dry-specs";

  if (!dryRun) {
    const { template, specsField } = await ensureHydraulicsTemplate();
    templateId = template.id;
    specsFieldId = specsField.id;
  }

  const categoryPathToId = await importCategories(discovered.categories, templateId);

  const productList = limitProducts ? discovered.productUrls.slice(0, limitProducts) : discovered.productUrls;
  console.log(`Импорт ${productList.length} товаров...`);

  const brandCache = new Map<string, string>();
  const seenSkus = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (const [index, rawUrl] of productList.entries()) {
    const canonical = normalizeProductUrl(rawUrl);
    const fetchUrl = canonical ?? (isPosProductUrl(rawUrl) ? rawUrl : null);
    if (!fetchUrl) {
      skipped += 1;
      continue;
    }

    try {
      const html = await fetchHtml(fetchUrl);
      await sleep(DELAY_MS);
      const product = parseProductPage(html, fetchUrl);
      if (!product) {
        console.warn(`  skip (not a product): ${fetchUrl}`);
        skipped += 1;
        continue;
      }
      if (seenSkus.has(product.sku)) {
        skipped += 1;
        continue;
      }
      seenSkus.add(product.sku);

      await importProduct(product, categoryPathToId, templateId, specsFieldId, brandCache);
      imported += 1;
      if ((index + 1) % 25 === 0) {
        console.log(`  ... ${index + 1}/${productList.length}`);
      }
    } catch (error) {
      console.error(`  error ${fetchUrl}:`, error);
    }
  }

  if (!dryRun) {
    await prisma.homeBanner.updateMany({
      where: { id: "banner-main" },
      data: { href: "/catalog" },
    });
  }

  console.log(`Готово. Импортировано товаров: ${imported}, пропущено: ${skipped}`);
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
