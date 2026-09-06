import { createClient } from "@supabase/supabase-js";

// Supabase anon/public key — safe to include in frontend code.
// Prefer environment variables so this project can be pointed at your Supabase instance.
// See .env.example for the expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
const ENV_URL = import.meta.env.VITE_SUPABASE_URL;
const ENV_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const FALLBACK_URL = "https://ibwovrzsnekqgfdjcswd.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid292cnpzbmVrcWdmZGpjc3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTQ3OTgsImV4cCI6MjEwNDE3MDc5OH0.12bTv1ZkuvYj3KdtZuCCUVT0nW4s2DxKxA0rGd6rnhc";

export const SUPABASE_URL = ENV_URL || FALLBACK_URL;
export const SUPABASE_ANON = ENV_ANON || FALLBACK_ANON;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export const isSupabaseConfigured = Boolean(ENV_URL && ENV_ANON);

if (!isSupabaseConfigured) {
  // Helpful hint during development — warns when env vars are not set
  // so maintainers know to provide their own project values.
  // (App will still function against the embedded fallback project.)
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — using fallback Supabase project",
  );
}

export function generateRegistrationId() {
  const prefix = "JNTU2006";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
