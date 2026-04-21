import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const QUOTES = [
  "The body achieves what the mind believes. Show up today — your future self is counting on you.",
  "Discipline is doing it even when you don't feel like it. That's where most people stop and champions begin.",
  "Every meal, every rep, every night of sleep — it all compounds. Trust the process.",
  "You don't have to be extreme. You just have to be consistent.",
  "The version of you that you want to become is built one day at a time.",
  "Motivation gets you started. Habit keeps you going.",
  "Your health is not a sacrifice — it's an investment in everything else in your life.",
  "Progress is progress. A small win today is still a win.",
  "You are one decision away from a completely different life. Make the right one today.",
  "Stop waiting for the perfect moment. The perfect moment is right now.",
  "Hard work beats talent when talent doesn't work hard.",
  "The pain you feel today is the strength you'll feel tomorrow.",
  "You already have what it takes. Now go prove it.",
  "Real change doesn't happen in a week. But every week you show up, you get closer.",
  "Champions are made in the moments they want to quit but don't.",
  "Your body hears everything your mind says. Feed it the right thoughts.",
  "Health is wealth. Protect it like it's your most valuable asset.",
  "It's not about being the best. It's about being better than you were yesterday.",
  "The only bad workout is the one that didn't happen.",
  "Eat well, move daily, sleep enough. Simple doesn't mean easy.",
  "You're not starting over — you're starting stronger.",
  "Small steps every day lead to big results every year.",
  "Don't compare your chapter 1 to someone else's chapter 20.",
  "Your habits today are writing your story tomorrow.",
  "Show up. Do the work. Trust the process. The results will come.",
  "Consistency over intensity. Every single time.",
  "One percent better every day. That's all it takes.",
  "The difference between who you are and who you want to be is what you do today.",
  "You didn't come this far to only come this far.",
  "Make your health your identity, not just your goal.",
]

const quickLinks = [
  { id: 'progress',  label: 'Log Progress Pic',  icon: '📸', color: '#BE185D' },
  { id: 'goals',     label: 'Daily Goals',        icon: '✅', color: '#15803D' },
  { id: 'nutrition', label: 'Log Meals',          icon: '🥗', color: '#C2410C' },
  { id: 'recipes',   label: 'Recipes',            icon: '👨‍🍳', color: '#92400E' },
  { id: 'workout',   label: 'Workout',            icon: '💪', color: '#1D4ED8' },
  { id: 'qa',        label: 'Ask Coach',          icon: '💬', color: '#6D28D9' },
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function Home({ user, setActiveTab, mobile }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const [goalsLog, setGoalsLog] = useState(null)
  const [nutritionLog, setNutritionLog] = useState(null)

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const quote = QUOTES[dayOfYear % QUOTES.length]

  useEffect(() => {
    if (!user) return
    const date = todayISO()
    supabase.from('daily_goals_log').select('completed,total').eq('user_id', user.id).eq('date', date).single()
      .then(({ data }) => setGoalsLog(data))
    supabase.from('nutrition_logs').select('water,meals').eq('user_id', user.id).eq('date', date).single()
      .then(({ data }) => setNutritionLog(data))
  }, [user])

  const goalsText = goalsLog ? `${goalsLog.completed}/${goalsLog.total}` : '—'
  const waterText = nutritionLog?.water ? `${nutritionLog.water}L` : '—'
  const mealsLogged = nutritionLog?.meals ? Object.values(nutritionLog.meals).filter(m => m?.foods?.length > 0).length : 0
  const mealsText = mealsLogged > 0 ? `${mealsLogged} meal${mealsLogged > 1 ? 's' : ''}` : '—'

  const stats = [
    { label: 'Goals Today',  value: goalsText,  icon: '✅', color: '#15803D' },
    { label: 'Water Today',  value: waterText,  icon: '💧', color: '#0891B2' },
    { label: 'Meals Logged', value: mealsText,  icon: '🥗', color: '#C2410C' },
  ]

  const p = mobile ? '14px 14px 80px' : '40px'

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE', boxSizing: 'border-box' }}>

      {/* Hero */}
      <div style={{
        borderRadius: '16px', background: '#1C1917',
        padding: mobile ? '28px 22px' : '60px 52px',
        position: 'relative', overflow: 'hidden', marginBottom: mobile ? '14px' : '24px',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,168,130,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', color: '#C4A882', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>{today}</div>
          <h1 style={{ fontSize: mobile ? '26px' : '44px', fontWeight: 900, lineHeight: 1.15, marginBottom: '10px', color: '#F7F3EE' }}>
            {mobile
              ? <>You've Come to the<br /><span style={{ color: '#C4A882' }}>Right Place.</span></>
              : <>You've Come to the<br />Right Place to<br /><span style={{ color: '#C4A882' }}>Change Your Life.</span></>}
          </h1>
          <p style={{ fontSize: mobile ? '12px' : '14px', color: '#8C7E72', maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
            Every rep, every meal, every check-in brings you closer to the version of yourself you've always wanted to be.
          </p>
          <button onClick={() => setActiveTab('goals')} style={{
            marginTop: mobile ? '16px' : '24px', padding: mobile ? '11px 20px' : '14px 32px',
            borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: mobile ? '13px' : '14px', fontWeight: 700,
            background: '#C4A882', color: '#1C1917',
          }}>
            Start Today's Check-In →
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: mobile ? '8px' : '12px', marginBottom: mobile ? '14px' : '24px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px', padding: mobile ? '12px' : '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center' }}>
            <span style={{ fontSize: mobile ? '20px' : '24px' }}>{stat.icon}</span>
            <div style={{ fontSize: mobile ? '17px' : '22px', fontWeight: 800, color: stat.value === '—' ? '#D0C8BF' : '#1A1410' }}>{stat.value}</div>
            <div style={{ fontSize: mobile ? '9px' : '11px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div style={{ marginBottom: mobile ? '14px' : '24px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {quickLinks.map(link => (
            <button key={link.id} onClick={() => setActiveTab(link.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: mobile ? '14px 8px' : '18px 12px',
              background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px',
              cursor: 'pointer', color: '#1A1410',
            }}>
              <span style={{ fontSize: mobile ? '22px' : '26px', width: mobile ? '38px' : '44px', height: mobile ? '38px' : '44px', background: link.color + '14', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{link.icon}</span>
              <span style={{ fontSize: mobile ? '10px' : '11px', fontWeight: 600, color: '#4A3E35', textAlign: 'center', lineHeight: 1.3 }}>{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Motivation */}
      <div style={{ padding: mobile ? '16px' : '20px 24px', background: '#1C1917', borderRadius: '14px' }}>
        <div style={{ fontSize: '10px', color: '#C4A882', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Today's Motivation</div>
        <div style={{ fontSize: mobile ? '13px' : '14px', color: '#D4C5B0', fontStyle: 'italic', lineHeight: 1.7 }}>"{quote}"</div>
      </div>

    </div>
  )
}
