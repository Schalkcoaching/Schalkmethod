import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function CoachDashboard({ coach }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem('tsm_app_url') || '')
  const [editingUrl, setEditingUrl] = useState(false)

  useEffect(() => { fetchClients() }, [])

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

  const saveUrl = () => {
    localStorage.setItem('tsm_app_url', customUrl)
    setEditingUrl(false)
  }

  const copyLink = () => {
    if (!customUrl) return
    navigator.clipboard.writeText(customUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="👤" title="Coach Dashboard" sub="Monitor your clients and manage their progress" />

      {/* Invite section */}
      <div style={{ background: '#1C1917', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#7C5C3A', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Invite a new client
        </div>
        {!customUrl || editingUrl ? (
          <>
            <div style={{ fontSize: '14px', color: '#9C8E84', marginBottom: '12px', lineHeight: 1.6 }}>
              Paste your deployed app URL below — clients open this link to sign up. Deploy to <span style={{ color: '#C4A882' }}>vercel.com</span> or <span style={{ color: '#C4A882' }}>netlify.com</span> (free) to get a shareable link.
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="url"
                placeholder="https://your-app.vercel.app"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveUrl()}
                style={{ flex: 1, minWidth: '220px', background: '#2C2825', border: '1px solid #3C3530', borderRadius: '10px', padding: '12px 16px', color: '#F7F3EE', fontSize: '14px', outline: 'none' }}
              />
              <button onClick={saveUrl} style={{ background: '#C4A882', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#1A1410', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', background: '#2C2825', border: '1px solid #3C3530', borderRadius: '10px', padding: '12px 16px', color: '#A09890', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {customUrl}
              </div>
              <button onClick={copyLink} style={{ background: '#C4A882', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#1A1410', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
              <button onClick={() => setEditingUrl(true)} style={{ background: 'transparent', border: '1px solid #3C3530', borderRadius: '10px', padding: '12px 16px', color: '#5C5550', fontSize: '13px', cursor: 'pointer' }}>
                Edit
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#3C3530', marginTop: '10px' }}>
              Send this link to clients — they sign up and appear in your list below automatically.
            </div>
          </>
        )}
      </div>

      {/* Stats overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clients', value: clients.length, icon: '👥', color: '#C4A882' },
          { label: 'Active This Week', value: clients.filter(c => c.last_seen && daysSince(c.last_seen) <= 7).length, icon: '🔥', color: '#16A34A' },
          { label: 'Need Attention', value: clients.filter(c => !c.last_seen || daysSince(c.last_seen) > 7).length, icon: '⚠️', color: '#D97706' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Client list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#9C8E84', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Clients ({clients.length})
        </h3>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>
            No clients yet. Invite your first client above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {clients.map(client => (
              <ClientRow
                key={client.id}
                client={client}
                isSelected={selectedClient?.id === client.id}
                onSelect={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Client detail modal */}
      {selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  )
}

function ClientRow({ client, isSelected, onSelect }) {
  const last = client.last_seen
  const days = last ? daysSince(last) : null
  const status = days === null ? 'Never logged in' : days === 0 ? 'Active today' : `${days}d ago`
  const statusColor = days === null || days > 7 ? '#D97706' : days === 0 ? '#16A34A' : '#9C8E84'

  return (
    <div style={{
      background: isSelected ? '#FFF9F3' : '#FAFAF8',
      border: `1px solid ${isSelected ? '#C4A882' : '#EDE8E0'}`,
      borderRadius: '12px', overflow: 'hidden',
    }}>
      <button
        onClick={onSelect}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
          👤
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1410' }}>
            {client.full_name || client.email}
          </div>
          <div style={{ fontSize: '12px', color: '#9C8E84', marginTop: '2px' }}>{client.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: statusColor, fontWeight: 600 }}>{status}</div>
          <div style={{ fontSize: '11px', background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '99px', padding: '3px 10px', color: '#6B5E54' }}>
            {client.goal || 'No goal set'}
          </div>
          <span style={{ fontSize: '11px', color: '#BEB5AE' }}>{isSelected ? '▲' : '▼'}</span>
        </div>
      </button>

      {isSelected && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #EDE8E0' }}>
          <ClientSummaryPanel clientId={client.id} />
        </div>
      )}
    </div>
  )
}

function ClientSummaryPanel({ clientId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [goalsRes, nutritionRes, photosRes, sessionsRes] = await Promise.all([
        supabase.from('daily_goals_log').select('*').eq('user_id', clientId).order('date', { ascending: false }).limit(7),
        supabase.from('nutrition_logs').select('*').eq('user_id', clientId).order('date', { ascending: false }).limit(7),
        supabase.from('progress_photos').select('*').eq('user_id', clientId).order('created_at', { ascending: false }).limit(3),
        supabase.from('sessions').select('*').eq('user_id', clientId).eq('status', 'Scheduled'),
      ])
      setData({
        goals: goalsRes.data || [],
        nutrition: nutritionRes.data || [],
        photos: photosRes.data || [],
        sessions: sessionsRes.data || [],
      })
      setLoading(false)
    }
    loadData()
  }, [clientId])

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#BEB5AE', fontSize: '13px' }}>Loading data...</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
      {[
        { label: 'Goals (7d)', value: data.goals.length > 0 ? `${data.goals.length} logged` : 'No data', icon: '✅' },
        { label: 'Nutrition logs', value: data.nutrition.length > 0 ? `${data.nutrition.length} days` : 'No data', icon: '🥗' },
        { label: 'Progress photos', value: data.photos.length > 0 ? `${data.photos.length} photos` : 'None yet', icon: '📸' },
        { label: 'Sessions booked', value: data.sessions.length > 0 ? `${data.sessions.length} upcoming` : 'None booked', icon: '📹' },
      ].map(item => (
        <div key={item.label} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A1410' }}>{item.value}</div>
          <div style={{ fontSize: '10px', color: '#BEB5AE', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

function ClientDetailModal({ client, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '18px', padding: '32px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1410', marginBottom: '4px' }}>
              {client.full_name || 'Client'}
            </h3>
            <div style={{ fontSize: '13px', color: '#9C8E84' }}>{client.email}</div>
          </div>
          <button onClick={onClose} style={{ background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#6B5E54', fontSize: '13px' }}>
            Close
          </button>
        </div>
        <ClientSummaryPanel clientId={client.id} />
      </div>
    </div>
  )
}

function daysSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
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
