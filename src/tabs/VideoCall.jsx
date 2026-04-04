import { useState } from 'react'

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

const SESSIONS_KEY = 'coachpro_sessions'

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') } catch { return [] }
}

export default function VideoCall() {
  const [sessions, setSessions] = useState(loadSessions)
  const [booking, setBooking] = useState(false)
  const [form, setForm] = useState({ date: '', time: '', type: 'Weekly Check-In', notes: '' })
  const [booked, setBooked] = useState(false)

  const sessionTypes = ['Weekly Check-In', 'Nutrition Review', 'Program Planning', 'Mindset Session', 'Emergency Support']

  const handleBook = () => {
    if (!form.date || !form.time) return
    const session = {
      id: Date.now(),
      ...form,
      status: 'Scheduled',
      created: new Date().toLocaleDateString(),
    }
    const updated = [session, ...sessions]
    setSessions(updated)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated))
    setBooking(false)
    setBooked(true)
    setForm({ date: '', time: '', type: 'Weekly Check-In', notes: '' })
    setTimeout(() => setBooked(false), 4000)
  }

  const cancelSession = (id) => {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated))
  }

  const upcomingSessions = sessions.filter(s => s.status === 'Scheduled')

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="📹" title="Video Call & Sessions" sub="Schedule and join your weekly coaching calls" />

      {booked && (
        <div style={{ background: '#F0FAF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>✅</span>
          <span style={{ fontSize: '14px', color: '#166534' }}>Session booked successfully! Your coach will confirm shortly.</span>
        </div>
      )}

      {/* Book a session CTA */}
      <div style={{
        background: '#1C1917',
        borderRadius: '18px',
        padding: '36px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(196,168,130,0.1), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '13px', color: '#7C5C3A', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Ready to connect?</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1410', marginBottom: '10px' }}>Book Your Next Session</h2>
          <p style={{ fontSize: '14px', color: '#6B5E54', marginBottom: '24px', maxWidth: '480px' }}>
            Schedule a 1-on-1 video call with your coach. Weekly check-ins, nutrition reviews, program planning — whatever you need to keep progressing.
          </p>
          <button onClick={() => setBooking(true)} style={{
            background: '#C4A882',
            border: 'none', borderRadius: '12px', padding: '14px 28px',
            color: '#1A1410', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}>
            + Book a Session
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { icon: '📅', label: 'Sessions Available', value: 'Mon–Fri', color: '#7C5C3A' },
          { icon: '⏱️', label: 'Session Length', value: '45–60 min', color: '#3b82f6' },
          { icon: '🔗', label: 'Platform', value: 'Zoom / Google Meet', color: '#22c55e' },
        ].map(item => (
          <div key={item.label} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410', marginTop: '2px' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#9C8E84', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Upcoming Sessions ({upcomingSessions.length})
        </h3>
        {upcomingSessions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>
            No sessions scheduled yet.<br />Book your first session above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingSessions.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FAFAF8', borderRadius: '12px', padding: '16px', border: '1px solid #EDE8E0' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(196,168,130,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📹</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1410' }}>{s.type}</div>
                  <div style={{ fontSize: '13px', color: '#6B5E54', marginTop: '2px' }}>{s.date} at {s.time}</div>
                  {s.notes && <div style={{ fontSize: '12px', color: '#BEB5AE', marginTop: '4px', fontStyle: 'italic' }}>{s.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ background: 'rgba(196,168,130,0.15)', color: '#7C5C3A', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px', letterSpacing: '0.5px' }}>SCHEDULED</div>
                  <button onClick={() => cancelSession(s.id)} style={{ background: 'transparent', border: 'none', color: '#BEB5AE', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {booking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setBooking(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', border: '1px solid #D8D0C5', borderRadius: '18px', padding: '32px', width: '440px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1410', marginBottom: '24px' }}>Book a Session</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={lbl}>
                Session Type
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                  {sessionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={lbl}>
                Preferred Date
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} />
              </label>
              <label style={lbl}>
                Preferred Time
                <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={inp}>
                  <option value="">Select a time...</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={lbl}>
                Notes for your coach (optional)
                <textarea
                  placeholder="What would you like to focus on in this session?"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  style={{ ...inp, resize: 'vertical' }}
                />
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={handleBook} style={{ flex: 1, background: '#1C1917', border: 'none', borderRadius: '10px', padding: '13px', color: '#F7F3EE', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  Confirm Booking
                </button>
                <button onClick={() => setBooking(false)} style={{ background: '#F7F3EE', border: 'none', borderRadius: '10px', padding: '13px 20px', color: '#9C8E84', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize: '11px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', flexDirection: 'column', gap: '6px' }
const inp = { background: '#FAFAF8', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 14px', color: '#1A1410', fontSize: '14px', outline: 'none' }

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
