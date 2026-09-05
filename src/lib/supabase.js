import { createClient } from '@supabase/supabase-js'

// Supabase anon/public key — safe to include in frontend code.
// The anon key only allows what RLS policies permit.
// It cannot bypass Row Level Security or access private data.
const SUPABASE_URL  = 'https://ibwovrzsnekqgfdjcswd.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlid292cnpzbmVrcWdmZGpjc3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTQ3OTgsImV4cCI6MjEwNDE3MDc5OH0.12bTv1ZkuvYj3KdtZuCCUVT0nW4s2DxKxA0rGd6rnhc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export const isSupabaseConfigured = true

export function generateRegistrationId() {
  const prefix    = 'JNTU2006'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random    = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
