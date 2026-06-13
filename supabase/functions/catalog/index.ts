import { adminClient } from "../_shared/auth.ts";
import { loadCatalog } from "../_shared/catalog.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return errorResponse("Method not allowed.", 405, "method_not_allowed");

  try {
    const catalog = await loadCatalog(adminClient());
    return jsonResponse(catalog, 200, {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Catalog could not be loaded.", 500, "catalog_unavailable");
  }
});
