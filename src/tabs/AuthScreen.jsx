import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isMobile = window.innerWidth < 768

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill in all fields.')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError(err.message)
  }

  const handleSignup = async () => {
    if (!email || !password || !name) return setError('Please fill in all fields.')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, role: 'client' } },
    })
    setLoading(false)
    if (err) setError(err.message)
    else setSuccess('Check your email to confirm your account, then log in.')
  }

  const handleForgot = async () => {
    if (!email) return setError('Enter your email address.')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (err) setError(err.message)
    else setSuccess('Reset link sent — check your inbox.')
  }

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F3EE', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top branding bar */}
        <div style={{ background: '#1C1917', padding: '28px 24px 24px' }}>
          <div style={{ fontSize: '10px', color: '#5C5550', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>Welcome to</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1.1 }}>The Schalk Method</div>
          <div style={{ width: '32px', height: '3px', background: '#C4A882', borderRadius: '99px', marginTop: '10px' }} />
        </div>

        {/* Mobile form */}
        <div style={{ flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410', marginBottom: '4px' }}>
            {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </h2>
          <p style={{ fontSize: '13px', color: '#9C8E84', marginBottom: '24px' }}>
            {mode === 'login' ? 'Enter your credentials to continue.' :
             mode === 'signup' ? 'Sign up with your invite link or below.' :
             "We'll send you a password reset link."}
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#F0FAF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#166534' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <label style={lbl}>
                Full Name
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inp} />
              </label>
            )}
            <label style={lbl}>
              Email Address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} autoComplete="email" />
            </label>
            {mode !== 'forgot' && (
              <label style={lbl}>
                Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} autoComplete="current-password" />
              </label>
            )}
            <button
              onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot}
              disabled={loading}
              style={{ background: '#1C1917', border: 'none', borderRadius: '12px', padding: '16px', color: '#F7F3EE', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : mode === 'signup' ? 'Create Account →' : 'Send Reset Link →'}
            </button>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            {mode !== 'login' && (
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={linkBtn}>Already have an account? Sign in</button>
            )}
            {mode !== 'signup' && (
              <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} style={linkBtn}>New client? Create account</button>
            )}
            {mode !== 'forgot' && (
              <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={linkBtn}>Forgot password?</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F3EE' }}>
      {/* Left panel — dark branding */}
      <div style={{ width: '420px', minWidth: '420px', background: '#1C1917', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', color: '#5C5550', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Welcome to</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1.15, marginBottom: '16px' }}>The Schalk<br />Method</div>
          <div style={{ width: '40px', height: '3px', background: '#C4A882', borderRadius: '99px', marginBottom: '24px' }} />
          <div style={{ fontSize: '14px', color: '#5C5550', lineHeight: 1.7 }}>
            Your personal lifestyle coaching platform. Track nutrition, workouts, progress, and stay connected with your coach.
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2C2825', paddingTop: '24px' }}>
          {['Micronutrient tracking', 'Weekly progress photos', 'Direct coach messaging', 'Personalised workout plans'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C4A882', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#5C5550' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1410', marginBottom: '6px' }}>
            {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </h2>
          <p style={{ fontSize: '14px', color: '#9C8E84', marginBottom: '32px' }}>
            {mode === 'login' ? 'Enter your credentials to access your dashboard.' :
             mode === 'signup' ? "You'll receive an invite link from your coach, or sign up below." :
             "We'll send you a link to reset your password."}
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#F0FAF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#166534' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <label style={lbl}>
                Full Name
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inp} />
              </label>
            )}
            <label style={lbl}>
              Email Address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} />
            </label>
            {mode !== 'forgot' && (
              <label style={lbl}>
                Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} />
              </label>
            )}
            <button
              onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot}
              disabled={loading}
              style={{ background: '#1C1917', border: 'none', borderRadius: '10px', padding: '14px', color: '#F7F3EE', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : mode === 'signup' ? 'Create Account →' : 'Send Reset Link →'}
            </button>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            {mode !== 'login' && (
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={linkBtn}>Already have an account? Sign in</button>
            )}
            {mode !== 'signup' && (
              <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} style={linkBtn}>New client? Create account</button>
            )}
            {mode !== 'forgot' && (
              <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={linkBtn}>Forgot password?</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', flexDirection: 'column', gap: '6px' }
const inp = { background: '#FAFAF8', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '11px 14px', color: '#1A1410', fontSize: '14px', outline: 'none', width: '100%' }
const linkBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#9C8E84', textDecoration: 'underline' }
