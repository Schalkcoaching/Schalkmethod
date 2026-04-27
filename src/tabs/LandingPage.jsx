export default function LandingPage({ onGetStarted, onSignIn }) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#0F0D0B', minHeight: '100vh', color: '#F7F3EE' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #1E1A17', position: 'sticky', top: 0, background: '#0F0D0B', zIndex: 50 }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#F7F3EE', letterSpacing: '-0.3px' }}>The Schalk Method</div>
          <div style={{ fontSize: '9px', color: '#C4A882', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1px' }}>Health Coaching</div>
        </div>
        <button
          onClick={onSignIn}
          style={{ background: 'transparent', border: '1px solid #2C2825', borderRadius: '8px', padding: '8px 18px', color: '#BEB5AE', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: '72px 24px 64px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(196,168,130,0.12)', border: '1px solid rgba(196,168,130,0.25)', borderRadius: '99px', padding: '5px 16px', fontSize: '11px', fontWeight: 700, color: '#C4A882', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '28px' }}>
          Animal-Based · Faith-Driven · Results-Focused
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1px' }}>
          Take control of your<br />
          <span style={{ color: '#C4A882' }}>health for good.</span>
        </h1>
        <p style={{ fontSize: '16px', color: '#9C8E84', lineHeight: 1.7, margin: '0 0 40px' }}>
          The Schalk Method is a 1-on-1 health coaching programme built around real food, consistent habits, and personalised guidance — so you can look and feel your best, sustainably.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onGetStarted}
            style={{ background: '#C4A882', color: '#0F0D0B', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.2px' }}
          >
            Get Started
          </button>
          <a
            href="mailto:s_booysen@icloud.com?subject=Enquiry: The Schalk Method"
            style={{ background: 'transparent', color: '#BEB5AE', border: '1px solid #2C2825', borderRadius: '12px', padding: '14px 32px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
          >
            Ask a Question
          </a>
        </div>
      </section>

      {/* What's included */}
      <section style={{ padding: '64px 24px', background: '#0A0907' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F7F3EE', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Everything you need, in one app</h2>
            <p style={{ fontSize: '14px', color: '#6B5E54', margin: 0, lineHeight: 1.6 }}>Track your progress, follow your plan, and stay connected to your coach — all from your phone.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {[
              { icon: '🥩', title: 'Nutrition Tracking', desc: 'Log meals with an animal-based food library built specifically for the TSM approach.' },
              { icon: '💪', title: 'Workout Logs', desc: 'Follow your personalised programme and track every session as you go.' },
              { icon: '📸', title: 'Progress Photos', desc: 'Upload weekly check-in photos to see your transformation side by side.' },
              { icon: '✅', title: 'Daily Goals', desc: 'Build the habits that matter — tracked daily, every single day.' },
              { icon: '💬', title: 'Ask Your Coach', desc: 'Message Schalk directly with questions and get honest, no-fluff answers.' },
              { icon: '📹', title: 'Video Sessions', desc: 'Book and join your weekly 1-on-1 check-in calls directly in the app.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#141210', border: '1px solid #1E1A17', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{f.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#F7F3EE', marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: '#6B5E54', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Schalk */}
      <section style={{ padding: '64px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#C4A882', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>S</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F7F3EE', margin: '0 0 16px', letterSpacing: '-0.3px' }}>About Schalk</h2>
        <p style={{ fontSize: '14px', color: '#9C8E84', lineHeight: 1.8, margin: '0 0 16px' }}>
          I'm Schalk, a health coach based in South Africa. I went from struggling with my own health to competing and thriving on an animal-based diet. Now I help others do the same — no crash diets, no nonsense, just real results built on real food and consistency.
        </p>
        <p style={{ fontSize: '14px', color: '#9C8E84', lineHeight: 1.8, margin: 0 }}>
          My approach is grounded in faith, personal accountability, and the science of ancestral nutrition. Every client gets a personalised plan, not a template.
        </p>
      </section>

      {/* Pricing */}
      <section style={{ padding: '64px 24px', background: '#0A0907' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F7F3EE', margin: '0 0 12px', letterSpacing: '-0.5px' }}>Simple pricing</h2>
            <p style={{ fontSize: '14px', color: '#6B5E54', margin: 0 }}>Start with the app or go all-in with full coaching.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>

            {/* App plan */}
            <div style={{ background: '#141210', border: '1px solid #1E1A17', borderRadius: '20px', padding: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B5E54', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>TSM App</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1, marginBottom: '4px' }}>R200</div>
              <div style={{ fontSize: '12px', color: '#6B5E54', marginBottom: '24px' }}>per month · 7-day free trial</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['Full app access', 'Nutrition tracking', 'Workout logs', 'Progress photo uploads', 'Daily goal tracking', 'Schalk\'s recipe library'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#9C8E84' }}>
                    <span style={{ color: '#C4A882', fontSize: '14px', flexShrink: 0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <a
                href="https://paystack.shop/pay/schalkmethod"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', background: '#1E1A17', color: '#C4A882', border: '1px solid #2C2825', borderRadius: '10px', padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
              >
                Start Free Trial
              </a>
            </div>

            {/* Coaching plan */}
            <div style={{ background: '#1A1208', border: '1px solid #3D2E1A', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#C4A882', color: '#0F0D0B', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Most Popular</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#C4A882', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>1-on-1 Coaching</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1, marginBottom: '4px' }}>R1500</div>
              <div style={{ fontSize: '12px', color: '#6B5E54', marginBottom: '24px' }}>per month · personalised</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['Everything in the App', 'Weekly video check-ins', 'Personalised meal plan', 'Custom workout programme', 'Direct coach messaging', 'Full accountability support'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#BEB5AE' }}>
                    <span style={{ color: '#C4A882', fontSize: '14px', flexShrink: 0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <a
                href="https://paystack.shop/pay/theschalkmethod"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', background: '#C4A882', color: '#0F0D0B', border: 'none', borderRadius: '10px', padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}
              >
                Apply for Coaching
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid #1E1A17', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#3D3530', marginBottom: '6px' }}>The Schalk Method</div>
        <div style={{ fontSize: '11px', color: '#2C2825' }}>Health coaching · South Africa</div>
        <a href="mailto:s_booysen@icloud.com" style={{ fontSize: '11px', color: '#3D3530', textDecoration: 'none', display: 'block', marginTop: '8px' }}>s_booysen@icloud.com</a>
      </footer>

    </div>
  )
}
