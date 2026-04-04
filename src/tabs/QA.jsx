import { useState } from 'react'

const QA_KEY = 'coachpro_questions'

const categories = ['General', 'Nutrition', 'Training', 'Recovery', 'Mindset', 'Other']

function loadQuestions() {
  try { return JSON.parse(localStorage.getItem(QA_KEY) || '[]') } catch { return [] }
}

const sampleReplies = [
  "Great question! I'll review this and get back to you within 24 hours.",
  "Thanks for sharing this — let's address it in our next session.",
  "I've noted this down. Make sure to also log how you're feeling in your daily goals!",
]

export default function QA({ mobile }) {
  const [questions, setQuestions] = useState(loadQuestions)
  const [form, setForm] = useState({ category: 'General', subject: '', message: '', urgent: false })
  const [sent, setSent] = useState(false)
  const [filter, setFilter] = useState('All')

  const handleSubmit = () => {
    if (!form.message.trim()) return
    const q = {
      id: Date.now(),
      ...form,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Sent',
      reply: null,
    }
    const updated = [q, ...questions]
    setQuestions(updated)
    localStorage.setItem(QA_KEY, JSON.stringify(updated))
    setForm({ category: 'General', subject: '', message: '', urgent: false })
    setSent(true)
    setTimeout(() => setSent(false), 3000)

    // Simulate a reply for demo purposes
    setTimeout(() => {
      const withReply = updated.map((item, i) =>
        i === 0 ? { ...item, status: 'Replied', reply: sampleReplies[Math.floor(Math.random() * sampleReplies.length)] } : item
      )
      setQuestions(withReply)
      localStorage.setItem(QA_KEY, JSON.stringify(withReply))
    }, 5000)
  }

  const filtered = filter === 'All' ? questions : questions.filter(q => q.status === filter)

  return (
    <div style={{ padding: mobile ? '16px 14px 20px' : '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="💬" title="Ask Your Coach" sub="Leave questions, concerns, or updates — your coach will respond" />

      {sent && (
        <div style={{ background: '#F5F0FF', border: '1px solid #DDD6FE', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', fontSize: '14px', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>✓</span> Message sent! Your coach will respond within 24 hours.
        </div>
      )}

      {/* Message composer */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1410', marginBottom: '20px' }}>New Message</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
          <label style={lbl}>
            Category
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inp}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label style={lbl}>
            Subject (optional)
            <input
              type="text"
              placeholder="What's this about?"
              value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              style={inp}
            />
          </label>
        </div>

        <label style={{ ...lbl, marginBottom: '14px' }}>
          Your Message
          <textarea
            placeholder="Type your question, concern, or update here. Be as detailed as you like — the more context, the better I can help you..."
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            rows={5}
            style={{ ...inp, resize: 'vertical' }}
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#6B5E54' }}>
            <input
              type="checkbox"
              checked={form.urgent}
              onChange={e => setForm(p => ({ ...p, urgent: e.target.checked }))}
              style={{ width: '16px', height: '16px', accentColor: '#ec4899' }}
            />
            🚨 Mark as urgent
          </label>
          <button
            onClick={handleSubmit}
            disabled={!form.message.trim()}
            style={{
              background: '#1C1917',
              border: 'none', borderRadius: '10px', padding: '12px 26px',
              color: '#F7F3EE', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              opacity: form.message.trim() ? 1 : 0.4,
            }}
          >
            Send Message →
          </button>
        </div>
      </div>

      {/* Messages list */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Message History
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Sent', 'Replied'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                background: filter === f ? 'rgba(124,92,58,0.15)' : '#F7F3EE',
                color: filter === f ? '#7C5C3A' : '#9C8E84',
                fontSize: '12px', fontWeight: filter === f ? 600 : 400,
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>
            No messages yet. Send your first message above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map(q => (
              <div key={q.id} style={{ background: '#FAFAF8', border: '1px solid #EDE8E0', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Your message */}
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        background: '#EDE9FE', color: '#7C3AED',
                        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
                      }}>{q.category}</span>
                      {q.urgent && <span style={{ background: '#FCE7F3', color: '#BE185D', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px' }}>🚨 URGENT</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#BEB5AE' }}>{q.date}</span>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
                        background: q.status === 'Replied' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                        color: q.status === 'Replied' ? '#86efac' : '#666',
                      }}>{q.status}</span>
                    </div>
                  </div>
                  {q.subject && <div style={{ fontSize: '14px', fontWeight: 600, color: '#4A3E35', marginBottom: '6px' }}>{q.subject}</div>}
                  <div style={{ fontSize: '14px', color: '#9C8E84', lineHeight: 1.6 }}>{q.message}</div>
                </div>

                {/* Coach reply */}
                {q.reply && (
                  <div style={{ borderTop: '1px solid #EDE8E0', padding: '16px 18px', background: '#FAFAF8' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>👤</div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', marginBottom: '4px' }}>Your Coach</div>
                        <div style={{ fontSize: '14px', color: '#4A3E35', lineHeight: 1.6 }}>{q.reply}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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
