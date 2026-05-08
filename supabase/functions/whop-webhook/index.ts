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

    // Log full payload so we can debug what Whop actually sends
    console.log('Whop webhook received:', JSON.stringify(payload))

    const action = payload.action ?? payload.event ?? payload.type ?? ''
    const data   = payload.data ?? payload
    const email  = data?.user?.email ?? data?.email ?? payload?.user?.email
    const productName = data?.product?.name ?? data?.plan?.name ?? data?.product_name ?? ''

    console.log(`Action: ${action}, Email: ${email}, Product: ${productName}`)

    if (!email) {
      console.warn('No email in Whop webhook payload')
      return new Response('Missing email', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const normalizedEmail = email.toLowerCase().trim()

    const isActivation = (
      action.includes('valid') ||
      action.includes('activ') ||
      action.includes('created') ||
      data?.valid === true ||
      data?.status === 'active' ||
      data?.status === 'completed'
    )
    const isExpiry = (
      action.includes('invalid') ||
      action.includes('expir') ||
      action.includes('cancel') ||
      action.includes('revok') ||
      data?.valid === false ||
      data?.status === 'expired' ||
      data?.status === 'canceled'
    )

    if (!isActivation && !isExpiry) {
      console.log('Unrecognised action — ignoring:', action)
      return new Response('ok', { status: 200 })
    }

    if (isActivation) {
      const tier = getTier(productName)
      const membershipId = data?.id ?? null

      // ── Step 1: Look up user by email in profiles ───────────────────────
      const { data: existingProfile, error: lookupErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (lookupErr) console.warn('Profile lookup error:', lookupErr.message)

      if (existingProfile?.id) {
        // User has an app account — activate immediately
        const { error } = await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_tier: tier,
          whop_membership_id: membershipId,
        }).eq('id', existingProfile.id)

        if (error) {
          console.error('Profile update error:', error.message)
        } else {
          console.log(`✓ Activated existing account: ${normalizedEmail} → ${tier}`)
        }
      }

      // ── Step 2: ALWAYS upsert pending_activations too ───────────────────
      // This ensures that if the user hasn't created an app account yet,
      // OR if the lookup failed above, the activation is stored for later.
      const { error: pendingErr } = await supabase
        .from('pending_activations')
        .upsert({
          email: normalizedEmail,
          subscription_status: 'active',
          subscription_tier: tier,
          whop_membership_id: membershipId,
        }, { onConflict: 'email' })

      if (pendingErr) {
        console.warn('pending_activations upsert error:', pendingErr.message)
      } else {
        console.log(`⏳ Pending activation stored for: ${normalizedEmail}`)
      }
    }

    if (isExpiry) {
      // Look up user and expire them
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle()

      if (existingProfile?.id) {
        await supabase.from('profiles').update({
          subscription_status: 'expired',
        }).eq('id', existingProfile.id)
        console.log(`✓ Expired: ${normalizedEmail}`)
      }

      // Clean up any pending activation too
      await supabase.from('pending_activations').delete().eq('email', normalizedEmail)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Whop webhook error:', err)
    return new Response('Error', { status: 500 })
  }
})
