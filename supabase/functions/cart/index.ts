import { adminClient, getUserFromRequest } from "../_shared/auth.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

function quantity(value: unknown) {
  const amount = Math.floor(Number(value || 1));
  if (!Number.isFinite(amount)) return 1;
  return Math.max(1, Math.min(99, amount));
}

function normalizeItem(raw: Record<string, unknown>) {
  const productId = clean(raw.productId || raw.product_id || raw.id || raw.sku);
  const routeSlug = clean(raw.routeSlug || raw.route_slug);
  const sku = clean(raw.sku || raw.productId || raw.product_id || raw.id);
  const title = clean(raw.title || raw.name);
  const selectedSize = clean(raw.selectedSize || raw.selected_size || raw.size) || "ONE SIZE";
  const unitPrice = money(raw.price ?? raw.unitPrice ?? raw.unit_price);
  if (!title || (!routeSlug && !productId && !sku)) return null;
  return {
    product_id: productId || sku || routeSlug,
    route_slug: routeSlug || productId || sku,
    sku: sku || productId || routeSlug,
    product_code: clean(raw.productCode || raw.product_code),
    title,
    brand: clean(raw.brand),
    selected_size: selectedSize,
    size_sku: clean(raw.sizeSku || raw.size_sku),
    quantity: quantity(raw.quantity),
    unit_price: unitPrice,
    old_price: raw.oldPrice == null && raw.old_price == null ? null : money(raw.oldPrice ?? raw.old_price),
    currency: clean(raw.currency) || "GBP",
    image_url: clean(raw.image || raw.image_url),
    source_url: clean(raw.sourceUrl || raw.source_url),
    in_stock: raw.inStock != null ? Boolean(raw.inStock) : !(raw.in_stock === false),
  };
}

function toClientItem(item: Record<string, unknown>) {
  return {
    routeSlug: item.route_slug,
    id: item.product_id,
    sku: item.sku,
    productCode: item.product_code,
    brand: item.brand,
    title: item.title,
    price: Number(item.unit_price || 0),
    oldPrice: item.old_price == null ? null : Number(item.old_price),
    currency: item.currency || "GBP",
    image: item.image_url,
    size: item.selected_size || "ONE SIZE",
    sizeSku: item.size_sku || "",
    quantity: Number(item.quantity || 1),
    sourceUrl: item.source_url || "",
    inStock: item.in_stock !== false,
    addedAt: item.added_at,
  };
}

async function loadCart(supabase: ReturnType<typeof adminClient>, cartId: string, userId?: string | null) {
  const { data: cart, error: cartError } = await supabase
    .from("shopping_carts")
    .select("id, customer_id, status, currency, updated_at")
    .eq("id", cartId)
    .eq("status", "active")
    .maybeSingle();
  if (cartError) throw cartError;

  if (!cart) return { cart_id: cartId, items: [] };
  if (cart.customer_id && userId && cart.customer_id !== userId) return { cart_id: cartId, items: [] };

  const { data: items, error: itemError } = await supabase
    .from("shopping_cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .order("added_at", { ascending: false });
  if (itemError) throw itemError;

  return {
    cart_id: cart.id,
    items: (items || []).map((item: Record<string, unknown>) => toClientItem(item)),
    updated_at: cart.updated_at,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = adminClient();
    const user = await getUserFromRequest(req);
    const url = new URL(req.url);

    if (req.method === "GET") {
      const cartId = clean(url.searchParams.get("cart_id"));
      if (!cartId) return jsonResponse({ cart_id: "", items: [] });
      return jsonResponse(await loadCart(supabase, cartId, user?.id));
    }

    if (req.method === "DELETE") {
      const body = await req.json().catch(() => ({}));
      const cartId = clean(body.cart_id || url.searchParams.get("cart_id"));
      if (!cartId) return errorResponse("cart_id is required.", 400, "validation_error");
      await supabase.from("shopping_cart_items").delete().eq("cart_id", cartId);
      await supabase.from("shopping_carts").update({ status: "abandoned" }).eq("id", cartId);
      return jsonResponse({ cart_id: cartId, items: [] });
    }

    if (req.method !== "POST" && req.method !== "PATCH") {
      return errorResponse("Method not allowed.", 405, "method_not_allowed");
    }

    const body = await req.json();
    const cartId = clean(body.cart_id || body.cartId) || crypto.randomUUID();
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    const items = rawItems
      .filter((item: unknown) => item && typeof item === "object")
      .map((item: unknown) => normalizeItem(item as Record<string, unknown>))
      .filter(Boolean) as Array<Record<string, unknown>>;
    const currency = clean(items[0]?.currency) || "GBP";

    const { error: cartError } = await supabase.from("shopping_carts").upsert({
      id: cartId,
      customer_id: user?.id || null,
      status: "active",
      currency,
    });
    if (cartError) throw cartError;

    await supabase.from("shopping_cart_items").delete().eq("cart_id", cartId);
    if (items.length) {
      const { error: itemError } = await supabase.from("shopping_cart_items").insert(items.map((item) => ({
        cart_id: cartId,
        ...item,
      })));
      if (itemError) throw itemError;
    }

    return jsonResponse(await loadCart(supabase, cartId, user?.id));
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Cart request failed.", 400, "cart_request_failed");
  }
});
