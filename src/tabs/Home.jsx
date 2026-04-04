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

export default function Home({ setActiveTab, mobile }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: mobile ? '14px 14px 80px' : '40px', minHeight: '100vh', background: '#F7F3EE', boxSizing: 'border-box' }}>

      {/* Hero */}
      <div style={{
        borderRadius: '16px', background: '#1C1917',
        padding: mobile ? '28px 22px' : '60px 52px',
        position: 'relative', overflow: 'hidden', marginBottom: mobile ? '16px' : '28px',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,168,130,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', color: '#C4A882', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {today}
          </div>
          <h1 style={{ fontSize: mobile ? '26px' : '44px', fontWeight: 900, lineHeight: 1.15, marginBottom: '12px', color: '#F7F3EE' }}>
            {mobile ? <>You've Come to the<br /><span style={{ color: '#C4A882' }}>Right Place.</span></> : <>You've Come to the<br />Right Place to<br /><span style={{ color: '#C4A882' }}>Change Your Life.</span></>}
          </h1>
          <p style={{ fontSize: mobile ? '13px' : '15px', color: '#8C7E72', maxWidth: '480px', lineHeight: 1.6 }}>
            Every rep, every meal, every check-in brings you closer to the version of yourself you've always wanted to be.
          </p>
          <button
            onClick={() => setActiveTab('goals')}
            style={{
              marginTop: mobile ? '18px' : '28px', padding: mobile ? '12px 22px' : '14px 32px',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: mobile ? '13px' : '14px', fontWeight: 700,
              background: '#C4A882', color: '#1C1917', letterSpacing: '0.3px',
            }}
          >
            Start Today's Check-In →
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? '10px' : '14px', marginBottom: mobile ? '16px' : '28px' }}>
        {quickStats.map(stat => (
          <div key={stat.label} style={{
            background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px',
            padding: mobile ? '14px' : '20px', display: 'flex', alignItems: 'center', gap: mobile ? '10px' : '14px',
          }}>
            <div style={{ width: mobile ? '36px' : '44px', height: mobile ? '36px' : '44px', borderRadius: '10px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mobile ? '18px' : '20px', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 800, color: '#1A1410' }}>{stat.value}</div>
              <div style={{ fontSize: mobile ? '10px' : '12px', color: '#9C8E84' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Quick Access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px' }}>
          {quickLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: mobile ? '12px 14px' : '16px 18px',
                background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px',
                cursor: 'pointer', color: '#1A1410', fontSize: mobile ? '12px' : '13.5px',
                fontWeight: 500, textAlign: 'left',
              }}
            >
              <span style={{ fontSize: mobile ? '16px' : '18px', width: mobile ? '30px' : '36px', height: mobile ? '30px' : '36px', background: link.color + '14', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div style={{
        marginTop: mobile ? '16px' : '24px', padding: mobile ? '16px' : '20px 24px',
        background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px',
        borderLeft: '3px solid #C4A882',
      }}>
        <div style={{ fontSize: '11px', color: '#9C8E84', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Motivation</div>
        <div style={{ fontSize: mobile ? '13px' : '14px', color: '#4A3E35', fontStyle: 'italic', lineHeight: 1.6 }}>
          "The body achieves what the mind believes. Show up today — your future self is counting on you."
        </div>
      </div>
    </div>
  )
}
