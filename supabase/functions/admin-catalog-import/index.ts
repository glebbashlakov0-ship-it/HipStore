import { adminClient, requireAdmin } from "../_shared/auth.ts";
import { normalizeProduct } from "../_shared/catalog.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

type RawProduct = Record<string, unknown>;

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function rowFromProduct(item: RawProduct) {
  const product = normalizeProduct(item);
  if (!product.id || !product.sku || !product.routeSlug) {
    throw new Error("Each product requires id, sku, and routeSlug.");
  }
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    source_slug: product.sourceSlug,
    route_slug: product.routeSlug,
    brand: product.brand,
    title: product.title,
    price: product.price,
    old_price: product.oldPrice,
    currency: product.currency,
    is_sale: product.isSale,
    category_path: product.categoryPath,
    category_slug: product.categorySlug,
    gender: product.gender,
    image_url: product.image,
    main_image_url: product.mainImage,
    images: product.images,
    description: product.description,
    short_description: product.shortDescription,
    details: product.details,
    material: product.material,
    colour: product.colour,
    sizes: product.sizes,
    in_stock: product.inStock,
    source_url: product.sourceUrl,
    product_code: product.productCode,
    raw: item,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse("Method not allowed.", 405, "method_not_allowed");

  try {
    await requireAdmin(req);
    const body = await req.json();
    const supabase = adminClient();

    if (Array.isArray(body?.products)) {
      const rows = body.products.map((item: unknown) => rowFromProduct((item && typeof item === "object" ? item : {}) as RawProduct));
      if (!rows.length) throw new Error("products must contain at least one product.");
      const { error } = await supabase
        .from("catalog_products")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
      return jsonResponse({ ok: true, upserted: rows.length });
    }

    if (Array.isArray(body?.keep_ids)) {
      const keepIds = new Set(body.keep_ids.map((value: unknown) => clean(value)).filter(Boolean));
      const { data, error } = await supabase.from("catalog_products").select("id");
      if (error) throw error;
      const staleIds = (Array.isArray(data) ? data : [])
        .map((row: { id?: unknown }) => clean(row.id))
        .filter((id: string) => id && !keepIds.has(id));
      for (let index = 0; index < staleIds.length; index += 200) {
        const chunk = staleIds.slice(index, index + 200);
        const { error: deleteError } = await supabase.from("catalog_products").delete().in("id", chunk);
        if (deleteError) throw deleteError;
      }
      return jsonResponse({ ok: true, deleted: staleIds.length });
    }

    return errorResponse("Provide products or keep_ids.", 400, "validation_error");
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Catalog import failed.", 400, "catalog_import_failed");
  }
});
