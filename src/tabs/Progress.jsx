import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Resize image to max 800px wide before saving to keep DB size small
async function resizeImage(dataUrl, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = dataUrl
  })
}

function daysBetween(dateA, dateB) {
  return Math.floor((new Date(dateA) - new Date(dateB)) / 86400000)
}
function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Progress({ user, mobile }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [weight, setWeight] = useState('')
  const [frontPreview, setFrontPreview] = useState(null)
  const [sidePreview, setSidePreview] = useState(null)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('upload') // 'upload' | 'history'

  useEffect(() => { loadPhotos() }, [user])

  const loadPhotos = async () => {
    setLoading(true)
    if (user) {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setPhotos(data || [])
    } else {
      try { setPhotos(JSON.parse(localStorage.getItem('coachpro_progress_v2') || '[]')) }
      catch { setPhotos([]) }
    }
    setLoading(false)
  }

  const handleFile = (setter) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setter(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!frontPreview && !sidePreview) return
    setSaving(true)
    const dateLabel = new Date().toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

    if (user) {
      // Resize before saving to keep row size small (~50-100KB per photo)
      const front_url = frontPreview ? await resizeImage(frontPreview) : null
      const side_url  = sidePreview  ? await resizeImage(sidePreview)  : null

      const { data, error } = await supabase.from('progress_photos').insert({
        user_id: user.id,
        date: dateLabel,
        front_url,
        side_url,
        weight: weight || null,
        note: note || null,
      }).select().single()

      if (error) console.error('Photo save failed:', error.message)
      if (!error && data) setPhotos(prev => [data, ...prev])
    } else {
      const entry = { id: Date.now(), date: dateLabel, created_at: new Date().toISOString(), frontPhoto: frontPreview, sidePhoto: sidePreview, note, weight }
      const updated = [entry, ...photos]
      setPhotos(updated)
      localStorage.setItem('coachpro_progress_v2', JSON.stringify(updated))
    }

    setFrontPreview(null); setSidePreview(null); setNote(''); setWeight('')
    setSaving(false)
    setView('history')
  }

  const p = mobile ? '16px 14px 20px' : '40px'

  // Weekly lock logic
  const lastPhoto = photos[0]
  const daysSinceLast = lastPhoto?.created_at
    ? Math.floor((Date.now() - new Date(lastPhoto.created_at).getTime()) / 86400000)
    : null
  const isLocked = daysSinceLast !== null && daysSinceLast < 7
  const nextDate = lastPhoto?.created_at ? addDays(lastPhoto.created_at, 7) : null
  const daysLeft = isLocked ? 7 - daysSinceLast : 0

  // Normalise photo fields (DB vs localStorage fallback)
  const norm = (ph) => ({
    ...ph,
    frontPhoto: ph.front_url || ph.frontPhoto || null,
    sidePhoto:  ph.side_url  || ph.sidePhoto  || null,
  })

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="📸" title="Physique Progress" sub="Track your transformation week by week" />

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: '6px', background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '12px', padding: '5px', marginBottom: '20px' }}>
        {[['upload', '📤 This Week'], ['history', `🗂️ History (${photos.length})`]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: view === v ? 700 : 500, background: view === v ? '#1C1917' : 'transparent', color: view === v ? '#F7F3EE' : '#9C8E84', transition: 'all 0.15s', touchAction: 'manipulation' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Upload / This Week view ── */}
      {view === 'upload' && (
        isLocked ? (
          // Locked state
          <div style={card}>
            <div style={{ textAlign: 'center', padding: mobile ? '24px 16px' : '36px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1410', marginBottom: '10px' }}>Submission Locked</h3>
              <p style={{ fontSize: '14px', color: '#7C5C3A', marginBottom: '20px', lineHeight: 1.6 }}>
                You already submitted this week's progress photos.<br />
                <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> until your next submission.
              </p>
              <div style={{ background: '#F7F3EE', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Next submission unlocks</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>{nextDate ? fmtDate(nextDate) : '—'}</div>
              </div>
              {/* Show last submission preview */}
              {lastPhoto && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {norm(lastPhoto).frontPhoto && (
                    <div style={{ position: 'relative', flex: 1, maxWidth: '180px' }}>
                      <img src={norm(lastPhoto).frontPhoto} alt="front" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', opacity: 0.85 }} />
                      <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>FRONT</div>
                    </div>
                  )}
                  {norm(lastPhoto).sidePhoto && (
                    <div style={{ position: 'relative', flex: 1, maxWidth: '180px' }}>
                      <img src={norm(lastPhoto).sidePhoto} alt="side" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', opacity: 0.85 }} />
                      <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>SIDE</div>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => setView('history')} style={{ marginTop: '18px', background: '#1C1917', border: 'none', borderRadius: '10px', padding: '11px 24px', color: '#F7F3EE', fontSize: '13px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
                View All Progress Photos →
              </button>
            </div>
          </div>
        ) : (
          // Upload form (unlocked)
          <div style={card}>
            <h3 style={cardTitle}>Add This Week's Photos</h3>
            <div style={{ display: 'flex', gap: mobile ? '12px' : '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <PhotoUploadSlot label="Front View" preview={frontPreview} onChange={handleFile(setFrontPreview)} mobile={mobile} />
              <PhotoUploadSlot label="Side View"  preview={sidePreview}  onChange={handleFile(setSidePreview)}  mobile={mobile} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={labelStyle}>
                Current Weight (optional)
                <input type="text" placeholder="e.g. 82kg" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Notes / How are you feeling?
                <textarea placeholder="How are you feeling this week? Any changes noticed?" value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </label>
              <button onClick={handleSave} disabled={(!frontPreview && !sidePreview) || saving} style={{
                ...btnPrimary,
                opacity: (frontPreview || sidePreview) && !saving ? 1 : 0.4,
                cursor: (frontPreview || sidePreview) && !saving ? 'pointer' : 'not-allowed',
                alignSelf: 'flex-start',
                touchAction: 'manipulation',
              }}>
                {saving ? 'Uploading...' : 'Save Progress Photos'}
              </button>
            </div>
          </div>
        )
      )}

      {/* ── History view ── */}
      {view === 'history' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#BEB5AE', fontSize: '14px' }}>Loading your progress history…</div>
        ) : photos.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '50px 24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>📸</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1410', marginBottom: '8px' }}>No photos yet</div>
            <div style={{ fontSize: '14px', color: '#9C8E84', marginBottom: '20px' }}>Upload your first progress photos to start tracking your transformation.</div>
            <button onClick={() => setView('upload')} style={{ ...btnPrimary, touchAction: 'manipulation' }}>Upload Photos →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {photos.map((ph, idx) => {
              const n = norm(ph)
              const isFirst = idx === 0
              return (
                <div key={ph.id} style={{ background: '#FFFFFF', border: `1px solid ${isFirst ? '#C4A882' : '#EDE8E0'}`, borderRadius: '14px', overflow: 'hidden', boxShadow: isFirst ? '0 2px 8px rgba(196,168,130,0.2)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDE8E0', background: isFirst ? '#FFF9F3' : '#FAFAF8' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410' }}>{ph.date}</div>
                      {ph.weight && <div style={{ fontSize: '11px', color: '#7C5C3A', marginTop: '2px' }}>⚖️ {ph.weight}</div>}
                    </div>
                    {isFirst && (
                      <div style={{ background: '#C4A882', borderRadius: '99px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#1A1410' }}>LATEST</div>
                    )}
                  </div>
                  {/* Photos */}
                  <div style={{ display: 'flex', gap: '8px', padding: '12px' }} onClick={() => setSelected(n)}>
                    {n.frontPhoto && (
                      <div style={{ flex: 1, position: 'relative', cursor: 'pointer' }}>
                        <img src={n.frontPhoto} alt="front" style={{ width: '100%', height: mobile ? '160px' : '220px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>FRONT</div>
                      </div>
                    )}
                    {n.sidePhoto && (
                      <div style={{ flex: 1, position: 'relative', cursor: 'pointer' }}>
                        <img src={n.sidePhoto} alt="side" style={{ width: '100%', height: mobile ? '160px' : '220px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>SIDE</div>
                      </div>
                    )}
                  </div>
                  {ph.note && (
                    <div style={{ padding: '0 14px 12px', fontSize: '12px', color: '#9C8E84', lineHeight: 1.5 }}>"{ph.note}"</div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Full-screen modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              {selected.frontPhoto && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={selected.frontPhoto} alt="front" style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>FRONT</div>
                </div>
              )}
              {selected.sidePhoto && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={selected.sidePhoto} alt="side" style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(28,25,23,0.75)', color: '#F7F3EE', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>SIDE</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#7C5C3A', marginBottom: '4px' }}>{selected.date}</div>
            {selected.weight && <div style={{ fontSize: '13px', color: '#4A3E35', marginBottom: '4px' }}>⚖️ {selected.weight}</div>}
            {selected.note && <div style={{ fontSize: '13px', color: '#6B5E54', lineHeight: 1.5 }}>"{selected.note}"</div>}
            <button onClick={() => setSelected(null)} style={{ ...btnSecondary, marginTop: '14px', touchAction: 'manipulation' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PhotoUploadSlot({ label, preview, onChange, mobile }) {
  return (
    <div style={{ flex: 1, minWidth: mobile ? '120px' : '150px' }}>
      <div style={{ fontSize: '11px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      <label style={{ display: 'block', width: '100%', height: mobile ? '160px' : '200px', border: preview ? 'none' : '2px dashed #D8CFC5', borderRadius: '12px', cursor: 'pointer', background: preview ? 'transparent' : '#F5F0EB', overflow: 'hidden', position: 'relative', touchAction: 'manipulation' }}>
        <input type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
        {preview
          ? <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '28px' }}>📷</span>
              <span style={{ fontSize: '11px', color: '#9C8E84', textAlign: 'center', padding: '0 8px' }}>Tap to upload<br />{label}</span>
            </div>
        }
      </label>
      {preview && <div style={{ fontSize: '11px', color: '#16A34A', textAlign: 'center', marginTop: '6px', fontWeight: 600 }}>✓ Photo selected</div>}
    </div>
  )
}

const card = { background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }
const cardTitle = { fontSize: '16px', fontWeight: 700, color: '#1A1410', marginBottom: '18px' }
const labelStyle = { fontSize: '11px', color: '#9C8E84', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inputStyle = { background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '10px 14px', color: '#1A1410', fontSize: '14px', outline: 'none' }
const btnPrimary = { background: '#1C1917', border: 'none', borderRadius: '10px', padding: '11px 22px', color: '#F7F3EE', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const btnSecondary = { background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '10px 20px', color: '#4A3E35', fontSize: '13px', cursor: 'pointer' }

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
