// Supabase Edge Function: submit-registration
// Receives JSON payload and inserts into `registrations` using the service role key.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
}

addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

async function handle(req: Request) {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }
  if (req.method !== "POST")
    return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json();
    const restUrl = SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/registrations";

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

    const data = await resp.json();
    if (!resp.ok) return jsonResponse({ error: data }, resp.status);
    return jsonResponse({ data: data[0] }, 200);
  } catch (err) {
    console.error("submit-registration error", err);
    return jsonResponse({ error: String(err) }, 500);
  }
}
