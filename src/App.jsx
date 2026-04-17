import { useState, useEffect } from 'react'
import { supabase, isCoach } from './lib/supabase'
import AuthScreen from './tabs/AuthScreen'
import Home from './tabs/Home'
import Progress from './tabs/Progress'
import DailyGoals from './tabs/DailyGoals'
import Nutrition from './tabs/Nutrition'
import VideoCall from './tabs/VideoCall'
import Workout from './tabs/Workout'
import QA from './tabs/QA'
import CoachDashboard from './tabs/CoachDashboard'
import Recipes from './tabs/Recipes'
import Paywall from './tabs/Paywall'

function needsPaywall(profile) {
  if (!profile) return false
  const status = profile.subscription_status
  if (!status) return false                          // no column yet — let them in
  if (status === 'active' || status === 'grandfathered' || status === 'cancelled') return false
  if (status === 'trial') {
    const ends = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    if (!ends) return false
    return new Date() > ends                         // trial expired
  }
  return status === 'expired' || status === 'inactive'
}

const clientTabs = [
  { id: 'home',      label: 'Home',        icon: '🏠' },
  { id: 'progress',  label: 'Progress',    icon: '📸' },
  { id: 'goals',     label: 'Goals',       icon: '✅' },
  { id: 'nutrition', label: 'Nutrition',   icon: '🥗' },
  { id: 'recipes',   label: 'Recipes',     icon: '👨‍🍳' },
  { id: 'workout',   label: 'Workout',     icon: '💪' },
  { id: 'video',     label: 'Sessions',    icon: '📹' },
  { id: 'qa',        label: 'Ask Coach',   icon: '💬' },
]

const coachTabs = [
  ...clientTabs,
  { id: 'dashboard', label: 'Dashboard',   icon: '📊' },
]

