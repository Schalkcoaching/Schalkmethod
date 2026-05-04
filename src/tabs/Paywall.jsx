const BUY_LINKS = {
  app:     'https://whop.com/the-schalk-method/tsm-app/',
  group:   'https://whop.com/the-schalk-method/group-coaching-0c/',
  coaching:'https://whop.com/the-schalk-method/1-on-1-coachingg/',
}

function daysLeft(trialEndsAt) {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function Paywall({ user, profile, mobile }) {
  const isTrialActive = profile?.subscription_status === 'trial' && daysLeft(profile?.trial_ends_at) > 0
  const days = daysLeft(profile?.trial_ends_at)

  const goTo = (key) => window.open(BUY_LINKS[key], '_blank')

  const p = mobile ? '24px 16px 80px' : '60px 40px'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: p }}>

      <div style={{ fontSize: '28px', fontWeight: 900, color: '#1A1410', letterSpacing: '-0.5px', marginBottom: '6px' }}>
        The Schalk Method
      </div>
      <div style={{ fontSize: '13px', color: '#9C8E84', marginBottom: '40px' }}>
        {isTrialActive
          ? `Your free trial ends in ${days} day${days === 1 ? '' : 's'}`
          : 'Your free trial has ended — choose a plan to continue'}
      </div>

      {isTrialActive && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '99px', padding: '6px 18px', fontSize: '12px', fontWeight: 700, color: '#92400E', marginBottom: '32px' }}>
          ⏳ {days} day{days === 1 ? '' : 's'} remaining on your free trial
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '16px', width: '100%', maxWidth: '860px' }}>

        {/* App Plan */}
        <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>App Access</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#1A1410', lineHeight: 1, marginBottom: '4px' }}>$15</div>
          <div style={{ fontSize: '12px', color: '#9C8E84', marginBottom: '20px' }}>per month · 7-day free trial</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', flex: 1 }}>
            {['📊 Nutrition tracking', '✅ Daily goals & habits', '📸 Progress photos', "👨‍🍳 Recipe library", '💪 Workout logs', '🤖 AI Coach'].map(f => (
              <div key={f} style={{ fontSize: '13px', color: '#4A3F35' }}>{f}</div>
            ))}
          </div>
          <button onClick={() => goTo('app')}
            style={{ width: '100%', padding: '13px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            {isTrialActive ? 'Subscribe — $15/mo' : 'Get started — $15/mo'}
          </button>
        </div>

        {/* Group Coaching */}
        <div style={{ flex: 1, background: '#FFFFFF', border: '2px solid #C4A882', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#C4A882', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Group Coaching</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#1A1410', lineHeight: 1, marginBottom: '4px' }}>$35</div>
          <div style={{ fontSize: '12px', color: '#9C8E84', marginBottom: '20px' }}>per month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', flex: 1 }}>
            {['✅ Everything in App', '👥 Private group community', '📹 Weekly group calls', '🤝 Group accountability', '💬 Direct access to Schalk'].map(f => (
              <div key={f} style={{ fontSize: '13px', color: '#4A3F35' }}>{f}</div>
            ))}
          </div>
          <button onClick={() => goTo('group')}
            style={{ width: '100%', padding: '13px', background: '#C4A882', color: '#0F0D0B', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            Join Group — $35/mo
          </button>
        </div>

        {/* 1-on-1 Coaching */}
        <div style={{ flex: 1, background: '#1A1410', border: '1px solid #2C2825', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#C4A882', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>1-on-1 Coaching</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1, marginBottom: '4px' }}>$140</div>
          <div style={{ fontSize: '12px', color: '#9C8E84', marginBottom: '20px' }}>per month · fully personalised</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', flex: 1 }}>
            {['✅ Everything in App', '📹 Weekly 1-on-1 calls', '🎯 Custom lifestyle plan', '📱 Direct messaging', '🔄 Weekly adjustments'].map(f => (
              <div key={f} style={{ fontSize: '13px', color: '#BEB5AE' }}>{f}</div>
            ))}
          </div>
          <button onClick={() => goTo('coaching')}
            style={{ width: '100%', padding: '13px', background: '#C4A882', color: '#1A1410', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            Apply — $140/mo
          </button>
        </div>

      </div>

      <div style={{ marginTop: '24px', fontSize: '12px', color: '#BEB5AE', textAlign: 'center' }}>
        Cancel anytime · Secure payment via Whop · Questions? s_booysen@icloud.com
      </div>
    </div>
  )
}
