import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function uploadPhoto(dataUrl, path) {
  try {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const { error } = await supabase.storage
      .from('progress-photos')
      .upload(path, blob, { contentType: blob.type, upsert: true })
    if (error) return dataUrl // fallback: keep base64
    const { data } = supabase.storage.from('progress-photos').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return dataUrl // fallback
  }
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

  useEffect(() => { loadPhotos() }, [user])

  const loadPhotos = async () => {
    setLoading(true)
    if (user) {
      const { data } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setPhotos(data || [])
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

    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    if (user) {
      const ts = Date.now()
      let front_url = null, side_url = null
      if (frontPreview) front_url = await uploadPhoto(frontPreview, `${user.id}/front_${ts}.jpg`)
      if (sidePreview)  side_url  = await uploadPhoto(sidePreview,  `${user.id}/side_${ts}.jpg`)

      const { data, error } = await supabase.from('progress_photos').insert({
        user_id: user.id,
        date: dateLabel,
        front_url,
        side_url,
        weight: weight || null,
        note: note || null,
      }).select().single()

      if (!error && data) setPhotos(prev => [data, ...prev])
    } else {
      // localStorage fallback
      const entry = { id: Date.now(), date: dateLabel, frontPhoto: frontPreview, sidePhoto: sidePreview, note, weight }
      const updated = [entry, ...photos]
      setPhotos(updated)
      localStorage.setItem('coachpro_progress_v2', JSON.stringify(updated))
    }

    setFrontPreview(null); setSidePreview(null); setNote(''); setWeight('')
    setSaving(false)
  }

  const p = mobile ? '16px 14px 20px' : '40px'

  // Normalise: DB rows use front_url/side_url, old localStorage uses frontPhoto/sidePhoto
  const norm = (ph) => ({
    ...ph,
    frontPhoto: ph.front_url || ph.frontPhoto || null,
    sidePhoto:  ph.side_url  || ph.sidePhoto  || null,
  })

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="📸" title="Physique Progress" sub="Upload a front & side photo each week to track your transformation" />

      {/* Upload card */}
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
          }}>
            {saving ? 'Uploading...' : 'Save Progress Photos'}
          </button>
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#BEB5AE', fontSize: '14px' }}>Loading photos…</div>
      ) : photos.length > 0 ? (
        <div style={card}>
          <h3 style={cardTitle}>Progress Gallery ({photos.length} entries)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {photos.map(ph => {
              const p = norm(ph)
              return (
                <div key={ph.id} onClick={() => setSelected(p)} style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #EDE8E0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    {p.frontPhoto && (
                      <div style={{ flex: 1, position: 'relative' }}>
                        <img src={p.frontPhoto} alt="front" style={{ width: '100%', height: mobile ? '160px' : '200px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(28,25,23,0.7)', color: '#F7F3EE', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>FRONT</div>
                      </div>
                    )}
                    {p.sidePhoto && (
                      <div style={{ flex: 1, position: 'relative' }}>
                        <img src={p.sidePhoto} alt="side" style={{ width: '100%', height: mobile ? '160px' : '200px', objectFit: 'cover', borderRadius: '8px' }} />
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(28,25,23,0.7)', color: '#F7F3EE', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>SIDE</div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7C5C3A', fontWeight: 600 }}>{ph.date}</div>
                  {ph.weight && <div style={{ fontSize: '12px', color: '#6B5E54', marginTop: '2px' }}>⚖️ {ph.weight}</div>}
                  {ph.note && <div style={{ fontSize: '11px', color: '#9C8E84', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ph.note}</div>}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Full-screen modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '94%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {selected.frontPhoto && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={selected.frontPhoto} alt="front" style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(28,25,23,0.7)', color: '#F7F3EE', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>FRONT</div>
                </div>
              )}
              {selected.sidePhoto && (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={selected.sidePhoto} alt="side" style={{ width: '100%', borderRadius: '10px' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(28,25,23,0.7)', color: '#F7F3EE', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>SIDE</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', color: '#7C5C3A', fontWeight: 600, marginBottom: '6px' }}>{selected.date}</div>
            {selected.weight && <div style={{ fontSize: '14px', color: '#4A3E35', marginBottom: '6px' }}>⚖️ {selected.weight}</div>}
            {selected.note && <div style={{ fontSize: '13px', color: '#6B5E54' }}>{selected.note}</div>}
            <button onClick={() => setSelected(null)} style={{ ...btnSecondary, marginTop: '16px' }}>Close</button>
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
      <label style={{ display: 'block', width: '100%', height: mobile ? '160px' : '200px', border: preview ? 'none' : '2px dashed #D8CFC5', borderRadius: '12px', cursor: 'pointer', background: preview ? 'transparent' : '#F5F0EB', overflow: 'hidden', position: 'relative' }}>
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
