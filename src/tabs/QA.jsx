import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const categories = ['General', 'Nutrition', 'Training', 'Recovery', 'Mindset', 'Other']

export default function QA({ user, mobile }) {
  const [questions, setQuestions] = useState([])
  const [publicQuestions, setPublicQuestions] = useState([])
  const [form, setForm] = useState({ category: 'General', subject: '', message: '', urgent: false, is_public: false })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mine')

  useEffect(() => { fetchQuestions() }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    const [myRes, pubRes] = await Promise.all([
      supabase.from('questions').select('*, profiles(full_name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('questions').select('*, profiles(full_name)').eq('is_public', true).order('created_at', { ascending: false }),
    ])
    setQuestions(myRes.data || [])
    setPublicQuestions(pubRes.data || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.message.trim()) return
    const { error } = await supabase.from('questions').insert({
      user_id: user.id,
      category: form.category,
      subject: form.subject,
      message: form.message,
      urgent: form.urgent,
      is_public: form.is_public,
    })
    if (error) { console.error('Question submit failed:', error.message); return }
    setForm({ category: 'General', subject: '', message: '', urgent: false, is_public: false })
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    fetchQuestions()
  }

  const p = mobile ? '16px 14px 80px' : '40px'

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="💬" title="Ask Your Coach" sub="Ask privately or share with the community" />

      {sent && (
        <div style={{ background: '#F0FAF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontSize: '14px', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ✓ Message sent! Your coach will respond within 24 hours.
        </div>
      )}

      {/* Composer */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410', marginBottom: '18px' }}>New Message</h3>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
          <label style={lbl}>
            Category
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inp}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label style={lbl}>
            Subject (optional)
            <input type="text" placeholder="What's this about?" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={inp} />
          </label>
        </div>

        <label style={{ ...lbl, marginBottom: '16px' }}>
          Your Message
          <textarea
            placeholder="Type your question or concern here..."
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            rows={4}
            style={{ ...inp, resize: 'vertical' }}
          />
        </label>

        {/* Visibility toggle */}
        <div style={{ background: '#F7F3EE', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Visibility</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { value: false, label: '🔒 Private', desc: 'Only you and your coach' },
              { value: true,  label: '🌍 Public',  desc: 'Visible to all clients' },
            ].map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setForm(p => ({ ...p, is_public: opt.value }))}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px', border: `2px solid ${form.is_public === opt.value ? '#1C1917' : '#EDE8E0'}`,
                  background: form.is_public === opt.value ? '#1C1917' : '#FFFFFF',
                  color: form.is_public === opt.value ? '#F7F3EE' : '#6B5E54',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#6B5E54' }}>
            <input type="checkbox" checked={form.urgent} onChange={e => setForm(p => ({ ...p, urgent: e.target.checked }))} style={{ width: '15px', height: '15px', accentColor: '#ec4899' }} />
            🚨 Mark as urgent
          </label>
          <button
            onClick={handleSubmit}
            disabled={!form.message.trim()}
            style={{ background: '#1C1917', border: 'none', borderRadius: '10px', padding: '12px 26px', color: '#F7F3EE', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: form.message.trim() ? 1 : 0.4 }}
          >
            Send →
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[{ id: 'mine', label: '🔒 My Messages' }, { id: 'community', label: '🌍 Community Q&A' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.id ? 700 : 400,
            background: tab === t.id ? '#1C1917' : '#FFFFFF',
            color: tab === t.id ? '#F7F3EE' : '#9C8E84',
            border: `1px solid ${tab === t.id ? '#1C1917' : '#EDE8E0'}`,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Messages list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>Loading...</div>
        ) : (tab === 'mine' ? questions : publicQuestions).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>
            {tab === 'mine' ? 'No messages yet. Ask your coach something above!' : 'No public questions yet — be the first!'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(tab === 'mine' ? questions : publicQuestions).map(q => (
              <QuestionCard key={q.id} q={q} isOwn={q.user_id === user.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionCard({ q, isOwn }) {
  return (
    <div style={{ background: '#FAFAF8', border: '1px solid #EDE8E0', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#EDE9FE', color: '#7C3AED', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px' }}>{q.category}</span>
            {q.urgent && <span style={{ background: '#FCE7F3', color: '#BE185D', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px' }}>🚨 URGENT</span>}
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px', background: q.is_public ? '#DCFCE7' : '#F3F4F6', color: q.is_public ? '#15803D' : '#6B7280' }}>
              {q.is_public ? '🌍 Public' : '🔒 Private'}
            </span>
            {!isOwn && q.profiles?.full_name && (
              <span style={{ fontSize: '11px', color: '#9C8E84' }}>by {q.profiles.full_name}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#BEB5AE' }}>{new Date(q.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', background: q.status === 'Replied' ? '#DCFCE7' : '#F3F4F6', color: q.status === 'Replied' ? '#15803D' : '#6B7280' }}>{q.status}</span>
          </div>
        </div>
        {q.subject && <div style={{ fontSize: '14px', fontWeight: 600, color: '#4A3E35', marginBottom: '6px' }}>{q.subject}</div>}
        <div style={{ fontSize: '14px', color: '#6B5E54', lineHeight: 1.6 }}>{q.message}</div>
      </div>
      {q.reply && (
        <div style={{ borderTop: '1px solid #EDE8E0', padding: '14px 18px', background: '#F7F3EE', display: 'flex', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>👤</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#C4A882', marginBottom: '4px' }}>Schalk</div>
            <div style={{ fontSize: '14px', color: '#4A3E35', lineHeight: 1.6 }}>{q.reply}</div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize: '11px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', flexDirection: 'column', gap: '6px' }
const inp = { background: '#FAFAF8', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '10px 14px', color: '#1A1410', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }

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
