import { adminClient, sha256Hex } from "../_shared/auth.ts";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function bearerToken(req: Request) {
  return (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const secret = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${crypto.randomUUID()}.${secret}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = adminClient();

    if (req.method === "DELETE") {
      const token = bearerToken(req);
      if (token) {
        await supabase
          .from("admin_sessions")
          .update({ revoked_at: new Date().toISOString() })
          .eq("token_hash", await sha256Hex(token));
      }
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") return errorResponse("Method not allowed.", 405, "method_not_allowed");

    const body = await req.json();
    const username = clean(body.username || body.login || body.email);
    const password = String(body.password || "");
    const expectedUsername = clean(Deno.env.get("ADMIN_LOGIN") || "admin");
    const expectedPassword = String(Deno.env.get("ADMIN_PASSWORD") || "123");

    if (username !== expectedUsername || password !== expectedPassword) {
      return errorResponse("Invalid admin login or password.", 401, "invalid_admin_credentials");
    }

    const token = randomToken();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("admin_sessions")
      .insert({
        username,
        token_hash: await sha256Hex(token),
        role: "owner",
        expires_at: expiresAt,
      })
      .select("id, username, role, expires_at")
      .single();
    if (error) throw error;

    return jsonResponse({
      token,
      admin: {
        id: data.id,
        username: data.username,
        role: data.role,
        expires_at: data.expires_at,
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Admin login failed.", 500, "admin_login_failed");
  }
});
