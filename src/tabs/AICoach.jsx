import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const STARTERS = [
  'What should I eat for breakfast?',
  'Is oats okay on the Schalk Method?',
  'How much beef liver should I eat daily?',
  'What are the best foods for building muscle?',
  'Can I drink milk on this programme?',
  'What do I eat post-workout?',
]

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '14px 16px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%', background: '#C4A882',
          animation: 'tsm-bounce 1.2s infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes tsm-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function AICoach({ user, mobile }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    setInput('')
    setError('')
    const userMsg = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-coach', {
        body: { messages: nextMessages },
      })

      if (fnError || data?.error) throw new Error(fnError?.message || data?.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError('Something went wrong. Try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: mobile ? 'calc(100vh - 104px)' : 'calc(100vh - 48px)',
      background: '#F7F3EE', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ background: '#1C1917', padding: mobile ? '16px 18px' : '20px 32px', flexShrink: 0, borderBottom: '1px solid #2C2825' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: 'rgba(196,168,130,0.15)', border: '1px solid rgba(196,168,130,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🤖</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F7F3EE' }}>TSM AI Coach</div>
            <div style={{ fontSize: '11px', color: '#C4A882', marginTop: '1px' }}>Powered by The Schalk Method</div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setError('') }}
              style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #2C2825', borderRadius: '8px', padding: '5px 12px', color: '#5C5550', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: mobile ? '16px 14px' : '24px 32px', WebkitOverflowScrolling: 'touch' }}>

        {/* Empty state */}
        {isEmpty && (
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
              <h2 style={{ fontSize: mobile ? '18px' : '22px', fontWeight: 800, color: '#1A1410', margin: '0 0 8px' }}>Ask your AI Coach</h2>
              <p style={{ fontSize: '13px', color: '#9C8E84', lineHeight: 1.6, margin: 0 }}>
                Get instant answers on food, nutrition, workouts and anything related to The Schalk Method.
              </p>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Try asking...</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {STARTERS.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px', padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#3D3530', cursor: 'pointer', fontWeight: 500, transition: 'border-color 0.15s' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message list */}
        {!isEmpty && (
          <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '28px', height: '28px', background: '#1C1917', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? '#1C1917' : '#FFFFFF',
                  color: msg.role === 'user' ? '#F7F3EE' : '#1A1410',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  border: msg.role === 'assistant' ? '1px solid #EDE8E0' : 'none',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', background: '#1C1917', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>🤖</div>
                <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '18px 18px 18px 4px' }}>
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px' }}>
                {error}
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: '#FFFFFF', borderTop: '1px solid #EDE8E0', padding: mobile ? '10px 14px' : '14px 32px', flexShrink: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={handleKey}
            placeholder="Ask anything about food, nutrition, workouts..."
            rows={1}
            style={{
              flex: 1, resize: 'none', border: '1px solid #EDE8E0', borderRadius: '14px',
              padding: '12px 16px', fontSize: '14px', color: '#1A1410', background: '#F7F3EE',
              outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
              maxHeight: '120px', overflowY: 'auto',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: '42px', height: '42px', borderRadius: '50%', border: 'none',
              background: !input.trim() || loading ? '#EDE8E0' : '#1C1917',
              color: !input.trim() || loading ? '#BEB5AE' : '#F7F3EE',
              fontSize: '16px', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            ↑
          </button>
        </div>
        <div style={{ maxWidth: '640px', margin: '6px auto 0', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#BEB5AE' }}>AI can make mistakes — use your own judgment</span>
        </div>
      </div>

    </div>
  )
}
