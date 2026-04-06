import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

export default function VideoCall({ user, mobile }) {
  const [sessions, setSessions] = useState([])
  const [booking, setBooking] = useState(false)
  const [form, setForm] = useState({ date: '', time: '', type: 'Weekly Check-In', notes: '' })
  const [booked, setBooked] = useState(false)
  const [loading, setLoading] = useState(true)

  const sessionTypes = ['Weekly Check-In', 'Nutrition Review', 'Program Planning', 'Body Composition Review', 'Emergency Support']

  useEffect(() => { if (user) loadSessions() }, [user])

  const loadSessions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setSessions(data || [])
    setLoading(false)
  }

  const handleBook = async () => {
    if (!form.date || !form.time) return
    if (user) {
      const { data, error } = await supabase.from('sessions').insert({
        user_id: user.id,
        type: form.type,
        date: form.date,
        time: form.time,
        notes: form.notes,
        status: 'Scheduled',
      }).select().single()
      if (!error && data) setSessions(prev => [data, ...prev])
    }
    setBooking(false)
    setBooked(true)
    setForm({ date: '', time: '', type: 'Weekly Check-In', notes: '' })
    setTimeout(() => setBooked(false), 5000)
  }

  const cancelSession = async (id) => {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  // Notification banners for confirmed/rescheduled sessions
  const actionableSessions = sessions.filter(s => s.status === 'Confirmed' || s.status === 'Rescheduled')
  const upcomingSessions = sessions.filter(s => s.status === 'Scheduled')

  const statusStyle = {
    Scheduled:   { bg: 'rgba(196,168,130,0.15)', color: '#7C5C3A', label: 'PENDING' },
    Confirmed:   { bg: 'rgba(22,163,74,0.12)',   color: '#15803D', label: '✓ CONFIRMED' },
    Rescheduled: { bg: 'rgba(217,119,6,0.12)',   color: '#B45309', label: '↩ RESCHEDULE REQUESTED' },
  }

  const p = mobile ? '16px 14px 20px' : '40px'

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="📹" title="Video Call & Sessions" sub="Schedule your 1-on-1 coaching calls" />

      {/* Just booked banner */}
      {booked && (
        <div style={{ background: '#F0FAF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>✅</span>
          <span style={{ fontSize: '14px', color: '#166534' }}>Session booked! Your coach has been notified and will confirm shortly.</span>
        </div>
      )}

      {/* Confirmed / Rescheduled notification banners */}
      {actionableSessions.map(s => (
        <div key={s.id} style={{
          background: s.status === 'Confirmed' ? '#F0FAF4' : '#FFFBEB',
          border: `1px solid ${s.status === 'Confirmed' ? '#BBF7D0' : '#FDE68A'}`,
          borderRadius: '14px', padding: '16px 20px', marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>{s.status === 'Confirmed' ? '✅' : '🔄'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A1410', marginBottom: '4px' }}>
                {s.status === 'Confirmed'
                  ? 'Session Confirmed!'
                  : 'Your coach wants to reschedule'}
              </div>
              <div style={{ fontSize: '13px', color: '#6B5E54' }}>
                {s.type} · {s.date} at {s.time}
              </div>
              {s.coach_message && (
                <div style={{ fontSize: '13px', color: s.status === 'Confirmed' ? '#166534' : '#92400E', marginTop: '6px', background: s.status === 'Confirmed' ? '#DCFCE7' : '#FEF3C7', borderRadius: '8px', padding: '8px 12px', fontStyle: 'italic' }}>
                  Coach: "{s.coach_message}"
                </div>
              )}
              {s.status === 'Rescheduled' && (
                <button onClick={() => setBooking(true)} style={{ marginTop: '10px', background: '#1C1917', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#F7F3EE', fontSize: '12px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
                  Book a New Time →
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Book a session CTA */}
      <div style={{ background: '#1C1917', borderRadius: '18px', padding: mobile ? '24px 20px' : '36px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(196,168,130,0.1), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '13px', color: '#7C5C3A', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Ready to connect?</div>
          <h2 style={{ fontSize: mobile ? '22px' : '26px', fontWeight: 800, color: '#F7F3EE', marginBottom: '10px' }}>Book Your Next Session</h2>
          <p style={{ fontSize: '14px', color: '#6B5E54', marginBottom: '24px', maxWidth: '480px' }}>
            Schedule a 1-on-1 video call with your coach. Weekly check-ins, nutrition reviews, program planning — whatever you need.
          </p>
          <button onClick={() => setBooking(true)} style={{ background: '#C4A882', border: 'none', borderRadius: '12px', padding: '14px 28px', color: '#1A1410', fontSize: '14px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
            + Book a Session
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { icon: '📅', label: 'Sessions Available', value: 'Mon–Fri' },
          { icon: '⏱️', label: 'Session Length',     value: '30–45 min' },
          { icon: '🔗', label: 'Platform',            value: 'Zoom / Google Meet' },
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

      {/* All sessions list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#9C8E84', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          My Sessions ({sessions.length})
        </h3>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>Loading…</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>No sessions yet. Book your first one above!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sessions.map(s => {
              const st = statusStyle[s.status] || statusStyle.Scheduled
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FAFAF8', borderRadius: '12px', padding: '14px', border: '1px solid #EDE8E0', flexWrap: 'wrap' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(196,168,130,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📹</div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1410' }}>{s.type}</div>
                    <div style={{ fontSize: '12px', color: '#6B5E54', marginTop: '2px' }}>{s.date} at {s.time}</div>
                    {s.notes && <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '3px', fontStyle: 'italic' }}>{s.notes}</div>}
                    {s.coach_message && <div style={{ fontSize: '11px', color: '#B45309', marginTop: '3px' }}>Coach: "{s.coach_message}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ background: st.bg, color: st.color, fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px' }}>{st.label}</div>
                    {s.status === 'Scheduled' && (
                      <button onClick={() => cancelSession(s.id)} style={{ background: 'transparent', border: 'none', color: '#BEB5AE', cursor: 'pointer', fontSize: '18px', touchAction: 'manipulation' }}>×</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {booking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.65)', display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setBooking(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', border: '1px solid #D8D0C5', borderRadius: mobile ? '18px 18px 0 0' : '18px', padding: '32px', width: mobile ? '100%' : '440px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                <textarea placeholder="What would you like to focus on?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} />
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={handleBook} disabled={!form.date || !form.time} style={{ flex: 1, background: '#1C1917', border: 'none', borderRadius: '10px', padding: '13px', color: '#F7F3EE', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: form.date && form.time ? 1 : 0.4, touchAction: 'manipulation' }}>
                  Confirm Booking
                </button>
                <button onClick={() => setBooking(false)} style={{ background: '#F7F3EE', border: 'none', borderRadius: '10px', padding: '13px 20px', color: '#9C8E84', cursor: 'pointer', touchAction: 'manipulation' }}>
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
const inp = { background: '#FAFAF8', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '10px 14px', color: '#1A1410', fontSize: '14px', outline: 'none' }

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
