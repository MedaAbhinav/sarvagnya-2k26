import { createClient } from '@supabase/supabase-js'

// Use fallback placeholder values so createClient never receives undefined.
// The site will render correctly even without Supabase configured.
// Database operations will fail gracefully with an error toast.
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const configured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'

if (!configured) {
  console.warn(
    '⚠️  Supabase not configured.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to GitHub Actions secrets.\n' +
    'Registration and contribution forms will not save data until configured.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = configured

// Generate a unique registration ID
export function generateRegistrationId() {
  const prefix    = 'JNTU2006'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random    = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
