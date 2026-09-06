// Supabase Edge Function: submit-contribution
// Receives JSON payload and inserts into `contributions` using the service role key.

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_DB_URL") || "";
const SERVICE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";

function corsHeaders() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept",
    "Access-Control-Max-Age": "600",
  } as Record<string, string>;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(),
  });
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  const masked = SERVICE_KEY ? SERVICE_KEY.slice(0, 6) + "..." : "MISSING";
  console.warn(
    `SUPABASE_URL or SERVICE_KEY not configured in function environment - key=${masked}`,
  );
}

addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

async function handle(req: Request) {
  console.log("submit-contribution request", {
    method: req.method,
    url: req.url,
  });
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== "POST")
    return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json();
    if (
      !payload ||
      typeof payload.screenshot_url !== "string" ||
      !payload.screenshot_url.trim()
    ) {
      return jsonResponse({ error: "Payment screenshot is required" }, 400);
    }
    if (
      Number(payload.contribution_amount) < 1 ||
      Number(payload.screenshot_amount) !== Number(payload.contribution_amount)
    ) {
      return jsonResponse(
        { error: "Screenshot amount must match contribution amount" },
        400,
      );
    }
    console.log("payload", payload);
    const restUrl = SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/contributions";

    const resp = await fetch(restUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify([payload]),
    });

    const text = await resp.text();
    let data: any = text;
    try {
      data = JSON.parse(text);
    } catch {}
    if (!resp.ok) return jsonResponse({ error: data }, resp.status);
    return jsonResponse({ data: Array.isArray(data) ? data[0] : data }, 200);
  } catch (err) {
    console.error("submit-contribution error", err);
    return jsonResponse({ error: String(err) }, 500);
  }
}
