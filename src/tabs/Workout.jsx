import { useState } from 'react'

const TODAY_KEY = () => `tsm_workout_${new Date().toDateString()}`

const WORKOUT_TYPES = [
  { label: 'Upper Body Push', icon: '💪', color: '#a855f7' },
  { label: 'Upper Body Pull', icon: '🏋️', color: '#ec4899' },
  { label: 'Lower Body', icon: '🦵', color: '#3b82f6' },
  { label: 'Full Body', icon: '⚡', color: '#f97316' },
  { label: 'Cardio', icon: '🏃', color: '#22c55e' },
  { label: 'Custom', icon: '✏️', color: '#C4A882' },
]

const DURATIONS = ['30 min', '45 min', '60 min', '75 min', '90 min', '2+ hrs']

export default function Workout({ mobile }) {
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TODAY_KEY()) || 'null') || {} }
    catch { return {} }
  })

  const save = updates => {
    const updated = { ...log, ...updates }
    setLog(updated)
    localStorage.setItem(TODAY_KEY(), JSON.stringify(updated))
  }

  const isRestDay = log.restDay === true
  const isLogged = isRestDay || (log.type && log.duration)

  return (
    <div style={{ padding: mobile ? '16px 14px 20px' : '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="💪" title="Workout Log" sub="Log today's session" />

      {/* Rest day toggle */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410' }}>Rest Day</div>
          <div style={{ fontSize: '13px', color: '#9C8E84', marginTop: '2px' }}>Recovery is part of the programme</div>
        </div>
        <button
          onClick={() => save({ restDay: !isRestDay, type: undefined, duration: undefined, customLabel: undefined })}
          style={{ width: '52px', height: '28px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: isRestDay ? '#1C1917' : '#E5E7EB', position: 'relative', transition: 'background 0.2s' }}
        >
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '3px', left: isRestDay ? '27px' : '3px', transition: 'left 0.2s' }} />
        </button>
      </div>

      {!isRestDay && (
        <>
          {/* Workout type */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', fontWeight: 700 }}>
              What did you train today?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {WORKOUT_TYPES.map(w => {
                const active = log.type === w.label
                return (
                  <button key={w.label} onClick={() => save({ type: w.label, restDay: false })} style={{
                    padding: '14px 10px', borderRadius: '12px',
                    border: active ? 'none' : '1px solid #EDE8E0',
                    borderLeft: active ? `3px solid ${w.color}` : '3px solid transparent',
                    background: active ? w.color + '18' : '#FAFAF8',
                    color: active ? w.color : '#4A3E35',
                    cursor: 'pointer', fontWeight: active ? 700 : 400, fontSize: '13px', textAlign: 'center',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{w.icon}</div>
                    {w.label}
                  </button>
                )
              })}
            </div>
            {log.type === 'Custom' && (
              <input
                type="text"
                placeholder="Describe your workout..."
                value={log.customLabel || ''}
                onChange={e => save({ customLabel: e.target.value })}
                style={{ marginTop: '12px', width: '100%', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '10px 14px', color: '#1A1410', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            )}
          </div>

          {/* Duration */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', fontWeight: 700 }}>
              How long did you train?
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {DURATIONS.map(d => {
                const active = log.duration === d
                return (
                  <button key={d} onClick={() => save({ duration: d })} style={{
                    padding: '10px 20px', borderRadius: '10px', border: '1px solid #EDE8E0',
                    background: active ? '#1C1917' : '#FAFAF8',
                    color: active ? '#F7F3EE' : '#4A3E35',
                    cursor: 'pointer', fontWeight: active ? 700 : 400, fontSize: '14px',
                    transition: 'all 0.15s',
                  }}>
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Completion card */}
      {isLogged && (
        <div style={{ background: '#1C1917', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>{isRestDay ? '😴' : '🎉'}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#F7F3EE', marginBottom: '6px' }}>
            {isRestDay ? 'Rest Day Logged' : `${log.customLabel || log.type} · ${log.duration}`}
          </div>
          <div style={{ fontSize: '13px', color: '#5C5550' }}>
            {isRestDay ? 'Your body is recovering. Great choice.' : 'Session logged. Well done today!'}
          </div>
        </div>
      )}
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
