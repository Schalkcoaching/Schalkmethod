const quickStats = [
  { label: 'Day Streak', value: '12', icon: '🔥', color: '#D97706' },
  { label: 'Goals Met', value: '85%', icon: '🎯', color: '#7C3AED' },
  { label: 'Workouts', value: '3/4', icon: '💪', color: '#2563EB' },
  { label: 'Water (L)', value: '2.1', icon: '💧', color: '#0891B2' },
]

const quickLinks = [
  { id: 'progress',  label: 'Log Progress Pic',   icon: '📸', color: '#BE185D' },
  { id: 'goals',     label: 'Check Daily Goals',  icon: '✅', color: '#15803D' },
  { id: 'nutrition', label: 'Log Your Meals',     icon: '🥗', color: '#C2410C' },
  { id: 'workout',   label: "Today's Workout",    icon: '💪', color: '#1D4ED8' },
  { id: 'video',     label: 'Book a Session',     icon: '📹', color: '#6D28D9' },
  { id: 'qa',        label: 'Ask Your Coach',     icon: '💬', color: '#BE185D' },
]

export default function Home({ setActiveTab }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      {/* Hero */}
      <div style={{
        borderRadius: '20px', background: '#1C1917',
        padding: '60px 52px', position: 'relative', overflow: 'hidden', marginBottom: '28px',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px',
          background: 'radial-gradient(circle, rgba(196,168,130,0.12) 0%, transparent 70%)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', color: '#C4A882', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '18px' }}>
            {today}
          </div>
          <h1 style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1.1, marginBottom: '18px', color: '#F7F3EE' }}>
            You've Come to the<br />Right Place to<br /><span style={{ color: '#C4A882' }}>Change Your Life.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#8C7E72', maxWidth: '480px', lineHeight: 1.7 }}>
            Every rep, every meal, every check-in brings you closer to the version of yourself you've always wanted to be. Let's make today count.
          </p>
          <button
            onClick={() => setActiveTab('goals')}
            style={{
              marginTop: '28px', padding: '14px 32px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontSize: '14px', fontWeight: 700,
              background: '#C4A882', color: '#1C1917', letterSpacing: '0.3px', transition: 'background 0.2s',
            }}
            onMouseOver={e => e.target.style.background = '#D4B892'}
            onMouseOut={e => e.target.style.background = '#C4A882'}
          >
            Start Today's Check-In →
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {quickStats.map(stat => (
          <div key={stat.label} style={{
            background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px',
            padding: '20px', display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#9C8E84' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Quick Access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {quickLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px',
                background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px',
                cursor: 'pointer', color: '#1A1410', fontSize: '13.5px', fontWeight: 500,
                textAlign: 'left', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = link.color + '44'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#EDE8E0'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '18px', width: '36px', height: '36px', background: link.color + '14', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div style={{
        marginTop: '24px', padding: '20px 24px', background: '#FFFFFF',
        border: '1px solid #EDE8E0', borderRadius: '14px', borderLeft: '3px solid #C4A882',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: '11px', color: '#9C8E84', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Motivation</div>
        <div style={{ fontSize: '14px', color: '#4A3E35', fontStyle: 'italic', lineHeight: 1.6 }}>
          "The body achieves what the mind believes. Show up today — your future self is counting on you."
        </div>
      </div>
    </div>
  )
}
