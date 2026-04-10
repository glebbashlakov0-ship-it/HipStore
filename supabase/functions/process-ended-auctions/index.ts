declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type BidRow = {
  id: string;
  user_id: string | null;
  lot_id: string | null;
  amount: number | string | null;
  status: string | null;
  is_simulated: boolean | null;
  created_at: string | null;
};

type LotItem = {
  id?: string;
  slug?: string;
  title?: string;
  endTime?: string;
  image?: string;
  status?: string;
};

type ProfileRow = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type WinnerGroup = {
  key: string;
  lotId: string;
  userId: string;
  highestBid: BidRow;
  bids: BidRow[];
  lot: LotItem;
  profile?: ProfileRow;
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

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function inFilter(values: string[]) {
  return `in.(${values.map((value) => String(value).replace(/,/g, "")).join(",")})`;
}

function normalizeStatus(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function normalizeAmount(value: unknown) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function isLotEnded(lot: LotItem, nowTs: number) {
  const status = normalizeStatus(lot.status);
  if (status === "closed" || status === "sold" || status === "ended") return true;
  const endTs = new Date(String(lot.endTime || "")).getTime();
  return Number.isFinite(endTs) && endTs <= nowTs;
}

function isAlreadyProcessedStatus(status: unknown) {
  const normalized = normalizeStatus(status);
  return normalized === "won" || normalized === "paid";
}

function isBlockedStatus(status: unknown) {
  const normalized = normalizeStatus(status);
  return normalized === "lost" || normalized === "cancelled" || normalized === "na";
}

function buildFullName(profile?: ProfileRow) {
  const name = [profile?.first_name || "", profile?.last_name || ""].join(" ").trim();
  return name || String(profile?.email || "Client").trim() || "Client";
}

function buildDeliveryTo(profile?: ProfileRow) {
  const parts = [profile?.city, profile?.country].map((value) => String(value || "").trim()).filter(Boolean);
  return parts.join(", ") || "—";
}

function buildDeliveryAddress(profile?: ProfileRow) {
  const parts = [profile?.address, profile?.city, profile?.postal_code, profile?.country]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return parts.join(", ") || "—";
}

function formatCurrency(value: unknown) {
  return `€${normalizeAmount(value).toLocaleString("en-US")}`;
}

function getDueDate(daysFromNow = 14) {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function restRequest(path: string, init: RequestInit = {}) {
  const supabaseUrl = String(Deno.env.get("SUPABASE_URL") || "").trim();
  const serviceKey = String(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();
  if (!supabaseUrl || !serviceKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const headers = new Headers(init.headers || {});
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_error) {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data && "message" in data
        ? String((data as Record<string, unknown>).message)
        : typeof data === "object" && data && "error" in data
          ? String((data as Record<string, unknown>).error)
          : `Supabase REST request failed: ${response.status}`
    );
  }

  return data;
}

async function fetchAllBids() {
  const batchSize = 1000;
  let offset = 0;
  const rows: BidRow[] = [];

  while (true) {
    const response = await restRequest(
      `/rest/v1/bids?select=id,user_id,lot_id,amount,status,is_simulated,created_at&is_simulated=eq.false&order=created_at.asc`,
      {
        headers: {
          Range: `${offset}-${offset + batchSize - 1}`,
        },
      }
    );

    const batch = Array.isArray(response) ? response as BidRow[] : [];
    rows.push(...batch);
    if (batch.length < batchSize) break;
    offset += batchSize;
  }

  return rows.filter((row) => row && row.user_id && row.lot_id);
}

async function fetchProfiles(userIds: string[]) {
  const rows: ProfileRow[] = [];
  for (const part of chunk(unique(userIds), 100)) {
    const response = await restRequest(
      `/rest/v1/profiles?select=id,email,first_name,last_name,address,city,postal_code,country&id=${encodeURIComponent(inFilter(part))}`
    );
    if (Array.isArray(response)) rows.push(...response as ProfileRow[]);
  }
  return rows;
}

async function fetchCatalogLots() {
  const catalogUrl = String(Deno.env.get("LOT_CATALOG_URL") || "").trim()
    || "https://auctio1.vercel.app/data/all-shop-lots.json";
  const response = await fetch(catalogUrl, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load catalog JSON: ${response.status}`);
  }
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data as LotItem[] : [];
}

function chooseHighestBid(rows: BidRow[]) {
  return rows.slice().sort((a, b) => {
    const amountDiff = normalizeAmount(b.amount) - normalizeAmount(a.amount);
    if (amountDiff !== 0) return amountDiff;
    const timeDiff = new Date(String(b.created_at || 0)).getTime() - new Date(String(a.created_at || 0)).getTime();
    if (timeDiff !== 0) return timeDiff;
    return String(b.id).localeCompare(String(a.id));
  })[0];
}

async function sendWinnerEmail(group: WinnerGroup) {
  const supabaseUrl = String(Deno.env.get("SUPABASE_URL") || "").trim();
  const anonKey = String(Deno.env.get("SUPABASE_ANON_KEY") || "").trim();
  if (!supabaseUrl || !anonKey) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not configured.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      template_type: "win-only",
      to_email: group.profile?.email,
      to_name: buildFullName(group.profile),
      lot_title: group.lot.title || "Winning lot",
      lot_image: group.lot.image || "",
      bid_amount: formatCurrency(group.highestBid.amount),
      invoice_number: "—",
      delivery_to: buildDeliveryTo(group.profile),
      delivery_address: buildDeliveryAddress(group.profile),
      payment_type: "Payment instructions will follow",
      payment_details: "Our team will contact you shortly with payment details.",
      due_date: getDueDate(14),
      from_name: "Auctio Holdings Ltd.",
      reply_to: "support@auctio.com",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    throw new Error(String(data?.error || data?.message || `send-admin-email failed: ${response.status}`));
  }
  return data;
}

async function markGroupAsWon(group: WinnerGroup) {
  await restRequest(
    `/rest/v1/bids?lot_id=eq.${encodeURIComponent(group.lotId)}&user_id=eq.${encodeURIComponent(group.userId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "won",
      }),
    }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry_run") === "1" || url.searchParams.get("dryRun") === "1";
  const nowTs = Date.now();

  try {
    const [bids, catalog] = await Promise.all([
      fetchAllBids(),
      fetchCatalogLots(),
    ]);

    const lotsById = new Map<string, LotItem>();
    for (const lot of catalog) {
      if (lot && lot.id) lotsById.set(String(lot.id), lot);
    }

    const grouped = new Map<string, BidRow[]>();
    for (const bid of bids) {
      const lotId = String(bid.lot_id || "");
      const userId = String(bid.user_id || "");
      if (!lotId || !userId) continue;
      const lot = lotsById.get(lotId);
      if (!lot || !isLotEnded(lot, nowTs)) continue;
      const rows = grouped.get(`${lotId}::${userId}`) || [];
      rows.push(bid);
      grouped.set(`${lotId}::${userId}`, rows);
    }

    const groups = Array.from(grouped.entries()).map(([key, rows]) => {
      const highestBid = chooseHighestBid(rows);
      return {
        key,
        lotId: String(highestBid.lot_id),
        userId: String(highestBid.user_id),
        highestBid,
        bids: rows,
        lot: lotsById.get(String(highestBid.lot_id)) || {},
      } as WinnerGroup;
    });

    if (!groups.length) {
      return jsonResponse({
        success: true,
        dryRun,
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        message: "No ended lots with bids were found.",
      });
    }

    const profiles = await fetchProfiles(groups.map((group) => group.userId));
    const profileMap = new Map(profiles.map((profile) => [String(profile.id), profile]));
    groups.forEach((group) => {
      group.profile = profileMap.get(group.userId);
    });

    const results = {
      success: true,
      dryRun,
      processed: groups.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: [] as Record<string, unknown>[],
    };

    for (const group of groups) {
      if (!group.profile?.email) {
        results.skipped += 1;
        results.details.push({
          lot_id: group.lotId,
          user_id: group.userId,
          bid_id: group.highestBid.id,
          status: "skipped",
          reason: "missing_profile_email",
        });
        continue;
      }

      if (group.bids.some((bid) => isAlreadyProcessedStatus(bid.status))) {
        results.skipped += 1;
        results.details.push({
          lot_id: group.lotId,
          user_id: group.userId,
          bid_id: group.highestBid.id,
          status: "skipped",
          reason: "already_won_or_paid",
        });
        continue;
      }

      if (group.bids.some((bid) => isBlockedStatus(bid.status))) {
        results.skipped += 1;
        results.details.push({
          lot_id: group.lotId,
          user_id: group.userId,
          bid_id: group.highestBid.id,
          status: "skipped",
          reason: "blocked_by_manual_status",
        });
        continue;
      }

      if (dryRun) {
        results.skipped += 1;
        results.details.push({
          lot_id: group.lotId,
          user_id: group.userId,
          bid_id: group.highestBid.id,
          status: "dry-run",
          email: group.profile.email,
          amount: normalizeAmount(group.highestBid.amount),
        });
        continue;
      }

      try {
        const sendResult = await sendWinnerEmail(group);
        await markGroupAsWon(group);

        results.sent += 1;
        results.details.push({
          lot_id: group.lotId,
          user_id: group.userId,
          bid_id: group.highestBid.id,
          status: "sent",
          email: group.profile.email,
          response_to: sendResult?.to || group.profile.email,
          demo: Boolean(sendResult?.demo),
          amount: normalizeAmount(group.highestBid.amount),
        });
      } catch (error) {
        results.failed += 1;
        results.details.push({
          lot_id: group.lotId,
          user_id: group.userId,
          bid_id: group.highestBid.id,
          status: "failed",
          email: group.profile.email,
          error: String(error instanceof Error ? error.message : error),
        });
      }
    }

    return jsonResponse(results);
  } catch (error) {
    return jsonResponse({
      success: false,
      error: String(error instanceof Error ? error.message : error),
    }, 500);
  }
});
