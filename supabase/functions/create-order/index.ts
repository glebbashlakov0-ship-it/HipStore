import { adminClient, getUserFromRequest } from "../_shared/auth.ts";
import type { CatalogProduct } from "../_shared/catalog.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { findProduct, findSize, loadCatalog } from "../_shared/catalog.ts";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function money(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function required(payload: Record<string, unknown>, key: string) {
  const value = clean(payload[key]);
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function orderNumber() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `HIP-${stamp}-${suffix}`;
}

function snapshotProduct(rawItem: Record<string, unknown>, body: Record<string, unknown>, index: number): CatalogProduct {
  const selectedSize = clean(rawItem.selectedSize || rawItem.size || (index === 0 ? body.selectedSize || body.size : "")) || "ONE SIZE";
  const id = clean(rawItem.productId || rawItem.id || (index === 0 ? body.productId : "") || rawItem.sku);
  const sku = clean(rawItem.sku || rawItem.productId || rawItem.id || (index === 0 ? body.sku : ""));
  const routeSlug = clean(rawItem.routeSlug || rawItem.route_slug || (index === 0 ? body.routeSlug || body.slug : ""));
  const title = clean(rawItem.title || rawItem.name);
  const price = money(Number(rawItem.price || 0));

  if (!title) throw new Error("Product title is required when catalog validation is unavailable.");
  if (!price || price <= 0) throw new Error("Product price is required when catalog validation is unavailable.");
  if (!routeSlug && !id && !sku) throw new Error("Product identity is required when catalog validation is unavailable.");

  const oldPriceValue = rawItem.oldPrice ?? rawItem.old_price;
  return {
    id: id || sku || routeSlug,
    sku: sku || id || routeSlug,
    slug: clean(rawItem.slug || rawItem.sourceSlug || rawItem.source_slug || routeSlug),
    routeSlug: routeSlug || id || sku,
    sourceSlug: clean(rawItem.sourceSlug || rawItem.source_slug || routeSlug),
    title,
    brand: clean(rawItem.brand) || "Product",
    price,
    oldPrice: oldPriceValue == null || oldPriceValue === "" ? null : money(Number(oldPriceValue)),
    currency: clean(rawItem.currency) || "GBP",
    isSale: oldPriceValue != null && oldPriceValue !== "" && money(Number(oldPriceValue)) > price,
    categoryPath: clean(rawItem.categoryPath || rawItem.category_path || rawItem.category),
    categorySlug: clean(rawItem.categorySlug || rawItem.category_slug),
    gender: clean(rawItem.gender),
    productCode: clean(rawItem.productCode || rawItem.product_code) || sku || id,
    image: clean(rawItem.image || rawItem.image_url),
    mainImage: clean(rawItem.mainImage || rawItem.main_image || rawItem.image || rawItem.image_url),
    images: Array.isArray(rawItem.images) ? rawItem.images.filter(Boolean).map(clean) : [],
    description: clean(rawItem.description),
    shortDescription: clean(rawItem.shortDescription || rawItem.short_description),
    details: clean(rawItem.details),
    material: clean(rawItem.material),
    colour: clean(rawItem.colour || rawItem.color),
    sourceUrl: clean(rawItem.sourceUrl || rawItem.source_url),
    inStock: rawItem.inStock != null ? Boolean(rawItem.inStock) : !(rawItem.in_stock === false),
    sizes: [{ label: selectedSize, sku: clean(rawItem.sizeSku || rawItem.size_sku), available: true }],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405, "method_not_allowed");

  try {
    const body = await req.json();
    const customer = body.customer && typeof body.customer === "object" ? body.customer as Record<string, unknown> : {};
    const singleItem = body.item && typeof body.item === "object" ? body.item as Record<string, unknown> : {};
    const rawItems = Array.isArray(body.items) && body.items.length
      ? body.items.filter((entry: unknown) => entry && typeof entry === "object") as Array<Record<string, unknown>>
      : [singleItem];

    const email = required(customer, "email").toLowerCase();
    if (!/.+@.+\..+/.test(email)) throw new Error("A valid email is required.");
    const phone = required(customer, "phone");
    const firstName = required(customer, "firstName");
    const lastName = required(customer, "lastName");
    const address = required(customer, "address");
    const city = required(customer, "city");
    const postcode = required(customer, "postcode");
    const country = required(customer, "country");
    const state = clean(customer.state);
    const address2 = clean(customer.address2);

    const supabase = adminClient();
    let catalog: CatalogProduct[] = [];
    let catalogValidated = false;
    try {
      catalog = await loadCatalog(supabase);
      catalogValidated = true;
    } catch (_error) {
      catalog = [];
    }

    const items = rawItems.map((rawItem, index) => {
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(rawItem.quantity || (index === 0 ? body.quantity : 1) || 1))));
      const product = catalogValidated
        ? findProduct(catalog, {
            slug: clean(rawItem.routeSlug || (index === 0 ? body.routeSlug || body.slug : "")),
            product_id: clean(rawItem.productId || (index === 0 ? body.productId : "")),
            sku: clean(rawItem.sku || (index === 0 ? body.sku : "")),
          })
        : snapshotProduct(rawItem, body, index);
      if (!product.inStock) throw new Error(`Product "${product.title}" is out of stock.`);
      const selectedSize = findSize(product, rawItem.selectedSize || rawItem.size || (index === 0 ? body.selectedSize || body.size : ""));
      return {
        product,
        quantity,
        selectedSize,
        lineSubtotal: money(product.price * quantity),
      };
    });

    if (!items.length) throw new Error("At least one basket item is required.");

    const subtotal = money(items.reduce((sum, entry) => sum + entry.lineSubtotal, 0));
    const shipping = money(Number(body.shipping || 0));
    const total = money(subtotal + shipping);
    const user = await getUserFromRequest(req);

    const orderPayload = {
      order_number: orderNumber(),
      customer_id: user?.id || null,
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      shipping_address: address,
      shipping_address_2: address2,
      shipping_city: city,
      shipping_state: state,
      shipping_postcode: postcode,
      shipping_country: country,
      status: "payment_pending",
      payment_status: "payment_not_configured",
      payment_method: "manual_payment",
      currency: items[0].product.currency,
      subtotal,
      shipping,
      total,
      metadata: {
        payment_note: "Payment integration is not configured.",
        catalog_validation: catalogValidated ? "catalog" : "checkout_snapshot",
        source_url: items[0].product.sourceUrl,
      },
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("*")
      .single();
    if (orderError) throw orderError;

    const { error: itemError } = await supabase.from("order_items").insert(items.map((entry) => ({
      order_id: order.id,
      product_id: entry.product.id,
      route_slug: entry.product.routeSlug,
      sku: entry.product.sku,
      product_code: entry.product.productCode,
      title: entry.product.title,
      brand: entry.product.brand,
      selected_size: entry.selectedSize,
      quantity: entry.quantity,
      unit_price: entry.product.price,
      old_price: entry.product.oldPrice,
      image_url: entry.product.image,
    })));
    if (itemError) throw itemError;

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      old_status: null,
      new_status: "payment_pending",
      changed_by: user?.id || null,
      note: "Order created without payment integration.",
    });

    return jsonResponse({
      order_number: order.order_number,
      id: order.id,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      message: "Order received. Payment is not configured yet.",
      order: {
        ...order,
        item: {
          product_id: items[0].product.id,
          route_slug: items[0].product.routeSlug,
          sku: items[0].product.sku,
          product_code: items[0].product.productCode,
          title: items[0].product.title,
          brand: items[0].product.brand,
          selected_size: items[0].selectedSize,
          quantity: items[0].quantity,
          unit_price: items[0].product.price,
          old_price: items[0].product.oldPrice,
          image_url: items[0].product.image,
        },
        items: items.map((entry) => ({
          product_id: entry.product.id,
          route_slug: entry.product.routeSlug,
          sku: entry.product.sku,
          product_code: entry.product.productCode,
          title: entry.product.title,
          brand: entry.product.brand,
          selected_size: entry.selectedSize,
          quantity: entry.quantity,
          unit_price: entry.product.price,
          old_price: entry.product.oldPrice,
          image_url: entry.product.image,
        })),
      },
    }, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Unable to create order.", 400, "order_validation_failed");
  }
});
