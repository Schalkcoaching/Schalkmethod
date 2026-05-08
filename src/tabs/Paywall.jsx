const BUY_LINKS = {
  app:      'https://whop.com/the-schalk-method/tsm-app/',
  group:    'https://whop.com/the-schalk-method/group-coaching-0c/',
  coaching: 'https://whop.com/the-schalk-method/1-on-1-coachingg/',
}

export default function Paywall({ user, profile, mobile, onSignOut }) {
  const goTo = (key) => window.open(BUY_LINKS[key], '_blank')

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: mobile ? '14px 18px' : '18px 32px',
        borderBottom: '1px solid #EDE8E0', background: '#F7F3EE', flexShrink: 0,
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1A1410' }}>The Schalk Method</div>
        <button onClick={onSignOut} style={{
          background: 'transparent', border: '1px solid #E0D8CE', borderRadius: '8px',
          padding: '6px 14px', fontSize: '12px', color: '#9C8E84', cursor: 'pointer', fontWeight: 600,
        }}>
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: mobile ? '28px 18px 48px' : '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{ fontSize: mobile ? '22px' : '26px', fontWeight: 900, color: '#1A1410', letterSpacing: '-0.5px', marginBottom: '8px', textAlign: 'center' }}>
          Subscribe to get access
        </div>

        {/* Step-by-step instructions */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px',
          padding: '20px 24px', marginBottom: '28px', width: '100%', maxWidth: '480px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
            How to get access
          </div>
          {[
            { n: '1', text: 'Choose a plan below and subscribe on Whop' },
            { n: '2', text: 'Sign out of the app (button top right)' },
            { n: '3', text: 'Sign up again using the exact same email you used on Whop' },
            { n: '4', text: 'You\'re in — the system recognises your subscription automatically' },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', background: '#1C1917',
                color: '#F7F3EE', fontSize: '11px', fontWeight: 700, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
              }}>{n}</div>
              <div style={{ fontSize: '13px', color: '#4A3F35', lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '480px' }}>

          {/* App Plan */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '18px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9C8E84', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>App Access</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#1A1410' }}>$15</div>
              <div style={{ fontSize: '12px', color: '#9C8E84' }}>/ month · 7-day free trial</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {['📊 Nutrition tracking', '✅ Daily goals & habits', '📸 Progress photos', '👨‍🍳 Recipe library', '💪 Workout logs', '🤖 AI Coach'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: '#4A3F35' }}>{f}</div>
              ))}
            </div>
            <button onClick={() => goTo('app')} style={{ width: '100%', padding: '12px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Get started — $15/mo
            </button>
          </div>

          {/* Group Coaching */}
          <div style={{ background: '#FFFFFF', border: '2px solid #C4A882', borderRadius: '18px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#C4A882', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Group Coaching</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#1A1410' }}>$35</div>
              <div style={{ fontSize: '12px', color: '#9C8E84' }}>/ month</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {['✅ Everything in App', '👥 Private group community', '📹 Weekly group calls', '🤝 Group accountability', '💬 Direct access to Schalk'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: '#4A3F35' }}>{f}</div>
              ))}
            </div>
            <button onClick={() => goTo('group')} style={{ width: '100%', padding: '12px', background: '#C4A882', color: '#0F0D0B', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Join Group — $35/mo
            </button>
          </div>

          {/* 1-on-1 Coaching */}
          <div style={{ background: '#1A1410', border: '1px solid #2C2825', borderRadius: '18px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#C4A882', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>1-on-1 Coaching</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#F7F3EE' }}>$140</div>
              <div style={{ fontSize: '12px', color: '#9C8E84' }}>/ month · fully personalised</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {['✅ Everything in App', '📹 Weekly 1-on-1 calls', '🎯 Custom lifestyle plan', '📱 Direct messaging', '🔄 Weekly adjustments'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: '#BEB5AE' }}>{f}</div>
              ))}
            </div>
            <button onClick={() => goTo('coaching')} style={{ width: '100%', padding: '12px', background: '#C4A882', color: '#1A1410', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Apply — $140/mo
            </button>
          </div>

        </div>

        <div style={{ marginTop: '24px', fontSize: '11px', color: '#BEB5AE', textAlign: 'center' }}>
          Cancel anytime · Secure payment via Whop · Questions? s_booysen@icloud.com
        </div>
      </div>
    </div>
  )
}
