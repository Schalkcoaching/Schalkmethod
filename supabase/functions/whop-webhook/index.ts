import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Map Whop product names → subscription tiers
function getTier(productName: string): string {
  const name = (productName || '').toLowerCase()
  if (name.includes('group')) return 'group'
  if (name.includes('1-on-1') || name.includes('1on1')) return 'coaching'
  if (name.includes('coaching')) return 'coaching'
  return 'app'
}

serve(async (req) => {
  try {
    const body = await req.text()
    const payload = JSON.parse(body)

    const action = payload.action        // e.g. "membership.went_valid"
    const data   = payload.data          // membership object
    const email  = data?.user?.email
    const productName = data?.product?.name ?? ''

    if (!email) {
      console.warn('No email in Whop webhook payload')
      return new Response('Missing email', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Look up Supabase user by email
    const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
    if (listErr) throw listErr

    const authUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

    if (action === 'membership.went_valid') {
      const tier = getTier(productName)

      if (authUser) {
        // User exists — activate their profile
        const { error } = await supabase.from('profiles').upsert({
          id: authUser.id,
          subscription_status: 'active',
          subscription_tier: tier,
          whop_membership_id: data?.id ?? null,
        }, { onConflict: 'id' })
        if (error) throw error
        console.log(`✓ Activated: ${email} → ${tier}`)
      } else {
        // User hasn't signed up yet — store pending activation
        const { error } = await supabase.from('pending_activations').upsert({
          email: email.toLowerCase(),
          subscription_status: 'active',
          subscription_tier: tier,
          whop_membership_id: data?.id ?? null,
        }, { onConflict: 'email' })
        if (error) {
          // Table might not exist yet — log and continue
          console.warn('pending_activations insert failed:', error.message)
        }
        console.log(`⏳ Pending: ${email} subscribed but no app account yet`)
      }
    }

    if (action === 'membership.went_invalid') {
      if (authUser) {
        await supabase.from('profiles').update({
          subscription_status: 'expired',
        }).eq('id', authUser.id)
        console.log(`✓ Expired: ${email}`)
      }
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Whop webhook error:', err)
    return new Response('Error', { status: 500 })
  }
})