function CoachingUpsell({ user, mobile }) {
  const p = mobile ? '32px 24px' : '60px 48px'
  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: p }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ fontSize: mobile ? '22px' : '26px', fontWeight: 800, color: '#1A1410', marginBottom: '12px', lineHeight: 1.2 }}>
          1-on-1 Coaching with Schalk
        </h2>
        <p style={{ fontSize: '14px', color: '#6B5E54', lineHeight: 1.7, marginBottom: '32px' }}>
          Session booking is exclusive to coaching clients. Work directly with Schalk to get a personalised programme, weekly check-ins, and real accountability.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <a
            href="https://schalkcoaching.lemonsqueezy.com/checkout/buy/c3cf6707-7224-4081-a28d-d11e88cf2ce7"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', width: '100%', maxWidth: '320px', background: '#1C1917', color: '#F7F3EE', borderRadius: '12px', padding: '14px 24px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
          >
            Upgrade to Coaching — R1500/mo
          </a>
          <a
            href={`mailto:s_booysen@icloud.com?subject=Enquiry: 1-on-1 Coaching&body=Hi Schalk,%0A%0AI'm interested in your 1-on-1 coaching programme.%0A%0AMy name: %0AMy goals: `}
            style={{ display: 'block', width: '100%', maxWidth: '320px', background: '#FFFFFF', color: '#1A1410', border: '1px solid #EDE8E0', borderRadius: '12px', padding: '14px 24px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
          >
            Email Schalk to Enquire
          </a>
        </div>
        <p style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '24px' }}>
          Already a coaching client? Contact Schalk to get your account upgraded.
        </p>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data || null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && localStorage.getItem('tsm_keep_signed_in') === 'false' && !sessionStorage.getItem('tsm_session_active')) {
        await supabase.auth.signOut()
        setUser(null)
      } else {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setActiveTab('home')
  }

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F7F3EE' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1A1410', marginBottom: '8px' }}>The Schalk Method</div>
          <div style={{ fontSize: '13px', color: '#9C8E84' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />
  }

  const coach = isCoach(user)

  // Show paywall for non-coach users whose trial/subscription has expired
  if (!coach && needsPaywall(profile)) {
    return <Paywall user={user} profile={profile} mobile={windowWidth < 768} />
  }

  // Trial countdown banner state (shown inside app while trial is still active)
  const trialDaysLeft = (() => {
    if (!profile?.trial_ends_at || profile?.subscription_status !== 'trial') return null
    const diff = new Date(profile.trial_ends_at) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : null
  })()
  const tabs = coach ? coachTabs : clientTabs
  const isMobile = windowWidth < 768
  const hasCoachingAccess = coach || ['coaching', 'grandfathered', 'coach'].includes(profile?.subscription_tier)

  const renderTab = () => {
    switch (activeTab) {
      case 'home':      return <Home setActiveTab={setActiveTab} user={user} mobile={isMobile} />
      case 'progress':  return <Progress user={user} mobile={isMobile} />
      case 'goals':     return <DailyGoals user={user} mobile={isMobile} />
      case 'nutrition': return <Nutrition user={user} mobile={isMobile} />
      case 'recipes':   return <Recipes user={user} mobile={isMobile} />
      case 'video':     return hasCoachingAccess ? <VideoCall user={user} mobile={isMobile} /> : <CoachingUpsell user={user} mobile={isMobile} />
      case 'workout':   return <Workout user={user} mobile={isMobile} />
      case 'qa':        return <QA user={user} mobile={isMobile} />
      case 'dashboard': return coach ? <CoachDashboard coach={user} mobile={isMobile} /> : <Home setActiveTab={setActiveTab} user={user} mobile={isMobile} />
      default:          return <Home setActiveTab={setActiveTab} user={user} mobile={isMobile} />
    }
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F7F3EE', overflow: 'hidden' }}>
        {/* Safe area top + header */}
        <div style={{ background: '#1C1917', flexShrink: 0 }}>
          <div style={{ height: 'env(safe-area-inset-top)' }} />
          <div style={{
            height: '48px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', paddingLeft: '18px', paddingRight: '14px',
            borderBottom: '1px solid #2C2825',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F7F3EE', letterSpacing: '-0.2px' }}>The Schalk Method</div>
              {coach && <div style={{ fontSize: '9px', color: '#C4A882', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '1px' }}>Coach Portal</div>}
            </div>
            <button onClick={handleSignOut} style={{
              background: 'transparent', border: '1px solid #333', borderRadius: '6px',
              padding: '5px 11px', color: '#5C5550', fontSize: '11px', cursor: 'pointer',
            }}>Sign out</button>
          </div>
        </div>

        {/* Trial banner */}
        {trialDaysLeft && (
          <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400E' }}>⏳ {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left on your free trial</span>
            <a href={`https://schalkcoaching.lemonsqueezy.com/checkout/buy/740670e6-c268-4f1f-b454-4757e271e9a8?checkout[email]=${encodeURIComponent(user.email)}&checkout[custom][user_id]=${user.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textDecoration: 'underline' }}>Subscribe</a>
          </div>
        )}

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F7F3EE', WebkitOverflowScrolling: 'touch' }}>
          {renderTab()}
        </main>

        {/* Bottom nav */}
        <div style={{ background: '#1C1917', borderTop: '1px solid #2C2825', flexShrink: 0 }}>
          <nav style={{
            height: '56px', display: 'flex',
            overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          }}>
            {tabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: '1 0 auto', minWidth: '52px', maxWidth: '80px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '2px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    padding: '0 4px',
                    color: active ? '#C4A882' : '#5C5550',
                    borderTop: active ? '2px solid #C4A882' : '2px solid transparent',
                  }}
                >
                  <span style={{ fontSize: '17px' }}>{tab.icon}</span>
                  <span style={{ fontSize: '8px', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{tab.label}</span>
                </button>
              )
            })}
          </nav>
          <div style={{ height: 'env(safe-area-inset-bottom)', background: '#1C1917' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F7F3EE', overflow: 'hidden' }}>
      {/* Sidebar */}
      <nav style={{
        width: '230px', minWidth: '230px',
        background: '#1C1917', borderRight: '1px solid #2C2825',
        display: 'flex', flexDirection: 'column', padding: '28px 0',
      }}>
        <div style={{ padding: '0 22px 24px', borderBottom: '1px solid #2C2825', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#F7F3EE', letterSpacing: '-0.3px', lineHeight: 1.25 }}>
            The Schalk Method
          </div>
          <div style={{ fontSize: '10px', color: '#5C5550', marginTop: '5px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {coach ? 'Coach Portal' : 'Lifestyle Coaching'}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', margin: '0 10px', borderRadius: '10px',
                  border: 'none', cursor: 'pointer', fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(196,168,130,0.15)' : 'transparent',
                  color: active ? '#E8D5B8' : '#5C5550', textAlign: 'left',
                  transition: 'all 0.15s',
                  borderLeft: active ? '2px solid #C4A882' : '2px solid transparent',
                }}
              >
                <span style={{ fontSize: '15px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ padding: '16px 22px', borderTop: '1px solid #2C2825' }}>
          <div style={{ fontSize: '11px', color: '#5C5550', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
          {coach && (
            <div style={{ fontSize: '10px', color: '#C4A882', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
              Coach
            </div>
          )}
          <button onClick={handleSignOut} style={{
            background: 'transparent', border: '1px solid #2C2825', borderRadius: '8px',
            padding: '6px 12px', color: '#5C5550', fontSize: '11px', cursor: 'pointer', width: '100%',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {trialDaysLeft && (
          <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '7px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>⏳ {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left on your free trial</span>
            <a href={`https://schalkcoaching.lemonsqueezy.com/checkout/buy/740670e6-c268-4f1f-b454-4757e271e9a8?checkout[email]=${encodeURIComponent(user.email)}&checkout[custom][user_id]=${user.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', textDecoration: 'underline' }}>Subscribe now →</a>
          </div>
        )}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F7F3EE' }}>
          {renderTab()}
        </main>
      </div>
    </div>
  )
}

export default App
