declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RegisterPayload = {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown) {
  return cleanText(value).toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function encodeQueryValue(value: string) {
  return encodeURIComponent(value).replace(/\./g, "%2E");
}

function getSupabaseConfig() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Supabase service credentials are not configured.");
  }
  return { url, serviceKey };
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = getSupabaseConfig();
  const headers = new Headers(init.headers || {});
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  return fetch(`${url}${path}`, {
    ...init,
    headers,
  });
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    return { message: text };
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return cleanText(record.message || record.error || record.msg) || fallback;
  }
  return fallback;
}

async function findProfileByEmail(email: string) {
  const response = await supabaseRequest(
    `/rest/v1/profiles?select=id,email&email=eq.${encodeQueryValue(email)}&limit=1`,
  );
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to check existing profile."));
  }
  return Array.isArray(data) && data[0] ? data[0] as { id: string; email: string } : null;
}

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const response = await supabaseRequest(`/auth/v1/admin/users?page=${page}&per_page=100`);
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Unable to check existing auth user."));
    }

    const users = Array.isArray((data as Record<string, unknown> | null)?.users)
      ? (data as { users: Array<Record<string, unknown>> }).users
      : [];
    const match = users.find((user) => normalizeEmail(user.email) === email);
    if (match) return cleanText(match.id);
    if (users.length < 100) return "";
  }
  return "";
}

async function createUser(payload: RegisterPayload, email: string, password: string) {
  const response = await supabaseRequest("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: cleanText(payload.first_name),
        last_name: cleanText(payload.last_name),
        phone: cleanText(payload.phone),
        source: "site_register",
      },
    }),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to create account."));
  }

  const userId = cleanText((data as Record<string, unknown> | null)?.id);
  if (!userId) {
    throw new Error("Created account is missing an id.");
  }

  return userId;
}

async function upsertProfile(userId: string, payload: RegisterPayload, email: string) {
  const response = await supabaseRequest("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      email,
      first_name: cleanText(payload.first_name),
      last_name: cleanText(payload.last_name),
      phone: cleanText(payload.phone),
    }),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to save user profile."));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let payload: RegisterPayload;
  try {
    payload = await req.json();
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  const email = normalizeEmail(payload.email);
  const password = cleanText(payload.password);

  if (!email || !isValidEmail(email)) {
    return jsonResponse({ error: "A valid email is required." }, 400);
  }
  if (password.length < 8) {
    return jsonResponse({ error: "Password must be at least 8 characters." }, 400);
  }

  try {
    const existingProfile = await findProfileByEmail(email);
    if (existingProfile) {
      return jsonResponse({ error: "An account with this email already exists." }, 409);
    }

    const existingAuthUserId = await findAuthUserByEmail(email);
    if (existingAuthUserId) {
      return jsonResponse({ error: "An account with this email already exists." }, 409);
    }

    const userId = await createUser(payload, email, password);
    await upsertProfile(userId, payload, email);

    return jsonResponse({
      success: true,
      user_id: userId,
      email,
    });
  } catch (error) {
    return jsonResponse({
      error: String(error instanceof Error ? error.message : error),
    }, 500);
  }
});
