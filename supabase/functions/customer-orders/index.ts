import { adminClient, getUserFromRequest } from "../_shared/auth.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return errorResponse("Method not allowed.", 405, "method_not_allowed");

  try {
    const user = await getUserFromRequest(req);
    if (!user) return errorResponse("Authentication is required.", 401, "auth_required");
    const supabase = adminClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return jsonResponse({ orders: data || [] });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Unable to load orders.", 500, "orders_load_failed");
  }
});
