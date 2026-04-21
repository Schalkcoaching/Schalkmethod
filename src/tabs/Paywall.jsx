const BUY_LINKS = {
  app:      'https://paystack.shop/pay/schalkmethod',
  coaching: 'https://paystack.shop/pay/theschalkmethod',
}

function daysLeft(trialEndsAt) {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function Paywall({ user, profile, mobile }) {
  const isTrialActive = profile?.subscription_status === 'trial' && daysLeft(profile?.trial_ends_at) > 0
  const days = daysLeft(profile?.trial_ends_at)

  const goTo = (tier) => {
    const base = BUY_LINKS[tier]
    const url = `${base}?checkout[email]=${encodeURIComponent(user.email)}&checkout[custom][user_id]=${user.id}`
    window.open(url, '_blank')
  }

  const p = mobile ? '24px 16px 80px' : '60px 40px'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: p }}>

      {/* Logo */}
      <div style={{ fontSize: '28px', fontWeight: 900, color: '#1A1410', letterSpacing: '-0.5px', marginBottom: '6px' }}>
        The Schalk Method
      </div>
      <div style={{ fontSize: '13px', color: '#9C8E84', marginBottom: '40px' }}>
        {isTrialActive
          ? `Your free trial ends in ${days} day${days === 1 ? '' : 's'}`
          : 'Your free trial has ended — choose a plan to continue'}
      </div>

      {/* Trial countdown pill */}
      {isTrialActive && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '99px', padding: '6px 18px', fontSize: '12px', fontWeight: 700, color: '#92400E', marginBottom: '32px' }}>
          ⏳ {days} day{days === 1 ? '' : 's'} remaining on your free trial
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '16px', width: '100%', maxWidth: '680px' }}>

        {/* App Plan */}
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>App Access</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#1A1410', lineHeight: 1 }}>$13</div>
          <div style={{ fontSize: '13px', color: '#9C8E84', marginBottom: '20px' }}>/ month · 7-day free trial</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px', flex: 1 }}>
            {[
              '📊 Nutrition tracking & food library',
              '✅ Daily goals & habit tracking',
              '📸 Weekly progress photos',
              '👨‍🍳 Schalk\'s recipe library',
              '💪 Workout guidance',
              '💬 Ask the coach Q&A',
            ].map(f => (
              <div key={f} style={{ fontSize: '13px', color: '#4A3F35', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => goTo('app')}
            style={{ width: '100%', padding: '14px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            {isTrialActive ? 'Subscribe — $13/mo' : 'Get started — $13/mo'}
          </button>
        </div>

        {/* Coaching Plan */}
        <div style={{ flex: 1, background: '#1A1410', border: '1px solid #2C2825', borderRadius: '20px', padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#C4A882', color: '#1A1410', fontSize: '9px', fontWeight: 800, letterSpacing: '1px', padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase' }}>Best value</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#C4A882', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>1-on-1 Coaching</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1 }}>$150</div>
          <div style={{ fontSize: '13px', color: '#9C8E84', marginBottom: '20px' }}>/ month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px', flex: 1 }}>
            {[
              '✅ Everything in App Access',
              '📹 Personal 1-on-1 sessions',
              '🎯 Custom programme design',
              '📱 Direct coach messaging',
              '🔄 Weekly check-ins & adjustments',
              '🏆 Priority support',
            ].map(f => (
              <div key={f} style={{ fontSize: '13px', color: '#BEB5AE', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => goTo('coaching')}
            style={{ width: '100%', padding: '14px', background: '#C4A882', color: '#1A1410', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            Apply for coaching — $150/mo
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', fontSize: '12px', color: '#BEB5AE', textAlign: 'center' }}>
        Cancel anytime · Secure payment via Lemon Squeezy · Questions? Email schalk@theschalkmethod.com
      </div>
    </div>
  )
}
