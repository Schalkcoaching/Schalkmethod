import { useState } from 'react'

const POLICIES = {
  terms: {
    title: 'Terms of Use',
    content: `Last updated: April 2026

1. ACCEPTANCE OF TERMS
By accessing or using The Schalk Method app ("the Service"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Service.

2. DESCRIPTION OF SERVICE
The Schalk Method is a health and lifestyle coaching platform that provides nutrition tracking, workout logging, progress monitoring, AI-assisted health guidance, and direct access to coaching services. The Service is operated by Schalk Booysen, based in South Africa.

3. SUBSCRIPTIONS AND BILLING
The Service is offered on a monthly subscription basis:
- TSM App Plan: R200/month with a 7-day free trial
- 1-on-1 Coaching Plan: R1500/month

Subscriptions are billed monthly via Paystack. Your free trial begins on the date you sign up. You will not be charged during the trial period. After your trial ends, your selected plan will be billed automatically unless you cancel beforehand.

4. CANCELLATION
You may cancel your subscription at any time. Upon cancellation, you will retain access to the Service until the end of your current billing period. No partial refunds are issued for unused time within a billing cycle.

5. HEALTH DISCLAIMER
The content provided through The Schalk Method, including AI coaching responses, meal suggestions, workout plans, and any other health information, is for general informational and educational purposes only. It is not intended as, and does not constitute, medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making significant changes to your diet, exercise routine, or health regimen.

6. USER RESPONSIBILITIES
You agree to:
- Provide accurate information when creating your account
- Keep your login credentials secure
- Use the Service only for lawful personal purposes
- Not share your account with others

7. INTELLECTUAL PROPERTY
All content, designs, and materials within the Service are the property of The Schalk Method. You may not copy, reproduce, or distribute any content without prior written permission.

8. LIMITATION OF LIABILITY
To the fullest extent permitted by law, The Schalk Method shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.

9. CHANGES TO TERMS
We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.

10. CONTACT
For questions regarding these Terms, contact us at s_booysen@icloud.com.`,
  },
  privacy: {
    title: 'Privacy Policy',
    content: `Last updated: April 2026

1. INTRODUCTION
The Schalk Method ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.

2. INFORMATION WE COLLECT
We collect the following information when you use our Service:
- Account information: name and email address
- Health and fitness data: nutrition logs, workout records, daily goal completions, and body weight entries you choose to record
- Progress photos: images you upload for your check-in tracking
- AI coach conversations: messages exchanged with the TSM AI Coach
- Payment information: handled entirely by Paystack — we do not store your card details

3. HOW WE USE YOUR INFORMATION
Your data is used solely to:
- Provide and personalise your coaching experience
- Allow your coach to monitor your progress
- Deliver AI-assisted health guidance within the app
- Process subscription payments through Paystack
- Communicate with you about your account

4. DATA STORAGE AND SECURITY
Your data is stored securely using Supabase, a cloud infrastructure provider with industry-standard encryption and security practices. We do not sell, rent, or share your personal information with any third parties for marketing purposes.

5. THIRD-PARTY SERVICES
We use the following third-party services to operate the platform:
- Supabase: secure database and authentication
- Paystack: payment processing
- Anthropic: AI coaching responses (messages are processed but not stored by Anthropic beyond the request)

6. DATA RETENTION
We retain your data for as long as your account is active. If you request account deletion, your personal data will be removed within 30 days, except where retention is required by law.

7. YOUR RIGHTS
You have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your account and associated data
- Withdraw consent for data processing at any time

To exercise any of these rights, contact us at s_booysen@icloud.com.

8. CHILDREN
The Service is not intended for users under the age of 13. We do not knowingly collect data from children.

9. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify users of significant changes via email or in-app notice.

10. CONTACT
For privacy-related questions, contact us at s_booysen@icloud.com.`,
  },
  refund: {
    title: 'Refund Policy',
    content: `Last updated: April 2026

1. FREE TRIAL
The TSM App Plan includes a 7-day free trial. You will not be charged during this period. If you cancel before your trial ends, you will not be billed.

2. SUBSCRIPTION CANCELLATIONS
You may cancel your subscription at any time through your account settings or by contacting us at s_booysen@icloud.com. Upon cancellation:
- You will retain full access to the Service until the end of your current paid billing period
- No further charges will be made
- No refund will be issued for the remaining unused days in your current billing cycle

3. REFUND ELIGIBILITY
Refunds are considered on a case-by-case basis under the following circumstances:
- Technical issues that prevented access to the Service for an extended period, caused by our platform
- Duplicate charges due to a billing error

Refunds are not issued for:
- Change of mind after billing
- Unused time within a billing period
- Failure to cancel before a trial converts to a paid subscription

4. COACHING PLAN
For the 1-on-1 Coaching Plan (R1500/month): if you have a billing dispute, please contact us within 7 days of the charge at s_booysen@icloud.com and we will review your case personally.

5. HOW TO REQUEST A REFUND
To request a refund or raise a billing concern, email s_booysen@icloud.com with your account email address and a description of the issue. We aim to respond within 2 business days.

6. CONTACT
For any refund or billing questions: s_booysen@icloud.com`,
  },
  contact: {
    title: 'Contact Us',
    content: `THE SCHALK METHOD
Health & Lifestyle Coaching

Email: s_booysen@icloud.com
Location: South Africa

RESPONSE TIMES
We aim to respond to all enquiries within 24–48 hours on business days.

BILLING & SUBSCRIPTION SUPPORT
For subscription changes, cancellations, or billing questions, email s_booysen@icloud.com with your account email and we'll sort it out promptly.

COACHING ENQUIRIES
Interested in 1-on-1 coaching? Email s_booysen@icloud.com with your name, goals, and a bit about where you're currently at.

TECHNICAL SUPPORT
If you're experiencing issues with the app, email s_booysen@icloud.com with a description of the problem and your device/browser details.

PAYSTACK PAYMENT SUPPORT
For payment-related issues that require Paystack's direct assistance, visit paystack.com/support.`,
  },
}

