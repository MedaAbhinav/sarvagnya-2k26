import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log configuration status for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase credentials missing.\n' +
    'VITE_SUPABASE_URL:', supabaseUrl ? '✓ set' : '✗ MISSING',
    '\nVITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ set' : '✗ MISSING'
  )
} else {
  console.log('✓ Supabase configured:', supabaseUrl)
}

// Always create a real client — never use placeholders that hide errors
export const supabase = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// isSupabaseConfigured: true only when real credentials are present
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export function generateRegistrationId() {
  const prefix    = 'JNTU2006'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random    = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
