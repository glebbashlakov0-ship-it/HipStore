import { requireAdmin } from "../_shared/auth.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

const ORDER_STATUSES = new Set(["payment_pending", "processing", "shipped", "completed", "cancelled"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user, admin, supabase } = await requireAdmin(req);
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "orders";

    if (req.method === "GET" && mode === "ping") {
      return jsonResponse({ ok: true, admin: { user_id: admin.user_id, role: admin.role } });
    }

    if (req.method === "GET" && mode === "customers") {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("customer_id, email, phone, first_name, last_name, total, currency, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const byCustomer = new Map<string, Record<string, unknown>>();
      for (const order of orders || []) {
        const key = String(order.customer_id || order.email || order.phone || crypto.randomUUID());
        const existing = byCustomer.get(key) || {
          customer_id: order.customer_id,
          email: order.email,
          phone: order.phone,
          first_name: order.first_name,
          last_name: order.last_name,
          orders_count: 0,
          total_spent: 0,
          currency: order.currency || "GBP",
          last_order_at: order.created_at,
        };
        existing.orders_count = Number(existing.orders_count || 0) + 1;
        existing.total_spent = Number(existing.total_spent || 0) + Number(order.total || 0);
        byCustomer.set(key, existing);
      }
      return jsonResponse({ customers: Array.from(byCustomer.values()) });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), order_status_history(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ orders: data || [] });
    }

    if (req.method === "PATCH") {
      const body = await req.json();
      const orderId = String(body.order_id || "").trim();
      const status = String(body.status || "").trim();
      if (!orderId) return errorResponse("order_id is required.", 400, "validation_error");
      if (!ORDER_STATUSES.has(status)) return errorResponse("Invalid order status.", 400, "validation_error");

      const { data: current, error: currentError } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .single();
      if (currentError) throw currentError;

      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select("*, order_items(*)")
        .single();
      if (updateError) throw updateError;

      await supabase.from("order_status_history").insert({
        order_id: orderId,
        old_status: current.status,
        new_status: status,
        changed_by: user.id,
        note: "Admin status update.",
      });

      return jsonResponse({ order });
    }

    return errorResponse("Method not allowed.", 405, "method_not_allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin request failed.";
    const status = /Authentication/.test(message) ? 401 : /Admin access/.test(message) ? 403 : 500;
    return errorResponse(message, status, status === 403 ? "admin_required" : "admin_request_failed");
  }
});
