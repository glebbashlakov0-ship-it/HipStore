type RawProduct = Record<string, unknown>;

export type CatalogProduct = {
  id: string;
  sku: string;
  slug: string;
  routeSlug: string;
  sourceSlug: string;
  title: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  isSale: boolean;
  categoryPath: string;
  categorySlug: string;
  gender: string;
  productCode: string;
  image: string;
  mainImage: string;
  images: string[];
  description: string;
  shortDescription: string;
  details: string;
  material: string;
  colour: string;
  sourceUrl: string;
  inStock: boolean;
  sizes: Array<{ label: string; sku: string; available: boolean }>;
};

type CatalogDbClient = {
  from: (table: string) => {
    select: (columns: string) => {
      order: (column: string, options?: Record<string, unknown>) => {
        range: (from: number, to: number) => Promise<{ data: unknown[] | null; error: Error | null }>;
      };
      range: (from: number, to: number) => Promise<{ data: unknown[] | null; error: Error | null }>;
    };
  };
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function slugify(value: unknown) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

function normalizeSize(size: unknown) {
  if (typeof size === "string" || typeof size === "number") {
    return { label: clean(size), sku: "", available: true };
  }
  const source = (size && typeof size === "object" ? size : {}) as Record<string, unknown>;
  return {
    label: clean(source.label || source.size || source.name || source.value),
    sku: clean(source.sku_variant || source.sku),
    available: !(source.available === false || source.inStock === false || source.in_stock === false),
  };
}

export function normalizeProduct(item: RawProduct): CatalogProduct {
  const id = clean(item.id || item.product_id || item.productId || item.sku);
  const sku = clean(item.sku || item.product_id || item.productId || item.id);
  const sourceSlug = clean(item.sourceSlug || item.source_slug || item.slug) || slugify(item.title || item.full_name || id || sku);
  const directRouteSlug = clean(item.routeSlug || item.route_slug);
  const routeSlug = directRouteSlug || (sourceSlug && id ? `${sourceSlug}-${id}` : sourceSlug);
  const images = Array.isArray(item.images) ? item.images.filter(Boolean).map(clean) : [];
  const image = clean(item.mainImage || item.main_image || item.image_url || item.image || images[0]);
  const oldPriceRaw = item.oldPrice ?? item.old_price ?? item.was_price;
  const oldPrice = oldPriceRaw == null ? null : money(oldPriceRaw);
  const price = money(item.price);
  const sizes = (Array.isArray(item.sizes) ? item.sizes : [])
    .map(normalizeSize)
    .filter((size) => size.label);

  return {
    id,
    sku,
    slug: clean(item.slug || sourceSlug),
    routeSlug,
    sourceSlug,
    title: clean(item.title || item.full_name || item.name) || "Product",
    brand: clean(item.brand),
    price,
    oldPrice,
    currency: clean(item.currency) || "GBP",
    isSale: item.isSale != null ? Boolean(item.isSale) : oldPrice != null && oldPrice > price,
    categoryPath: clean(item.categoryPath || item.category_path || item.category),
    categorySlug: clean(item.categorySlug || item.category_slug),
    gender: clean(item.gender),
    productCode: clean(item.productCode || item.product_code) || sku,
    image,
    mainImage: image,
    images: images.length ? images : (image ? [image] : []),
    description: clean(item.description),
    shortDescription: clean(item.shortDescription || item.short_description),
    details: clean(item.details),
    material: clean(item.material),
    colour: clean(item.colour || item.color),
    sourceUrl: clean(item.sourceUrl || item.source_url || item.product_url),
    inStock: item.inStock != null ? Boolean(item.inStock) : !(item.in_stock === false || item.status === "out_of_stock"),
    sizes,
  };
}

function normalizeCatalogProductRow(item: RawProduct): CatalogProduct {
  return normalizeProduct({
    id: item.id,
    sku: item.sku,
    slug: item.slug,
    sourceSlug: item.source_slug,
    routeSlug: item.route_slug,
    title: item.title,
    brand: item.brand,
    price: item.price,
    oldPrice: item.old_price,
    currency: item.currency,
    isSale: item.is_sale,
    categoryPath: item.category_path,
    categorySlug: item.category_slug,
    gender: item.gender,
    productCode: item.product_code,
    mainImage: item.main_image_url || item.image_url,
    image: item.image_url,
    images: item.images,
    description: item.description,
    shortDescription: item.short_description,
    details: item.details,
    material: item.material,
    colour: item.colour,
    sourceUrl: item.source_url,
    inStock: item.in_stock,
    sizes: item.sizes,
  });
}

export function findProduct(products: CatalogProduct[], identity: { slug?: string; product_id?: string; sku?: string }) {
  const slug = clean(identity.slug);
  const productId = clean(identity.product_id);
  const sku = clean(identity.sku);
  const matches = products.filter((product) => {
    return (
      (slug && (product.routeSlug === slug || product.sourceSlug === slug)) ||
      (productId && product.id === productId) ||
      (sku && product.sku === sku)
    );
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) throw new Error("Product identity is ambiguous.");
  throw new Error("Product was not found in the catalog.");
}

export function findSize(product: CatalogProduct, requestedSize: unknown) {
  const availableSizes = product.sizes.filter((size) => size.available !== false);
  const requested = clean(requestedSize);
  if (!availableSizes.length) return "ONE SIZE";
  if (!requested) throw new Error("Select a size before creating the order.");
  const match = availableSizes.find((size) => size.label === requested);
  if (!match) throw new Error("Selected size is not available.");
  return match.label;
}

export async function loadCatalog(dbClient?: CatalogDbClient) {
  const catalogUrl = Deno.env.get("CATALOG_JSON_URL");
  if (catalogUrl) {
    const url = catalogUrl.endsWith(".json") ? catalogUrl : `${catalogUrl.replace(/\/+$/, "")}/data/products.normalized.json`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog JSON could not be loaded.");
    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : Array.isArray(payload.products) ? payload.products : [];
    return items.map((item: RawProduct) => normalizeProduct(item)).filter((product: CatalogProduct) => product.routeSlug || product.id || product.sku);
  }

  if (dbClient) {
    const columns = [
      "id",
      "sku",
      "slug",
      "source_slug",
      "route_slug",
      "title",
      "brand",
      "price",
      "old_price",
      "currency",
      "is_sale",
      "category_path",
      "category_slug",
      "gender",
      "product_code",
      "image_url",
      "main_image_url",
      "images",
      "description",
      "short_description",
      "details",
      "material",
      "colour",
      "source_url",
      "in_stock",
      "sizes",
    ].join(",");
    const rows: unknown[] = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const query = dbClient
        .from("catalog_products")
        .select(columns)
        .order("id", { ascending: true });
      const { data, error } = await query.range(from, from + pageSize - 1);
      if (error) throw error;
      const page = Array.isArray(data) ? data : [];
      rows.push(...page);
      if (page.length < pageSize) break;
    }
    if (!rows.length) throw new Error("Catalog table is empty.");
    return rows.map((item: unknown) => normalizeCatalogProductRow(item as RawProduct)).filter((product: CatalogProduct) => product.routeSlug || product.id || product.sku);
  }

  const publicOrigin = Deno.env.get("PUBLIC_SITE_ORIGIN");
  if (publicOrigin) {
    const url = `${publicOrigin.replace(/\/+$/, "")}/data/products.normalized.json`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog JSON could not be loaded.");
    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : Array.isArray(payload.products) ? payload.products : [];
    return items.map((item: RawProduct) => normalizeProduct(item)).filter((product: CatalogProduct) => product.routeSlug || product.id || product.sku);
  }

  throw new Error("CATALOG_JSON_URL, PUBLIC_SITE_ORIGIN, or catalog_products table access is required.");
}
