import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qkgmtmplojxkmavpnifw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_sY-TnVb5Jx0IYXUGHLysEg_kRM2LtpR'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Coach email — this user has elevated access
export const COACH_EMAIL = 's_booysen@icloud.com'

export function isCoach(user) {
  return user?.email === COACH_EMAIL || user?.user_metadata?.role === 'coach'
}
