import { useState, useEffect } from 'react'
import { supabase, isCoach } from '../lib/supabase'

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Shake']
const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Pre-Workout', 'Post-Workout', 'Snack']

const CAT_COLORS = {
  Breakfast: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', dot: '#FB923C' },
  Lunch:     { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#4ADE80' },
  Dinner:    { bg: '#EEF2FF', border: '#C7D2FE', text: '#4338CA', dot: '#818CF8' },
  Snack:     { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dot: '#FB7185' },
  Shake:     { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', dot: '#38BDF8' },
}

const defaultCat = cat => CAT_COLORS[cat] || { bg: '#F7F3EE', border: '#EDE8E0', text: '#6B5E54', dot: '#C4A882' }

const EMPTY_RECIPE = {
  title: '', description: '', category: 'Breakfast',
  ingredients: [{ amount: '', item: '' }],
  instructions: '', macros: { calories: '', protein: '', carbs: '', fat: '' },
}

const EMPTY_IDEA = { title: '', meal_time: 'Breakfast', foods: '', note: '' }

export default function Recipes({ user, mobile }) {
  const coach = isCoach(user)
  const [tab, setTab] = useState('recipes')            // 'recipes' | 'ideas'
  const [recipes, setRecipes] = useState([])
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editingIdea, setEditingIdea] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchRecipes(); fetchIdeas() }, [])

  const fetchRecipes = async () => {
    setLoading(true)
    const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false })
    setRecipes(data || [])
    setLoading(false)
  }

  const fetchIdeas = async () => {
    const { data } = await supabase.from('meal_ideas').select('*').order('created_at', { ascending: false })
    setIdeas(data || [])
  }

  const saveIdea = async () => {
    if (!editingIdea?.title?.trim() || !editingIdea?.foods?.trim()) return
    setSaving(true)
    const payload = { title: editingIdea.title.trim(), meal_time: editingIdea.meal_time, foods: editingIdea.foods.trim(), note: editingIdea.note?.trim() || null }
    if (editingIdea.id) {
      await supabase.from('meal_ideas').update(payload).eq('id', editingIdea.id)
    } else {
      await supabase.from('meal_ideas').insert(payload)
    }
    setSaving(false)
    setEditingIdea(null)
    fetchIdeas()
  }

  const deleteIdea = async (id) => {
    if (!window.confirm('Delete this meal idea?')) return
    await supabase.from('meal_ideas').delete().eq('id', id)
    fetchIdeas()
  }

  const filtered = recipes.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || (r.description || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ─── Save recipe ─────────────────────────────────────────────────────────────
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
    if (editing.id) {
      await supabase.from('recipes').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('recipes').insert(payload)
    }
    setSaving(false)
    setEditing(null)
    fetchRecipes()
  }

  const deleteRecipe = async (id) => {
    if (!window.confirm('Delete this recipe?')) return
    await supabase.from('recipes').delete().eq('id', id)
    setSelected(null)
    fetchRecipes()
  }

  // ─── Ingredient helpers ───────────────────────────────────────────────────────
  const updateIngredient = (idx, field, val) => {
    const arr = [...(editing.ingredients || [])]
    arr[idx] = { ...arr[idx], [field]: val }
    setEditing(e => ({ ...e, ingredients: arr }))
  }
  const addIngredient = () => setEditing(e => ({ ...e, ingredients: [...(e.ingredients || []), { amount: '', item: '' }] }))
  const removeIngredient = (idx) => setEditing(e => ({ ...e, ingredients: e.ingredients.filter((_, i) => i !== idx) }))

  const p = mobile ? '16px 14px 80px' : '40px'

  // ──────────────────────────────────────────────────────────────────────────────
  // FULL RECIPE VIEW
  // ──────────────────────────────────────────────────────────────────────────────
  if (selected) {
    const c = defaultCat(selected.category)
    return (
      <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
        <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B5E54', fontWeight: 600, marginBottom: '20px', padding: 0 }}>
          ← Back to Recipes
        </button>

        <div style={{ background: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', border: '1px solid #EDE8E0', maxWidth: '720px' }}>
          {/* Header */}
          <div style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, padding: '28px 28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: c.text, background: 'white', padding: '3px 10px', borderRadius: '99px', border: `1px solid ${c.border}` }}>{selected.category}</span>
            </div>
            <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 800, color: '#1A1410', margin: 0, lineHeight: 1.2 }}>{selected.title}</h1>
            {selected.description && <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#6B5E54', lineHeight: 1.6 }}>{selected.description}</p>}
          </div>

          <div style={{ padding: '28px' }}>
            {/* Macros */}
            {selected.macros && Object.values(selected.macros).some(v => v) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
                {[
                  { label: 'Calories', key: 'calories', unit: 'kcal', color: '#C4A882' },
                  { label: 'Protein',  key: 'protein',  unit: 'g',    color: '#4ADE80' },
                  { label: 'Carbs',    key: 'carbs',    unit: 'g',    color: '#FB923C' },
                  { label: 'Fat',      key: 'fat',      unit: 'g',    color: '#818CF8' },
                ].map(m => selected.macros[m.key] ? (
                  <div key={m.key} style={{ background: '#F7F3EE', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #EDE8E0' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A1410' }}>{selected.macros[m.key]}</div>
                    <div style={{ fontSize: '10px', color: '#9C8E84', marginTop: '2px' }}>{m.unit}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B5E54', marginTop: '2px' }}>{m.label}</div>
                  </div>
                ) : null)}
              </div>
            )}

            {/* Ingredients */}
            {selected.ingredients?.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1410', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ingredients</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selected.ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', padding: '8px 12px', background: '#F7F3EE', borderRadius: '8px' }}>
                      <span style={{ width: '6px', height: '6px', background: c.dot, borderRadius: '50%', flexShrink: 0, marginTop: '2px' }} />
                      {ing.amount && <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410', minWidth: '60px' }}>{ing.amount}</span>}
                      <span style={{ fontSize: '13px', color: '#6B5E54' }}>{ing.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {selected.instructions && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1410', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Instructions</h3>
                <div style={{ fontSize: '14px', color: '#4A3F35', lineHeight: 1.8, whiteSpace: 'pre-wrap', background: '#F7F3EE', padding: '16px', borderRadius: '12px' }}>
                  {selected.instructions}
                </div>
              </div>
            )}

            {/* Coach actions */}
            {coach && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', borderTop: '1px solid #EDE8E0', paddingTop: '20px' }}>
                <button onClick={() => { setSelected(null); setEditing({ ...selected, ingredients: selected.ingredients?.length ? selected.ingredients : [{ amount: '', item: '' }] }) }}
                  style={{ flex: 1, padding: '10px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  ✏️ Edit Recipe
                </button>
                <button onClick={() => deleteRecipe(selected.id)}
                  style={{ padding: '10px 16px', background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // EDIT / ADD FORM
  // ──────────────────────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
        <button onClick={() => setEditing(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B5E54', fontWeight: 600, marginBottom: '20px', padding: 0 }}>
          ← Cancel
        </button>

        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #EDE8E0', padding: '28px', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1410', marginBottom: '24px' }}>
            {editing.id ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>Recipe Name</label>
              <input value={editing.title} onChange={e => setEditing(ed => ({ ...ed, title: e.target.value }))}
                placeholder="e.g. High-Protein Oats" style={inputStyle} />
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <button key={cat} onClick={() => setEditing(ed => ({ ...ed, category: cat }))}
                    style={{ padding: '6px 14px', borderRadius: '99px', border: '1px solid', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      background: editing.category === cat ? '#1A1410' : 'white',
                      color: editing.category === cat ? '#F7F3EE' : '#6B5E54',
                      borderColor: editing.category === cat ? '#1A1410' : '#EDE8E0' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Short Description <span style={{ color: '#BEB5AE' }}>(optional)</span></label>
              <input value={editing.description || ''} onChange={e => setEditing(ed => ({ ...ed, description: e.target.value }))}
                placeholder="e.g. Quick and filling pre-workout breakfast" style={inputStyle} />
            </div>

            {/* Macros */}
            <div>
              <label style={labelStyle}>Macros <span style={{ color: '#BEB5AE' }}>(optional)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { key: 'calories', label: 'Calories', placeholder: 'kcal' },
                  { key: 'protein',  label: 'Protein',  placeholder: 'g' },
                  { key: 'carbs',    label: 'Carbs',    placeholder: 'g' },
                  { key: 'fat',      label: 'Fat',      placeholder: 'g' },
                ].map(m => (
                  <div key={m.key}>
                    <div style={{ fontSize: '10px', color: '#9C8E84', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
                    <input type="number" value={editing.macros?.[m.key] || ''} onChange={e => setEditing(ed => ({ ...ed, macros: { ...ed.macros, [m.key]: e.target.value } }))}
                      placeholder={m.placeholder} style={{ ...inputStyle, textAlign: 'center' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label style={labelStyle}>Ingredients</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(editing.ingredients || []).map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input value={ing.amount} onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                      placeholder="Amount (e.g. 100g)" style={{ ...inputStyle, width: '130px', flexShrink: 0 }} />
                    <input value={ing.item} onChange={e => updateIngredient(idx, 'item', e.target.value)}
                      placeholder="Ingredient" style={{ ...inputStyle, flex: 1 }} />
                    {(editing.ingredients || []).length > 1 && (
                      <button onClick={() => removeIngredient(idx)} style={{ background: 'none', border: 'none', color: '#BEB5AE', fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addIngredient} style={{ marginTop: '8px', background: 'none', border: '1px dashed #D4C5B5', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#9C8E84', cursor: 'pointer', fontWeight: 600 }}>
                + Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div>
              <label style={labelStyle}>Instructions <span style={{ color: '#BEB5AE' }}>(optional)</span></label>
              <textarea value={editing.instructions || ''} onChange={e => setEditing(ed => ({ ...ed, instructions: e.target.value }))}
                placeholder="Step-by-step preparation..." rows={5}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
            </div>

            <button onClick={saveRecipe} disabled={saving || !editing.title?.trim()}
              style={{ padding: '14px', background: saving || !editing.title?.trim() ? '#D4C5B5' : '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: saving || !editing.title?.trim() ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : editing.id ? 'Save Changes' : 'Add Recipe'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // MEAL IDEAS VIEW
  // ──────────────────────────────────────────────────────────────────────────────
  if (tab === 'ideas') {
    const TIME_COLORS = {
      'Breakfast': '#FB923C', 'Lunch': '#4ADE80', 'Dinner': '#818CF8',
      'Pre-Workout': '#F472B6', 'Post-Workout': '#34D399', 'Snack': '#FBBF24',
    }
    return (
      <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
        {/* Tab switcher — always first */}
        <div style={{ display: 'flex', background: '#EDE8E0', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
          {[{ id: 'recipes', label: '📖 Recipes' }, { id: 'ideas', label: '💡 Meal Ideas' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: tab === t.id ? '#1A1410' : 'transparent', color: tab === t.id ? '#F7F3EE' : '#6B5E54' }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 800, color: '#1A1410', margin: 0 }}>Meal Ideas</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9C8E84' }}>Quick food combos — no full recipe needed</p>
          </div>
          {coach && (
            <button onClick={() => setEditingIdea(EMPTY_IDEA)}
              style={{ padding: '10px 18px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Add Idea
            </button>
          )}
        </div>

        {/* Edit idea form */}
        {editingIdea && (
          <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700 }}>{editingIdea.id ? 'Edit Meal Idea' : 'New Meal Idea'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={editingIdea.title} onChange={e => setEditingIdea(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Post-workout plate" style={inputStyle} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {MEAL_TIMES.map(t => (
                  <button key={t} onClick={() => setEditingIdea(d => ({ ...d, meal_time: t }))} style={{ padding: '5px 12px', borderRadius: '99px', border: '1px solid', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: editingIdea.meal_time === t ? '#1A1410' : 'white', color: editingIdea.meal_time === t ? '#F7F3EE' : '#6B5E54', borderColor: editingIdea.meal_time === t ? '#1A1410' : '#EDE8E0' }}>{t}</button>
                ))}
              </div>
              <textarea value={editingIdea.foods} onChange={e => setEditingIdea(d => ({ ...d, foods: e.target.value }))} placeholder={"List the foods, one per line:\ne.g.\n3 eggs\n25g beef liver\n1 avocado\n100g sweet potato"} rows={5} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              <input value={editingIdea.note || ''} onChange={e => setEditingIdea(d => ({ ...d, note: e.target.value }))} placeholder="Optional tip or note..." style={inputStyle} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={saveIdea} disabled={saving} style={{ flex: 1, padding: '11px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditingIdea(null)} style={{ padding: '11px 18px', background: 'transparent', border: '1px solid #EDE8E0', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: '#6B5E54' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {ideas.length === 0 && !editingIdea ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💡</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#6B5E54', marginBottom: '6px' }}>No meal ideas yet</div>
            {coach && <div style={{ fontSize: '13px', color: '#BEB5AE' }}>Click "Add Idea" to create your first one.</div>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ideas.map(idea => (
              <div key={idea.id} style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ height: '4px', background: TIME_COLORS[idea.meal_time] || '#C4A882' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{idea.meal_time}</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1410', marginTop: '2px' }}>{idea.title}</div>
                    </div>
                    {coach && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditingIdea(idea)} style={{ background: '#F7F3EE', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#6B5E54' }}>Edit</button>
                        <button onClick={() => deleteIdea(idea.id)} style={{ background: '#FFF1F2', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#BE123C' }}>Delete</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(idea.foods || '').split('\n').filter(f => f.trim()).map((food, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#3D3530' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: TIME_COLORS[idea.meal_time] || '#C4A882', flexShrink: 0 }} />
                        {food.trim()}
                      </div>
                    ))}
                  </div>
                  {idea.note && <div style={{ marginTop: '10px', fontSize: '12px', color: '#9C8E84', fontStyle: 'italic', paddingTop: '10px', borderTop: '1px solid #F0EBE3' }}>💡 {idea.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // MAIN RECIPES LIST
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE' }}>
      {/* Tab switcher — always first */}
      <div style={{ display: 'flex', background: '#EDE8E0', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
        {[{ id: 'recipes', label: '📖 Recipes' }, { id: 'ideas', label: '💡 Meal Ideas' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: tab === t.id ? '#1A1410' : 'transparent', color: tab === t.id ? '#F7F3EE' : '#6B5E54' }}>{t.label}</button>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: mobile ? '22px' : '28px', fontWeight: 800, color: '#1A1410', margin: 0 }}>Schalk's Recipes</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9C8E84' }}>Full recipes with ingredients & instructions</p>
        </div>
        {coach && (
          <button onClick={() => setEditing(EMPTY_RECIPE)}
            style={{ padding: '10px 18px', background: '#1A1410', color: '#F7F3EE', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add Recipe
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes..."
          style={{ ...inputStyle, paddingLeft: '38px', marginBottom: 0 }} />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat
          const c = cat !== 'All' ? defaultCat(cat) : null
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: active ? (c ? c.bg : '#1A1410') : 'white',
                color: active ? (c ? c.text : '#F7F3EE') : '#6B5E54',
                borderColor: active ? (c ? c.border : '#1A1410') : '#EDE8E0' }}>
              {cat}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#BEB5AE', fontSize: '14px' }}>Loading recipes...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#6B5E54', marginBottom: '6px' }}>
            {recipes.length === 0 ? 'No recipes yet' : 'No recipes found'}
          </div>
          <div style={{ fontSize: '13px', color: '#BEB5AE' }}>
            {coach && recipes.length === 0 ? 'Click "Add Recipe" to get started.' : 'Try a different search or category.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filtered.map(r => {
            const c = defaultCat(r.category)
            const hasMacros = r.macros && Object.values(r.macros).some(v => v)
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', transition: 'transform 0.1s, box-shadow 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                {/* Category stripe */}
                <div style={{ height: '6px', background: c.dot }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: c.text, background: c.bg, padding: '3px 8px', borderRadius: '99px', border: `1px solid ${c.border}` }}>{r.category}</span>
                    {r.ingredients?.length > 0 && (
                      <span style={{ fontSize: '10px', color: '#BEB5AE' }}>{r.ingredients.length} ingredients</span>
                    )}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410', marginBottom: '4px', lineHeight: 1.3 }}>{r.title}</div>
                  {r.description && (
                    <div style={{ fontSize: '12px', color: '#9C8E84', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.description}
                    </div>
                  )}
                  {hasMacros && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F0EBE3' }}>
                      {r.macros.calories && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1410' }}>{r.macros.calories}</div><div style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase' }}>kcal</div></div>}
                      {r.macros.protein && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>{r.macros.protein}g</div><div style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase' }}>protein</div></div>}
                      {r.macros.carbs && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '13px', fontWeight: 700, color: '#C2410C' }}>{r.macros.carbs}g</div><div style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase' }}>carbs</div></div>}
                      {r.macros.fat && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '13px', fontWeight: 700, color: '#4338CA' }}>{r.macros.fat}g</div><div style={{ fontSize: '9px', color: '#BEB5AE', textTransform: 'uppercase' }}>fat</div></div>}
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

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B5E54',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
}
const inputStyle = {
  width: '100%', padding: '10px 14px', background: '#F7F3EE', border: '1px solid #EDE8E0',
  borderRadius: '10px', fontSize: '13px', color: '#1A1410', boxSizing: 'border-box',
  outline: 'none', fontFamily: 'inherit',
}
