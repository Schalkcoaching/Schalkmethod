import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const APP_VARIANT_ID = '1528155'
const COACHING_VARIANT_ID = '973480'

serve(async (req) => {
  try {
    const payload = await req.json()
    const eventName = payload.meta?.event_name
    const customData = payload.meta?.custom_data
    const userId = customData?.user_id

    if (!userId) {
      return new Response('Missing user_id in custom data', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const variantId = String(payload.data?.attributes?.variant_id)
      const status = payload.data?.attributes?.status
      const tier = variantId === APP_VARIANT_ID ? 'app' : variantId === COACHING_VARIANT_ID ? 'coaching' : 'app'
      const isActive = status === 'active' || status === 'on_trial'

      await supabase.from('profiles').update({
        subscription_status: isActive ? 'active' : 'inactive',
        subscription_tier: tier,
        ls_customer_id: String(payload.data?.attributes?.customer_id ?? ''),
        ls_subscription_id: String(payload.data?.id ?? ''),
      }).eq('id', userId)

      console.log(`✓ ${eventName}: user ${userId} → ${tier} (${isActive ? 'active' : 'inactive'})`)
    }

    if (eventName === 'subscription_cancelled') {
      // Keep access until end of billing period — LS sends subscription_expired when truly over
      await supabase.from('profiles').update({
        subscription_status: 'cancelled',
      }).eq('id', userId)
      console.log(`✓ subscription_cancelled: user ${userId}`)
    }

    if (eventName === 'subscription_expired') {
      await supabase.from('profiles').update({
        subscription_status: 'expired',
        subscription_tier: 'none',
      }).eq('id', userId)
      console.log(`✓ subscription_expired: user ${userId}`)
    }

    if (eventName === 'subscription_resumed') {
      const variantId = String(payload.data?.attributes?.variant_id)
      const tier = variantId === APP_VARIANT_ID ? 'app' : 'coaching'
      await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_tier: tier,
      }).eq('id', userId)
      console.log(`✓ subscription_resumed: user ${userId}`)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Error', { status: 500 })
  }
})