function PolicyModal({ policy, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#141210', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid #2C2825' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1E1A17', flexShrink: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#F7F3EE' }}>{policy.title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #2C2825', borderRadius: '8px', padding: '5px 12px', color: '#5C5550', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Close</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '24px', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ fontSize: '13px', color: '#9C8E84', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {policy.content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [openPolicy, setOpenPolicy] = useState(null)

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#0F0D0B', minHeight: '100vh', color: '#F7F3EE' }}>

      {openPolicy && <PolicyModal policy={POLICIES[openPolicy]} onClose={() => setOpenPolicy(null)} />}

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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1 }}>R250</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#5C5550' }}>/ $15</div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B5E54', marginBottom: '24px' }}>per month · 7-day free trial</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['Full app access', 'Nutrition tracking', 'Workout logs', 'Progress photo uploads', 'Daily goal tracking', "Schalk's recipe library"].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#9C8E84' }}>
                    <span style={{ color: '#C4A882', fontSize: '14px', flexShrink: 0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="https://paystack.shop/pay/schalkmethod" target="_blank" rel="noreferrer"
                  style={{ display: 'block', background: '#1E1A17', color: '#C4A882', border: '1px solid #2C2825', borderRadius: '10px', padding: '11px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  Start Free Trial — R250/mo
                </a>
                <a href="https://paystack.shop/pay/schalkmethod-usd" target="_blank" rel="noreferrer"
                  style={{ display: 'block', background: 'transparent', color: '#5C5550', border: '1px solid #2C2825', borderRadius: '10px', padding: '11px', textAlign: 'center', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  Pay in USD — $15/mo
                </a>
              </div>
            </div>

            {/* Coaching plan */}
            <div style={{ background: '#1A1208', border: '1px solid #3D2E1A', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#C4A882', color: '#0F0D0B', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Most Popular</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#C4A882', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>1-on-1 Coaching</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#F7F3EE', lineHeight: 1 }}>R1750</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#5C5550' }}>/ $100</div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B5E54', marginBottom: '24px' }}>per month · personalised</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {['Everything in the App', 'Weekly video check-ins', 'Personalised meal plan', 'Custom workout programme', 'Direct coach messaging', 'Full accountability support'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#BEB5AE' }}>
                    <span style={{ color: '#C4A882', fontSize: '14px', flexShrink: 0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="https://paystack.shop/pay/theschalkmethod" target="_blank" rel="noreferrer"
                  style={{ display: 'block', background: '#C4A882', color: '#0F0D0B', border: 'none', borderRadius: '10px', padding: '11px', textAlign: 'center', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>
                  Apply for Coaching — R1750/mo
                </a>
                <a href="https://paystack.shop/pay/theschalkmethod-usd" target="_blank" rel="noreferrer"
                  style={{ display: 'block', background: 'transparent', color: '#C4A882', border: '1px solid #3D2E1A', borderRadius: '10px', padding: '11px', textAlign: 'center', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  Pay in USD — $100/mo
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid #1E1A17' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#5C5550', marginBottom: '4px' }}>The Schalk Method</div>
              <div style={{ fontSize: '11px', color: '#2C2825' }}>Health coaching · South Africa</div>
              <a href="mailto:s_booysen@icloud.com" style={{ fontSize: '11px', color: '#3D3530', textDecoration: 'none', display: 'block', marginTop: '6px' }}>s_booysen@icloud.com</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              {[
                { key: 'terms', label: 'Terms of Use' },
                { key: 'privacy', label: 'Privacy Policy' },
                { key: 'refund', label: 'Refund Policy' },
                { key: 'contact', label: 'Contact Us' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setOpenPolicy(key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#3D3530', textDecoration: 'underline', padding: 0 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E1A17', paddingTop: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#2C2825' }}>
              © {new Date().getFullYear()} The Schalk Method. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
