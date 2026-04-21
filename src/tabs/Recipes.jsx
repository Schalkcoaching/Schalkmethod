import { useState, useEffect } from 'react'
import { supabase, isCoach } from '../lib/supabase'

const FILTERS = ['All', 'Meals', 'Shakes', 'Snacks']

const COLORS = {
  Meals:  { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#4ADE80' },
  Shakes: { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', dot: '#38BDF8' },
  Snacks: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', dot: '#FB923C' },
}
const c = key => COLORS[key] || { bg: '#F7F3EE', border: '#EDE8E0', text: '#6B5E54', dot: '#C4A882' }

const EMPTY = { title: '', description: '', category: 'Meals', ingredients: [{ amount: '', item: '' }], instructions: '', macros: { calories: '', protein: '', carbs: '', fat: '' } }

export default function Recipes({ user, mobile }) {
  const coach = isCoach(user)
  const [recipes, setRecipes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { fetchRecipes() }, [])

  const fetchRecipes = async () => {
    setLoading(true)
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false })
    setRecipes(data || [])
    setLoading(false)
  }

  const saveRecipe = async () => {
    if (!editing?.title?.trim()) return
    setSaving(true)
    const payload = {
      title: editing.title.trim(),
      description: editing.description?.trim() || null,
      category: editing.category,
      ingredients: (editing.ingredients || []).filter(i => i.item?.trim()),
      instructions: editing.instructions?.trim() || null,
      macros: editing.macros || {},
    }
    if (editing.id) await supabase.from('recipes').update(payload).eq('id', editing.id)
    else await supabase.from('recipes').insert(payload)
    setSaving(false); setEditing(null); fetchRecipes()
  }

  const deleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe?')) return
    await supabase.from('recipes').delete().eq('id', id)
    setSelected(null); fetchRecipes()
  }

  const updateIngredient = (idx, field, val) => {
    const arr = [...(editing.ingredients || [])]
    arr[idx] = { ...arr[idx], [field]: val }
    setEditing(e => ({ ...e, ingredients: arr }))
  }
  const addIngredient    = () => setEditing(e => ({ ...e, ingredients: [...(e.ingredients || []), { amount: '', item: '' }] }))
  const removeIngredient = (idx) => setEditing(e => ({ ...e, ingredients: e.ingredients.filter((_, i) => i !== idx) }))

  const filtered = recipes.filter(r => {
    const matchFilter = filter === 'All' || r.category === filter
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const p = mobile ? '16px 14px 80px' : '40px'

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────────
  if (selected) {
    const col = c(selected.category)
    return (
      <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
        <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B5E54', fontWeight: 600, marginBottom: '20px', padding: 0 }}>← Back</button>
        <div style={{ background: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', border: '1px solid #EDE8E0', maxWidth: '720px' }}>
          <div style={{ background: col.bg, borderBottom: `1px solid ${col.border}`, padding: '28px 28px 24px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: col.text, background: 'white', padding: '3px 10px', borderRadius: '99px', border: `1px solid ${col.border}`, display: 'inline-block', marginBottom: '12px' }}>{selected.category}</span>
            <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 800, color: '#1A1410', margin: 0, lineHeight: 1.2 }}>{selected.title}</h1>
            {selected.description && <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#6B5E54', lineHeight: 1.6 }}>{selected.description}</p>}
          </div>
          <div style={{ padding: '28px' }}>
            {selected.macros && Object.values(selected.macros).some(v => v) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
                {[{ label: 'Calories', key: 'calories', unit: 'kcal' }, { label: 'Protein', key: 'protein', unit: 'g' }, { label: 'Carbs', key: 'carbs', unit: 'g' }, { label: 'Fat', key: 'fat', unit: 'g' }].map(m => selected.macros[m.key] ? (
                  <div key={m.key} style={{ background: '#F7F3EE', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #EDE8E0' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A1410' }}>{selected.macros[m.key]}</div>
                    <div style={{ fontSize: '10px', color: '#9C8E84', marginTop: '2px' }}>{m.unit}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B5E54', marginTop: '2px' }}>{m.label}</div>
                  </div>
                ) : null)}
              </div>
            )}
            {selected.ingredients?.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ingredients</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selected.ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', padding: '8px 12px', background: '#F7F3EE', borderRadius: '8px' }}>
                      <span style={{ width: '6px', height: '6px', background: col.dot, borderRadius: '50%', flexShrink: 0, marginTop: '2px' }} />
                      {ing.amount && <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410', minWidth: '60px' }}>{ing.amount}</span>}
                      <span style={{ fontSize: '13px', color: '#6B5E54' }}>{ing.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.instructions && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Instructions</h3>
                <div style={{ fontSize: '14px', color: '#4A3F35', lineHeight: 1.8, whiteSpace: 'pre-wrap', background: '#F7F3EE', padding: '16px', borderRadius: '12px' }}>{selected.instructions}</div>
              </div>
            )}
            {coach && (
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #EDE8E0', paddingTop: '20px' }}>
                <button onClick={() => { setSelected(null); setEditing({ ...selected, ingredients: selected.ingredients?.length ? selected.ingredients : [{ amount: '', item: '' }] }) }} style={{ flex: 1, padding: '10px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={() => deleteRecipe(selected.id)} style={{ padding: '10px 16px', background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🗑️ Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── EDIT FORM ─────────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
        <button onClick={() => setEditing(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B5E54', fontWeight: 600, marginBottom: '20px', padding: 0 }}>← Cancel</button>
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #EDE8E0', padding: '28px', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1410', marginBottom: '24px' }}>{editing.id ? 'Edit Recipe' : 'New Recipe'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Recipe Name</label>
              <input value={editing.title} onChange={e => setEditing(ed => ({ ...ed, title: e.target.value }))} placeholder="e.g. High-Protein Oats" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Meals', 'Shakes', 'Snacks'].map(cat => (
                  <button key={cat} onClick={() => setEditing(ed => ({ ...ed, category: cat }))} style={{ padding: '6px 14px', borderRadius: '99px', border: '1px solid', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: editing.category === cat ? '#1A1410' : 'white', color: editing.category === cat ? '#F7F3EE' : '#6B5E54', borderColor: editing.category === cat ? '#1A1410' : '#EDE8E0' }}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Short Description <span style={{ color: '#BEB5AE' }}>(optional)</span></label>
              <input value={editing.description || ''} onChange={e => setEditing(ed => ({ ...ed, description: e.target.value }))} placeholder="e.g. Quick and filling pre-workout breakfast" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Macros <span style={{ color: '#BEB5AE' }}>(optional)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[{ key: 'calories', label: 'Calories', placeholder: 'kcal' }, { key: 'protein', label: 'Protein', placeholder: 'g' }, { key: 'carbs', label: 'Carbs', placeholder: 'g' }, { key: 'fat', label: 'Fat', placeholder: 'g' }].map(m => (
                  <div key={m.key}>
                    <div style={{ fontSize: '10px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
                    <input type="number" value={editing.macros?.[m.key] || ''} onChange={e => setEditing(ed => ({ ...ed, macros: { ...ed.macros, [m.key]: e.target.value } }))} placeholder={m.placeholder} style={{ ...inputStyle, textAlign: 'center', fontSize: '16px' }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Ingredients</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(editing.ingredients || []).map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input value={ing.amount} onChange={e => updateIngredient(idx, 'amount', e.target.value)} placeholder="Amount" style={{ ...inputStyle, width: '120px', flexShrink: 0, fontSize: '16px' }} />
                    <input value={ing.item} onChange={e => updateIngredient(idx, 'item', e.target.value)} placeholder="Ingredient" style={{ ...inputStyle, flex: 1, fontSize: '16px' }} />
                    {(editing.ingredients || []).length > 1 && <button onClick={() => removeIngredient(idx)} style={{ background: 'none', border: 'none', color: '#BEB5AE', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}>×</button>}
                  </div>
                ))}
              </div>
              <button onClick={addIngredient} style={{ marginTop: '8px', background: 'none', border: '1px dashed #D4C5B5', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#9C8E84', cursor: 'pointer', fontWeight: 600 }}>+ Add Ingredient</button>
            </div>
            <div>
              <label style={labelStyle}>Instructions <span style={{ color: '#BEB5AE' }}>(optional)</span></label>
              <textarea value={editing.instructions || ''} onChange={e => setEditing(ed => ({ ...ed, instructions: e.target.value }))} placeholder="Step-by-step preparation..." rows={5} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: '16px' }} />
            </div>
            <button onClick={saveRecipe} disabled={saving || !editing.title?.trim()} style={{ padding: '14px', background: saving || !editing.title?.trim() ? '#D4C5B5' : '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: saving || !editing.title?.trim() ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : editing.id ? 'Save Changes' : 'Add Recipe'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN LIST ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 800, color: '#1A1410', margin: 0 }}>Schalk's Kitchen</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9C8E84' }}>Recipes & meal ideas for every time of day</p>
        </div>
        {coach && (
          <button onClick={() => setEditing(EMPTY)} style={{ padding: '10px 16px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>+ Add</button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes..." style={{ ...inputStyle, paddingLeft: '38px', fontSize: '16px' }} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '18px', scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const active = filter === f
          const col = f !== 'All' ? c(f) : null
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: active ? (col ? col.bg : '#1A1410') : 'white', color: active ? (col ? col.text : '#F7F3EE') : '#6B5E54', borderColor: active ? (col ? col.border : '#1A1410') : '#EDE8E0' }}>{f}</button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#BEB5AE', fontSize: '14px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#6B5E54', marginBottom: '6px' }}>{recipes.length === 0 ? 'Nothing added yet' : 'Nothing found'}</div>
          <div style={{ fontSize: '13px', color: '#BEB5AE' }}>{coach && recipes.length === 0 ? 'Use "+ Add" to create your first recipe.' : 'Try a different filter.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(item => {
            const col = c(item.category)
            const hasMacros = item.macros && Object.values(item.macros).some(v => v)
            return (
              <button key={item.id} onClick={() => setSelected(item)} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', width: '100%' }}>
                <div style={{ height: '5px', background: col.dot }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: col.text, background: col.bg, padding: '2px 8px', borderRadius: '99px', border: `1px solid ${col.border}` }}>{item.category}</span>
                    {item.ingredients?.length > 0 && <span style={{ fontSize: '10px', color: '#BEB5AE' }}>{item.ingredients.length} ingredients</span>}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410', marginBottom: item.description ? '4px' : 0 }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: '12px', color: '#9C8E84', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>}
                  {hasMacros && (
                    <div style={{ display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F0EBE3' }}>
                      {item.macros.calories && <div><span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410' }}>{item.macros.calories}</span><span style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase', marginLeft: '2px' }}>kcal</span></div>}
                      {item.macros.protein && <div><span style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>{item.macros.protein}g</span><span style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase', marginLeft: '2px' }}>protein</span></div>}
                      {item.macros.carbs && <div><span style={{ fontSize: '13px', fontWeight: 700, color: '#C2410C' }}>{item.macros.carbs}g</span><span style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase', marginLeft: '2px' }}>carbs</span></div>}
                      {item.macros.fat && <div><span style={{ fontSize: '13px', fontWeight: 700, color: '#4338CA' }}>{item.macros.fat}g</span><span style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase', marginLeft: '2px' }}>fat</span></div>}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B5E54', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }
const inputStyle = { width: '100%', padding: '10px 14px', background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '10px', fontSize: '13px', color: '#1A1410', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }
