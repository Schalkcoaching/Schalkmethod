import { useState, useEffect } from 'react'

const DEFAULT_GOALS = [
  { id: 1,  label: 'Drink 2.5L of water',                    icon: '💧', category: 'Health' },
  { id: 2,  label: 'Complete workout',                         icon: '💪', category: 'Fitness' },
  { id: 4,  label: 'Get 7-8 hours of sleep',                  icon: '😴', category: 'Recovery' },
  { id: 8,  label: '10,000 steps',                            icon: '👟', category: 'Activity' },
  { id: 9,  label: 'Micronutrient target hit!',               icon: '🎯', category: 'Nutrition' },
  { id: 10, label: '30 minutes minimum of sunlight per day',  icon: '☀️', category: 'Health' },
  { id: 11, label: 'No phone first 30 min of the day',        icon: '📵', category: 'Mindset' },
]

const todayKey = () => `coachpro_goals_${new Date().toDateString()}`

export default function DailyGoals({ mobile }) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey()) || '{}') } catch { return {} }
  })
  const [customGoal, setCustomGoal] = useState('')
  const [goals, setGoals] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('coachpro_custom_goals_v2') || 'null')
      return saved || DEFAULT_GOALS
    } catch { return DEFAULT_GOALS }
  })

  useEffect(() => {
    localStorage.setItem(todayKey(), JSON.stringify(checked))
  }, [checked])

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const addGoal = () => {
    if (!customGoal.trim()) return
    const newGoal = { id: Date.now(), label: customGoal.trim(), icon: '⭐', category: 'Custom' }
    const updated = [...goals, newGoal]
    setGoals(updated)
    localStorage.setItem('coachpro_custom_goals_v2', JSON.stringify(updated))
    setCustomGoal('')
  }

  const removeGoal = (id) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    localStorage.setItem('coachpro_custom_goals_v2', JSON.stringify(updated))
  }

  const completedCount = goals.filter(g => checked[g.id]).length
  const percent = Math.round((completedCount / goals.length) * 100)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: mobile ? '16px 14px 20px' : '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="✅" title="Daily Goals" sub={today} />

      {/* Progress ring */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#EDE8E0" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="url(#gradLight)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - percent / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="gradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1C1917" />
                  <stop offset="100%" stopColor="#7C5C3A" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 800, color: '#1A1410',
            }}>{percent}%</div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>
              {completedCount} / {goals.length} Goals Complete
            </div>
            <div style={{ fontSize: '13px', color: '#9C8E84', marginTop: '4px' }}>
              {percent === 100 ? '🎉 You crushed it today! Amazing work!' :
               percent >= 75 ? '🔥 Almost there — keep pushing!' :
               percent >= 50 ? "💪 Halfway through — you've got this!" :
               "Let's get started on today's goals!"}
            </div>
          </div>
        </div>
      </div>

      {/* Goals list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Today's Goals</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.map(goal => {
            const done = !!checked[goal.id]
            return (
              <div key={goal.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                background: done ? '#F0EBE4' : '#FAFAF8',
                borderRadius: '12px',
                border: done ? '1px solid #D8C8B0' : '1px solid #EDE8E0',
                transition: 'all 0.2s', cursor: 'pointer',
              }} onClick={() => toggle(goal.id)}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
                  border: done ? 'none' : '2px solid #D8D0C5',
                  background: done ? '#1C1917' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', color: '#F7F3EE',
                }}>
                  {done && '✓'}
                </div>
                <span style={{ fontSize: '18px' }}>{goal.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: done ? '#9C8E84' : '#1A1410', textDecoration: done ? 'line-through' : 'none' }}>
                    {goal.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>{goal.category}</div>
                </div>
                {goal.category === 'Custom' && (
                  <button onClick={e => { e.stopPropagation(); removeGoal(goal.id) }} style={{
                    background: 'transparent', border: 'none', color: '#BEB5AE', cursor: 'pointer', fontSize: '18px', padding: '2px 6px',
                  }}>×</button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add custom goal */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Add Custom Goal</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="e.g. Take vitamins, stretch for 10 minutes..."
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            style={{ flex: 1, background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '10px', padding: '12px 16px', color: '#1A1410', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={addGoal} style={{ background: '#1C1917', border: 'none', borderRadius: '10px', padding: '12px 22px', color: '#F7F3EE', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add Goal
          </button>
        </div>
      </div>
    </div>
  )
}

function PageHeader({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <span style={{ fontSize: '26px' }}>{icon}</span>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1410' }}>{title}</h1>
      </div>
      <p style={{ fontSize: '14px', color: '#9C8E84', marginLeft: '38px' }}>{sub}</p>
    </div>
  )
}
