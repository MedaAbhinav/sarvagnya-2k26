import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️  Supabase URL not configured. Please update your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generate a unique registration ID
export function generateRegistrationId() {
  const prefix = 'JNTU2006'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
