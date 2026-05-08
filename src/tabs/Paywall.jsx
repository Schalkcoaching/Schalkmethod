import { useState } from 'react'

const BUY_LINKS = {
  app:      'https://whop.com/the-schalk-method/tsm-app/',
  group:    'https://whop.com/the-schalk-method/group-coaching-0c/',
  coaching: 'https://whop.com/the-schalk-method/1-on-1-coachingg/',
}

export default function Paywall({ user, profile, mobile, onSignOut, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)
  const [refreshed, setRefreshed] = useState(false)

  const goTo = (key) => window.open(BUY_LINKS[key], '_blank')

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh?.()
    setRefreshing(false)
    setRefreshed(true)
    setTimeout(() => setRefreshed(false), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: mobile ? '14px 18px' : '18px 32px', borderBottom: '1px solid #EDE8E0', background: '#F7F3EE', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1A1410' }}>The Schalk Method</div>
        <button onClick={onSignOut} style={{ background: 'transparent', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', color: '#9C8E84', cursor: 'pointer', fontWeight: 600 }}>
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: mobile ? '28px 18px 48px' : '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div style={{ fontSize: mobile ? '22px' : '26px', fontWeight: 900, color: '#1A1410', letterSpacing: '-0.5px', marginBottom: '6px', textAlign: 'center' }}>
          Choose a plan to get access
        </div>
        <div style={{ fontSize: '13px', color: '#9C8E84', marginBottom: '28px', textAlign: 'center' }}>
          Subscribe on Whop, then come back and refresh below.
        </div>

        {/* Already subscribed refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ background: '#1C1917', border: 'none', borderRadius: '12px', padding: '13px 28px', color: '#F7F3EE', fontSize: '13px', fontWeight: 700, cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.7 : 1, marginBottom: '32px' }}
        >
          {refreshing ? 'Checking...' : refreshed ? '✓ Checked — if you subscribed, sign out and back in' : "I've subscribed on Whop — refresh access"}
        </button>

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
