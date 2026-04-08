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

type GuestBidPayload = {
  bid_id?: string;
  lot_id?: string;
  amount?: number;
  payment_method?: string;
  contact?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  shipping?: {
    country?: string;
    city?: string;
    address?: string;
    state?: string;
    postal_code?: string;
  };
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

function normalizePaymentMethod(value: unknown) {
  return cleanText(value).toLowerCase() === "revolut" ? "revolut" : "iban";
}

function buildBidId(payload: GuestBidPayload, paymentMethod: string) {
  const requested = cleanText(payload.bid_id);
  if (requested) return requested;
  return `bid-${cleanText(payload.lot_id)}-${Date.now()}-${paymentMethod}`;
}

function randomPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
    throw new Error(getErrorMessage(data, "Unable to check bidder profile."));
  }
  return Array.isArray(data) && data[0] ? data[0] as { id: string; email: string } : null;
}

async function createGuestUser(payload: GuestBidPayload, email: string) {
  const contact = payload.contact || {};
  const response = await supabaseRequest("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: randomPassword(),
      email_confirm: true,
      user_metadata: {
        first_name: cleanText(contact.first_name),
        last_name: cleanText(contact.last_name),
        phone: cleanText(contact.phone),
        source: "guest_bid",
      },
    }),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to create bidder account."));
  }
  const userId = cleanText((data as Record<string, unknown> | null)?.id);
  if (!userId) throw new Error("Created bidder account is missing an id.");
  return userId;
}

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const response = await supabaseRequest(`/auth/v1/admin/users?page=${page}&per_page=100`);
    const data = await readJsonResponse(response);
    if (!response.ok) return "";

    const users = Array.isArray((data as Record<string, unknown> | null)?.users)
      ? (data as { users: Array<Record<string, unknown>> }).users
      : [];
    const match = users.find((user) => normalizeEmail(user.email) === email);
    if (match) return cleanText(match.id);
    if (users.length < 100) return "";
  }
  return "";
}

async function resolveGuestUserId(payload: GuestBidPayload, email: string) {
  const existingProfile = await findProfileByEmail(email);
  if (existingProfile) {
    return { userId: existingProfile.id, accountCreated: false };
  }

  try {
    return { userId: await createGuestUser(payload, email), accountCreated: true };
  } catch (error) {
    const existingAuthUserId = await findAuthUserByEmail(email);
    if (existingAuthUserId) {
      return { userId: existingAuthUserId, accountCreated: false };
    }
    throw error;
  }
}

async function upsertProfile(userId: string, payload: GuestBidPayload, email: string) {
  const contact = payload.contact || {};
  const shipping = payload.shipping || {};
  const response = await supabaseRequest("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      email,
      first_name: cleanText(contact.first_name),
      last_name: cleanText(contact.last_name),
      phone: cleanText(contact.phone),
      country: cleanText(shipping.country),
      address: cleanText(shipping.address),
      city: cleanText(shipping.city),
      state: cleanText(shipping.state),
      postal_code: cleanText(shipping.postal_code),
    }),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to save bidder profile."));
  }
}

function isMissingBidColumn(data: unknown, columnName: string) {
  const message = getErrorMessage(data, "");
  return message.includes(`Could not find the '${columnName}' column of 'bids'`) ||
    message.includes(`column bids.${columnName} does not exist`);
}

async function insertBid(payload: GuestBidPayload, userId: string, bidId: string, paymentMethod: string) {
  const basePayload = {
    id: bidId,
    user_id: userId,
    lot_id: cleanText(payload.lot_id),
    amount: Number(payload.amount),
    status: "active",
    is_simulated: false,
    payment_method: paymentMethod,
    created_at: new Date().toISOString(),
  };

  async function postBid(body: Record<string, unknown>) {
    const response = await supabaseRequest("/rest/v1/bids", {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    return { response, data: await readJsonResponse(response) };
  }

  let result = await postBid(basePayload);
  if (!result.response.ok && isMissingBidColumn(result.data, "payment_method")) {
    const fallbackPayload = { ...basePayload };
    delete (fallbackPayload as Record<string, unknown>).payment_method;
    result = await postBid(fallbackPayload);
  }

  if (!result.response.ok) {
    throw new Error(getErrorMessage(result.data, "Unable to save bid."));
  }

  return Array.isArray(result.data) && result.data[0] ? result.data[0] : basePayload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const payload = await req.json() as GuestBidPayload;
    const email = normalizeEmail(payload.contact?.email);
    const amount = Number(payload.amount);
    const lotId = cleanText(payload.lot_id);

    if (!lotId) return jsonResponse({ error: "Lot id is required." }, 400);
    if (!Number.isFinite(amount) || amount <= 0) return jsonResponse({ error: "Bid amount is invalid." }, 400);
    if (!email || !isValidEmail(email)) return jsonResponse({ error: "Valid email is required." }, 400);

    const paymentMethod = normalizePaymentMethod(payload.payment_method);
    const bidId = buildBidId(payload, paymentMethod);
    const resolvedUser = await resolveGuestUserId(payload, email);
    const userId = resolvedUser.userId;

    await upsertProfile(userId, payload, email);
    const bid = await insertBid(payload, userId, bidId, paymentMethod);

    return jsonResponse({
      ok: true,
      bid,
      bid_id: bidId,
      user_id: userId,
      account_created: resolvedUser.accountCreated,
    });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : "Unable to submit bid.",
    }, 400);
  }
});
