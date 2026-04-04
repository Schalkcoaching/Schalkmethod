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

const clientTabs = [
  { id: 'home',      label: 'Home',        icon: '🏠' },
  { id: 'progress',  label: 'Progress',    icon: '📸' },
  { id: 'goals',     label: 'Goals',       icon: '✅' },
  { id: 'nutrition', label: 'Nutrition',   icon: '🥗' },
  { id: 'workout',   label: 'Workout',     icon: '💪' },
  { id: 'video',     label: 'Sessions',    icon: '📹' },
  { id: 'qa',        label: 'Ask Coach',   icon: '💬' },
]

const coachTabs = [
  ...clientTabs,
  { id: 'dashboard', label: 'Dashboard',   icon: '📊' },
]

function App() {
  const [user, setUser] = useState(undefined)
  const [activeTab, setActiveTab] = useState('home')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
  const tabs = coach ? coachTabs : clientTabs
  const isMobile = windowWidth < 768

  const renderTab = () => {
    switch (activeTab) {
      case 'home':      return <Home setActiveTab={setActiveTab} user={user} mobile={isMobile} />
      case 'progress':  return <Progress user={user} mobile={isMobile} />
      case 'goals':     return <DailyGoals user={user} mobile={isMobile} />
      case 'nutrition': return <Nutrition user={user} mobile={isMobile} />
      case 'video':     return <VideoCall user={user} mobile={isMobile} />
      case 'workout':   return <Workout user={user} mobile={isMobile} />
      case 'qa':        return <QA user={user} mobile={isMobile} />
      case 'dashboard': return coach ? <CoachDashboard coach={user} mobile={isMobile} /> : <Home setActiveTab={setActiveTab} user={user} mobile={isMobile} />
      default:          return <Home setActiveTab={setActiveTab} user={user} mobile={isMobile} />
    }
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F7F3EE', overflow: 'hidden' }}>
        {/* Mobile top bar */}
        <div style={{
          height: '52px', minHeight: '52px',
          background: '#1C1917', borderBottom: '1px solid #2C2825',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#F7F3EE' }}>The Schalk Method</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {coach && <div style={{ fontSize: '10px', color: '#C4A882', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Coach</div>}
            <button onClick={handleSignOut} style={{
              background: 'transparent', border: '1px solid #2C2825', borderRadius: '6px',
              padding: '4px 10px', color: '#5C5550', fontSize: '11px', cursor: 'pointer',
            }}>Sign out</button>
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F7F3EE' }}>
          {renderTab()}
        </main>

        {/* Bottom nav */}
        <nav style={{
          height: '60px', minHeight: '60px',
          background: '#1C1917', borderTop: '1px solid #2C2825',
          display: 'flex', overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: '0 0 auto', minWidth: '58px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '2px',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  padding: '4px 8px',
                  color: active ? '#C4A882' : '#5C5550',
                  borderTop: active ? '2px solid #C4A882' : '2px solid transparent',
                }}
              >
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                <span style={{ fontSize: '8px', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{tab.label}</span>
              </button>
            )
          })}
        </nav>
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
      <main style={{ flex: 1, overflowY: 'auto', height: '100vh', background: '#F7F3EE' }}>
        {renderTab()}
      </main>
    </div>
  )
}

export default App
