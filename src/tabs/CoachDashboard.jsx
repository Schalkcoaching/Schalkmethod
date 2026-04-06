import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Simple food-name lookup — converts IDs like "beef_liver" → "Beef Liver"
const fmtFood = (id) => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const MEAL_SLOTS = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Post-Workout']

const GOAL_LABELS = {
  1: '💧 Drink 2.5L of water',
  2: '💪 Complete workout',
  4: '😴 Get 7-8 hours of sleep',
  8: '👟 10,000 steps',
  9: '🎯 Micronutrient target hit!',
  10: '☀️ 30 min sunlight',
  11: '📵 No phone first 30 min',
}

function todayLocal() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}
function shiftDate(s, n) {
  const d = new Date(s + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function friendlyDate(s) {
  const t = todayLocal()
  if (s === t) return 'Today'
  if (s === shiftDate(t, -1)) return 'Yesterday'
  return new Date(s + 'T12:00:00').toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
}
function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export default function CoachDashboard({ coach, mobile }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem('tsm_app_url') || '')
  const [editingUrl, setEditingUrl] = useState(false)
  const [pendingSessions, setPendingSessions] = useState([])

  useEffect(() => { fetchClients(); fetchPendingSessions() }, [])

  const fetchClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error) setClients(data || [])
  }

  const fetchPendingSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*, profiles(email, full_name)')
      .eq('status', 'Scheduled')
      .order('created_at', { ascending: false })
    setPendingSessions(data || [])
  }

  const confirmSession = async (id) => {
    await supabase.from('sessions').update({
      status: 'Confirmed',
      confirmed_at: new Date().toISOString(),
    }).eq('id', id)
    setPendingSessions(prev => prev.filter(s => s.id !== id))
  }

  const rescheduleSession = async (id, message) => {
    if (!message?.trim()) return
    await supabase.from('sessions').update({
      status: 'Rescheduled',
      coach_message: message.trim(),
    }).eq('id', id)
    setPendingSessions(prev => prev.filter(s => s.id !== id))
  }

  const saveUrl = () => { localStorage.setItem('tsm_app_url', customUrl); setEditingUrl(false) }
  const copyLink = () => {
    if (!customUrl) return
    navigator.clipboard.writeText(customUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  const p = mobile ? '16px 14px 80px' : '40px'

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="👤" title="Coach Dashboard" sub="Monitor your clients and their progress" />

      {/* Pending sessions */}
      {pendingSessions.length > 0 && (
        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '22px' }}>🔔</span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#92400E' }}>
              {pendingSessions.length} Session Request{pendingSessions.length > 1 ? 's' : ''} Pending
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingSessions.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                onConfirm={() => confirmSession(s.id)}
                onReschedule={(msg) => rescheduleSession(s.id, msg)}
                mobile={mobile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Invite link */}
      <div style={{ background: '#1C1917', borderRadius: '16px', padding: mobile ? '20px' : '28px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#7C5C3A', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Invite a new client</div>
        {!customUrl || editingUrl ? (
          <>
            <div style={{ fontSize: '14px', color: '#9C8E84', marginBottom: '12px', lineHeight: 1.6 }}>Paste your deployed app URL — clients open this link to sign up.</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="url" placeholder="https://your-app.vercel.app" value={customUrl} onChange={e => setCustomUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveUrl()}
                style={{ flex: 1, minWidth: '220px', background: '#2C2825', border: '1px solid #3C3530', borderRadius: '10px', padding: '12px 16px', color: '#F7F3EE', fontSize: '14px', outline: 'none' }} />
              <button onClick={saveUrl} style={{ background: '#C4A882', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#1A1410', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', background: '#2C2825', border: '1px solid #3C3530', borderRadius: '10px', padding: '12px 16px', color: '#A09890', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{customUrl}</div>
              <button onClick={copyLink} style={{ background: '#C4A882', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#1A1410', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? '✓ Copied!' : 'Copy Link'}</button>
              <button onClick={() => setEditingUrl(true)} style={{ background: 'transparent', border: '1px solid #3C3530', borderRadius: '10px', padding: '12px 16px', color: '#5C5550', fontSize: '13px', cursor: 'pointer' }}>Edit</button>
            </div>
            <div style={{ fontSize: '12px', color: '#3C3530', marginTop: '10px' }}>Send this link to clients — they sign up and appear in your list below automatically.</div>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clients',     value: clients.length,                                                                              icon: '👥', color: '#C4A882' },
          { label: 'Active This Week',  value: clients.filter(c => c.last_seen && daysSince(c.last_seen) <= 7).length,                      icon: '🔥', color: '#16A34A' },
          { label: 'Need Attention',    value: clients.filter(c => !c.last_seen || daysSince(c.last_seen) > 7).length,                      icon: '⚠️', color: '#D97706' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '26px' }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: '10px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Client list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Clients ({clients.length})
        </h3>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>Loading clients…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>No clients yet. Share your invite link above!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clients.map(client => (
              <ClientRow
                key={client.id}
                client={client}
                isSelected={selectedClient?.id === client.id}
                onSelect={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                mobile={mobile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Session Card (coach actions) ────────────────────────────────────────────
function SessionCard({ session: s, onConfirm, onReschedule, mobile }) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #FED7AA', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '20px' }}>📹</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410' }}>{s.profiles?.full_name || s.profiles?.email || 'Client'}</div>
          <div style={{ fontSize: '12px', color: '#92400E', marginTop: '2px' }}>{s.type} · {s.date} at {s.time}</div>
          {s.notes && <div style={{ fontSize: '11px', color: '#9C8E84', marginTop: '2px' }}>"{s.notes}"</div>}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={onConfirm} style={{ background: '#16A34A', border: 'none', borderRadius: '8px', padding: '7px 14px', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
            ✓ Confirm
          </button>
          <button onClick={() => setShowReschedule(v => !v)} style={{ background: '#F7F3EE', border: '1px solid #FED7AA', borderRadius: '8px', padding: '7px 14px', color: '#92400E', fontSize: '12px', fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation' }}>
            ↩ Reschedule
          </button>
        </div>
      </div>
      {showReschedule && (
        <div style={{ borderTop: '1px solid #FED7AA', padding: '12px 16px', background: '#FFFBF5' }}>
          <div style={{ fontSize: '12px', color: '#92400E', marginBottom: '8px', fontWeight: 600 }}>Send a message to the client:</div>
          <input
            type="text"
            placeholder="e.g. Can we move this to Thursday at 10am?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '8px', padding: '9px 12px', color: '#1A1410', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
          />
          <button
            onClick={() => { onReschedule(message); setShowReschedule(false) }}
            disabled={!message.trim()}
            style={{ background: message.trim() ? '#D97706' : '#EDE8E0', border: 'none', borderRadius: '8px', padding: '8px 18px', color: message.trim() ? '#FFFFFF' : '#BEB5AE', fontSize: '12px', fontWeight: 700, cursor: message.trim() ? 'pointer' : 'not-allowed', touchAction: 'manipulation' }}
          >
            Send Reschedule Request
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({ client, isSelected, onSelect, mobile }) {
  const days = client.last_seen ? daysSince(client.last_seen) : null
  const status = days === null ? 'Never logged in' : days === 0 ? 'Active today' : `${days}d ago`
  const statusColor = days === null || days > 7 ? '#D97706' : days === 0 ? '#16A34A' : '#9C8E84'

  return (
    <div style={{ background: isSelected ? '#FFF9F3' : '#FAFAF8', border: `1px solid ${isSelected ? '#C4A882' : '#EDE8E0'}`, borderRadius: '12px', overflow: 'hidden' }}>
      <button onClick={onSelect} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>👤</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1410', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.full_name || client.email}</div>
          {!mobile && <div style={{ fontSize: '12px', color: '#9C8E84', marginTop: '2px' }}>{client.email}</div>}
        </div>
        <div style={{ fontSize: '11px', color: statusColor, fontWeight: 600, flexShrink: 0 }}>{status}</div>
        <span style={{ fontSize: '11px', color: '#BEB5AE' }}>{isSelected ? '▲' : '▼'}</span>
      </button>

      {isSelected && (
        <div style={{ borderTop: '1px solid #EDE8E0' }}>
          <ClientDetailPanel client={client} mobile={mobile} />
        </div>
      )}
    </div>
  )
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────
function ClientDetailPanel({ client, mobile }) {
  const [tab, setTab] = useState('photos')
  const tabs = [
    { id: 'photos',    label: '📸 Photos' },
    { id: 'nutrition', label: '🥗 Nutrition' },
    { id: 'goals',     label: '✅ Goals' },
  ]

  return (
    <div style={{ padding: mobile ? '14px' : '20px' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#F7F3EE', borderRadius: '10px', padding: '4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '8px 4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: mobile ? '11px' : '12px', fontWeight: tab === t.id ? 700 : 400, background: tab === t.id ? '#FFFFFF' : 'transparent', color: tab === t.id ? '#1A1410' : '#9C8E84', boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', touchAction: 'manipulation' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'photos'    && <PhotosPanel    clientId={client.id} mobile={mobile} />}
      {tab === 'nutrition' && <NutritionPanel clientId={client.id} mobile={mobile} />}
      {tab === 'goals'     && <GoalsPanel     clientId={client.id} mobile={mobile} />}
    </div>
  )
}

// ─── Photos Panel ─────────────────────────────────────────────────────────────
function PhotosPanel({ clientId, mobile }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase.from('progress_photos').select('*').eq('user_id', clientId).order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => { setPhotos(data || []); setLoading(false) })
  }, [clientId])

  if (loading) return <LoadingMsg />
  if (photos.length === 0) return <EmptyMsg icon="📸" text="No progress photos uploaded yet." />

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {photos.map(ph => (
          <div key={ph.id} onClick={() => setSelected(ph)} style={{ background: '#FAFAF8', border: '1px solid #EDE8E0', borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              {ph.front_url && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={ph.front_url} alt="front" style={{ width: '100%', height: mobile ? '140px' : '180px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: '5px', left: '5px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>FRONT</div>
                </div>
              )}
              {ph.side_url && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={ph.side_url} alt="side" style={{ width: '100%', height: mobile ? '140px' : '180px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: '5px', left: '5px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>SIDE</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#7C5C3A' }}>{ph.date}</div>
              {ph.weight && <div style={{ fontSize: '11px', color: '#6B5E54' }}>⚖️ {ph.weight}</div>}
            </div>
            {ph.note && <div style={{ fontSize: '11px', color: '#9C8E84', marginTop: '4px' }}>{ph.note}</div>}
          </div>
        ))}
      </div>

      {/* Full-size modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: '14px', padding: '20px', maxWidth: '620px', width: '94%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              {selected.front_url && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={selected.front_url} alt="front" style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>FRONT</div>
                </div>
              )}
              {selected.side_url && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={selected.side_url} alt="side" style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>SIDE</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#7C5C3A', marginBottom: '4px' }}>{selected.date}</div>
            {selected.weight && <div style={{ fontSize: '13px', color: '#4A3E35', marginBottom: '4px' }}>⚖️ {selected.weight}</div>}
            {selected.note && <div style={{ fontSize: '13px', color: '#6B5E54' }}>{selected.note}</div>}
            <button onClick={() => setSelected(null)} style={{ marginTop: '14px', background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontSize: '13px', color: '#4A3E35' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Nutrition Panel ──────────────────────────────────────────────────────────
function NutritionPanel({ clientId, mobile }) {
  const [selectedDate, setSelectedDate] = useState(todayLocal)
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const isToday = selectedDate === todayLocal()

  useEffect(() => {
    setLoading(true)
    supabase.from('nutrition_logs').select('*').eq('user_id', clientId).eq('date', selectedDate).maybeSingle()
      .then(({ data }) => { setLog(data); setLoading(false) })
  }, [clientId, selectedDate])

  const meals = log?.meals || {}
  const totalCals = Object.values(meals).reduce((sum, slot) => {
    if (!slot?.foods) return sum
    return sum + slot.foods.reduce((s, { id, amount }) => {
      // rough calorie estimate without full food library
      return s
    }, 0)
  }, 0)

  // Count total foods logged
  const totalFoods = Object.values(meals).reduce((n, slot) => n + (slot?.foods?.length || 0), 0)
  const loggedSlots = MEAL_SLOTS.filter(s => (meals[s]?.foods?.length || 0) > 0)

  return (
    <div>
      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F3EE', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
        <button onClick={() => setSelectedDate(d => shiftDate(d, -1))} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '7px', padding: '6px 14px', cursor: 'pointer', fontSize: '15px', color: '#6B5E54', touchAction: 'manipulation' }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410' }}>{friendlyDate(selectedDate)}</div>
          <div style={{ fontSize: '10px', color: '#9C8E84' }}>{selectedDate}</div>
        </div>
        <button onClick={() => { if (!isToday) setSelectedDate(d => shiftDate(d, 1)) }} style={{ background: isToday ? 'transparent' : '#FFFFFF', border: `1px solid ${isToday ? 'transparent' : '#EDE8E0'}`, borderRadius: '7px', padding: '6px 14px', cursor: isToday ? 'default' : 'pointer', fontSize: '15px', color: isToday ? '#D8D0C5' : '#6B5E54', touchAction: 'manipulation' }}>›</button>
      </div>

      {loading ? <LoadingMsg /> : !log ? (
        <EmptyMsg icon="🥗" text={`No nutrition logged for ${friendlyDate(selectedDate)}.`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Summary row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatChip icon="🍽️" label="Foods logged" value={totalFoods} />
            <StatChip icon="💧" label="Water" value={`${log.water || 0}L`} />
            <StatChip icon="🟢" label="Meals with food" value={loggedSlots.length} />
          </div>

          {/* Meal breakdown */}
          {loggedSlots.length > 0 && (
            <div style={{ background: '#FAFAF8', border: '1px solid #EDE8E0', borderRadius: '12px', overflow: 'hidden' }}>
              {loggedSlots.map((slot, i) => {
                const foods = meals[slot]?.foods || []
                return (
                  <div key={slot} style={{ padding: '12px 14px', borderBottom: i < loggedSlots.length - 1 ? '1px solid #EDE8E0' : 'none' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{slot}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {foods.map(({ id, amount }) => (
                        <div key={id} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '99px', padding: '3px 10px', fontSize: '12px', color: '#4A3E35' }}>
                          {fmtFood(id)}
                          <span style={{ color: '#BEB5AE', marginLeft: '4px', fontSize: '10px' }}>{amount}g</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Notes */}
          {log.notes && (
            <div style={{ background: '#FAFAF8', border: '1px solid #EDE8E0', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Client Notes</div>
              <div style={{ fontSize: '13px', color: '#4A3E35', lineHeight: 1.5 }}>{log.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Goals Panel ──────────────────────────────────────────────────────────────
function GoalsPanel({ clientId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState(null)

  useEffect(() => {
    supabase.from('daily_goals_log').select('*').eq('user_id', clientId).order('date', { ascending: false }).limit(14)
      .then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [clientId])

  if (loading) return <LoadingMsg />
  if (rows.length === 0) return <EmptyMsg icon="✅" text="No goal data logged yet." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {rows.map(row => {
        const pct = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0
        const isExpanded = expandedDay === row.date
        const checkedIds = Object.keys(row.checked_ids || {}).filter(k => row.checked_ids[k]).map(Number)

        return (
          <div key={row.date} style={{ background: '#FAFAF8', border: '1px solid #EDE8E0', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setExpandedDay(isExpanded ? null : row.date)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
              {/* Completion ring */}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: `conic-gradient(${pct >= 80 ? '#16A34A' : pct >= 50 ? '#D97706' : '#E5E7EB'} ${pct * 3.6}deg, #EDE8E0 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#1A1410' }}>{pct}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1410' }}>{friendlyDate(row.date)}</div>
                <div style={{ fontSize: '11px', color: '#9C8E84', marginTop: '1px' }}>{row.completed}/{row.total} goals completed</div>
              </div>
              {/* Dot indicators */}
              <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                {Array.from({ length: Math.min(row.total, 7) }, (_, i) => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < row.completed ? '#16A34A' : '#EDE8E0' }} />
                ))}
              </div>
              <span style={{ fontSize: '10px', color: '#BEB5AE' }}>{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div style={{ padding: '0 14px 14px', borderTop: '1px solid #EDE8E0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  {Object.entries(row.checked_ids || {}).map(([id, done]) => {
                    const label = GOAL_LABELS[Number(id)] || `Goal #${id}`
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: done ? 1 : 0.4 }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: done ? '#1C1917' : 'transparent', border: done ? 'none' : '1.5px solid #D8D0C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#F7F3EE', flexShrink: 0 }}>
                          {done ? '✓' : ''}
                        </div>
                        <span style={{ fontSize: '12px', color: done ? '#1A1410' : '#9C8E84', textDecoration: done ? 'none' : 'line-through' }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatChip({ icon, label, value }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 auto' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1A1410', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#9C8E84', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )
}

function LoadingMsg() {
  return <div style={{ padding: '24px', textAlign: 'center', color: '#BEB5AE', fontSize: '13px' }}>Loading…</div>
}

function EmptyMsg({ icon, text }) {
  return (
    <div style={{ padding: '28px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '13px', color: '#BEB5AE' }}>{text}</div>
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
