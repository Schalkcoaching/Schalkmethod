import { useState } from 'react'

const STORAGE_KEY = 'coachpro_progress'

function loadPhotos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function Progress() {
  const [photos, setPhotos] = useState(loadPhotos)
  const [note, setNote] = useState('')
  const [weight, setWeight] = useState('')
  const [preview, setPreview] = useState(null)
  const [selected, setSelected] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!preview) return
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      photo: preview, note, weight,
    }
    const updated = [entry, ...photos]
    setPhotos(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setPreview(null); setNote(''); setWeight('')
  }

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="📸" title="Physique Progress" sub="Track your weekly transformation with progress photos" />

      {/* Upload card */}
      <div style={card}>
        <h3 style={cardTitle}>Add This Week's Photo</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <label style={{
            width: '180px', height: '220px', minWidth: '180px',
            border: preview ? 'none' : '2px dashed #D8CFC5',
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '8px',
            background: preview ? 'transparent' : '#F5F0EB',
            overflow: 'hidden',
          }}>
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            {preview
              ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              : <>
                  <span style={{ fontSize: '32px' }}>📷</span>
                  <span style={{ fontSize: '12px', color: '#9C8E84', textAlign: 'center' }}>Click to upload<br />progress photo</span>
                </>
            }
          </label>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={labelStyle}>
              Current Weight (optional)
              <input type="text" placeholder="e.g. 82kg" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Notes / How are you feeling?
              <textarea
                placeholder="How are you feeling this week? Any changes noticed?"
                value={note} onChange={e => setNote(e.target.value)} rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>
            <button onClick={handleSave} disabled={!preview} style={{
              ...btnPrimary, opacity: preview ? 1 : 0.4,
              cursor: preview ? 'pointer' : 'not-allowed', alignSelf: 'flex-start',
            }}>
              Save Progress Photo
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div style={card}>
          <h3 style={cardTitle}>Progress Gallery ({photos.length} entries)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {photos.map(p => (
              <div key={p.id} onClick={() => setSelected(p)} style={{
                borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                border: '1px solid #EDE8E0', transition: 'all 0.15s', background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <img src={p.photo} alt="progress" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '12px', color: '#7C5C3A', fontWeight: 600 }}>{p.date}</div>
                  {p.weight && <div style={{ fontSize: '12px', color: '#6B5E54', marginTop: '2px' }}>⚖️ {p.weight}</div>}
                  {p.note && <div style={{ fontSize: '11px', color: '#9C8E84', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px',
            padding: '24px', maxWidth: '500px', width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <img src={selected.photo} alt="full" style={{ width: '100%', borderRadius: '10px', marginBottom: '16px' }} />
            <div style={{ fontSize: '14px', color: '#7C5C3A', fontWeight: 600, marginBottom: '6px' }}>{selected.date}</div>
            {selected.weight && <div style={{ fontSize: '14px', color: '#4A3E35', marginBottom: '6px' }}>Weight: {selected.weight}</div>}
            {selected.note && <div style={{ fontSize: '13px', color: '#6B5E54' }}>{selected.note}</div>}
            <button onClick={() => setSelected(null)} style={{ ...btnSecondary, marginTop: '16px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

const card = {
  background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px',
  padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}
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
