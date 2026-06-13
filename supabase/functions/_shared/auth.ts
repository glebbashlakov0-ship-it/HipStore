import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

export function adminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service environment is not configured.");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function bearerToken(req: Request) {
  const authorization = req.headers.get("Authorization") || "";
  return authorization.replace(/^Bearer\s+/i, "").trim();
}

export async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getUserFromRequest(req: Request) {
  const token = bearerToken(req);
  if (!token) return null;
  const supabase = adminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function requireAdmin(req: Request) {
  const supabase = adminClient();
  const token = bearerToken(req);
  if (token) {
    const tokenHash = await sha256Hex(token);
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("id, username, role, expires_at, revoked_at")
      .eq("token_hash", tokenHash)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (session) {
      await supabase
        .from("admin_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", session.id);
      return {
        user: { id: null, username: session.username },
        admin: { user_id: null, role: session.role, is_active: true, session_id: session.id },
        supabase,
      };
    }
  }

  const user = await getUserFromRequest(req);
  if (!user) throw new Error("Authentication is required.");
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Admin access is required.");
  return { user, admin: data, supabase };
}
