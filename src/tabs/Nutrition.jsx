import { useState, useEffect } from 'react'

// ─── Micronutrient definitions ────────────────────────────────────────────────
const VITAMINS = [
  { id: 'vit_a',   label: 'Vitamin A',      unit: 'mcg RAE', color: '#e8703a' },
  { id: 'vit_b1',  label: 'B1 Thiamine',    unit: 'mg',      color: '#c4a227' },
  { id: 'vit_b2',  label: 'B2 Riboflavin',  unit: 'mg',      color: '#c4a227' },
  { id: 'vit_b3',  label: 'B3 Niacin',      unit: 'mg',      color: '#c4a227' },
  { id: 'vit_b5',  label: 'B5 Pantothenic', unit: 'mg',      color: '#c4a227' },
  { id: 'vit_b6',  label: 'B6',             unit: 'mg',      color: '#c4a227' },
  { id: 'vit_b7',  label: 'B7 Biotin',      unit: 'mcg',     color: '#c4a227' },
  { id: 'vit_b9',  label: 'B9 Folate',      unit: 'mcg DFE', color: '#c4a227' },
  { id: 'vit_b12', label: 'B12',            unit: 'mcg',     color: '#6366f1' },
  { id: 'vit_c',   label: 'Vitamin C',      unit: 'mg',      color: '#f59e0b' },
  { id: 'vit_d',   label: 'Vitamin D',      unit: 'mcg',     color: '#eab308' },
  { id: 'vit_e',   label: 'Vitamin E',      unit: 'mg',      color: '#84cc16' },
  { id: 'vit_k2',  label: 'Vitamin K2',     unit: 'mcg',     color: '#22c55e' },
  { id: 'choline', label: 'Choline',        unit: 'mg',      color: '#a855f7' },
]

const MINERALS = [
  { id: 'calcium',    label: 'Calcium',    unit: 'mg',  color: '#0ea5e9' },
  { id: 'phosphorus', label: 'Phosphorus', unit: 'mg',  color: '#38bdf8' },
  { id: 'potassium',  label: 'Potassium',  unit: 'mg',  color: '#06b6d4' },
  { id: 'sodium',     label: 'Sodium',     unit: 'mg',  color: '#94a3b8' },
  { id: 'chloride',   label: 'Chloride',   unit: 'mg',  color: '#cbd5e1' },
  { id: 'magnesium',  label: 'Magnesium',  unit: 'mg',  color: '#34d399' },
  { id: 'iron',       label: 'Iron',       unit: 'mg',  color: '#ef4444' },
  { id: 'zinc',       label: 'Zinc',       unit: 'mg',  color: '#f97316' },
  { id: 'copper',     label: 'Copper',     unit: 'mg',  color: '#b45309' },
  { id: 'iodine',     label: 'Iodine',     unit: 'mcg', color: '#7c3aed' },
  { id: 'cobalt',     label: 'Cobalt',     unit: 'mcg', color: '#6d28d9' },
  { id: 'manganese',  label: 'Manganese',  unit: 'mg',  color: '#a16207' },
  { id: 'chromium',   label: 'Chromium',   unit: 'mcg', color: '#78716c' },
  { id: 'selenium',   label: 'Selenium',   unit: 'mcg', color: '#16a34a' },
  { id: 'boron',      label: 'Boron',      unit: 'mg',  color: '#d946ef' },
]

const ALL_NUTRIENTS = [...VITAMINS, ...MINERALS]

// ─── Animal-based food library — nutrients scored per 100g/ml ─────────────────
// Score: 1.0 = elite source, 0.7 = very good, 0.5 = good, 0.3 = moderate
const FOOD_LIBRARY = [
  // ── Beef cuts ──
  { id: 'ribeye',       name: 'Ribeye Steak',         category: 'Beef', icon: '🥩', caloriesPer100: 291, unit: 'g',  defaultAmount: 200, nutrients: { vit_b3: 0.7, vit_b6: 0.5, vit_b12: 0.9, choline: 0.5, iron: 0.6, zinc: 0.8, selenium: 0.6, phosphorus: 0.6 } },
  { id: 'sirloin',      name: 'Sirloin Steak',        category: 'Beef', icon: '🥩', caloriesPer100: 207, unit: 'g',  defaultAmount: 200, nutrients: { vit_b3: 0.8, vit_b6: 0.6, vit_b12: 0.9, choline: 0.5, iron: 0.5, zinc: 0.7, selenium: 0.6, phosphorus: 0.6 } },
  { id: 'rump',         name: 'Rump Steak',           category: 'Beef', icon: '🥩', caloriesPer100: 195, unit: 'g',  defaultAmount: 200, nutrients: { vit_b3: 0.7, vit_b6: 0.5, vit_b12: 0.8, choline: 0.4, iron: 0.5, zinc: 0.7, selenium: 0.5, phosphorus: 0.5 } },
  { id: 'tbone',        name: 'T-Bone Steak',         category: 'Beef', icon: '🥩', caloriesPer100: 244, unit: 'g',  defaultAmount: 300, nutrients: { vit_b3: 0.7, vit_b6: 0.5, vit_b12: 0.9, choline: 0.5, iron: 0.6, zinc: 0.8, selenium: 0.6, phosphorus: 0.6 } },
  { id: 'fillet',       name: 'Fillet / Tenderloin',  category: 'Beef', icon: '🥩', caloriesPer100: 215, unit: 'g',  defaultAmount: 200, nutrients: { vit_b3: 0.7, vit_b6: 0.5, vit_b12: 0.8, choline: 0.4, iron: 0.5, zinc: 0.6, selenium: 0.6, phosphorus: 0.6 } },
  { id: 'brisket',      name: 'Brisket',              category: 'Beef', icon: '🥩', caloriesPer100: 250, unit: 'g',  defaultAmount: 200, nutrients: { vit_b3: 0.6, vit_b6: 0.4, vit_b12: 0.7, choline: 0.4, iron: 0.6, zinc: 0.6, selenium: 0.5 } },
  { id: 'ground_beef',  name: 'Ground Beef (80/20)',   category: 'Beef', icon: '🥩', caloriesPer100: 254, unit: 'g',  defaultAmount: 150, nutrients: { vit_b3: 0.6, vit_b6: 0.5, vit_b12: 0.8, choline: 0.5, iron: 0.6, zinc: 0.7, selenium: 0.5 } },
  { id: 'beef_liver',   name: 'Beef Liver',           category: 'Beef', icon: '🫀', caloriesPer100: 175, unit: 'g',  defaultAmount: 100, nutrients: { vit_a: 1, vit_b2: 1, vit_b3: 0.8, vit_b5: 0.9, vit_b6: 0.7, vit_b7: 0.6, vit_b9: 1, vit_b12: 1, choline: 1, copper: 1, iron: 0.9, zinc: 0.7, selenium: 0.8, cobalt: 0.9 } },
  // ── Lamb ──
  { id: 'lamb_chop',    name: 'Lamb Chops',           category: 'Lamb', icon: '🍖', caloriesPer100: 294, unit: 'g',  defaultAmount: 200, nutrients: { vit_b12: 0.8, vit_b3: 0.6, zinc: 0.8, selenium: 0.6, iron: 0.7, phosphorus: 0.5 } },
  { id: 'lamb_leg',     name: 'Leg of Lamb',          category: 'Lamb', icon: '🍖', caloriesPer100: 217, unit: 'g',  defaultAmount: 200, nutrients: { vit_b12: 0.8, vit_b3: 0.6, zinc: 0.7, selenium: 0.6, iron: 0.6, phosphorus: 0.5 } },
  { id: 'lamb_liver',   name: 'Lamb Liver',           category: 'Lamb', icon: '🫀', caloriesPer100: 168, unit: 'g',  defaultAmount: 100, nutrients: { vit_a: 0.9, vit_b2: 0.9, vit_b12: 1, vit_b9: 0.8, choline: 0.8, copper: 0.8, iron: 0.8, zinc: 0.6, selenium: 0.7 } },
  // ── Pork ──
  { id: 'pork_chop',    name: 'Pork Chops',           category: 'Pork', icon: '🥩', caloriesPer100: 231, unit: 'g',  defaultAmount: 200, nutrients: { vit_b1: 0.9, vit_b3: 0.7, vit_b6: 0.6, vit_b12: 0.6, selenium: 0.7, zinc: 0.5, phosphorus: 0.6 } },
  { id: 'pork_loin',    name: 'Pork Loin',            category: 'Pork', icon: '🥩', caloriesPer100: 242, unit: 'g',  defaultAmount: 200, nutrients: { vit_b1: 1,   vit_b3: 0.7, vit_b6: 0.6, vit_b12: 0.6, selenium: 0.7, zinc: 0.5, phosphorus: 0.6 } },
  { id: 'pork_belly',   name: 'Pork Belly',           category: 'Pork', icon: '🥓', caloriesPer100: 518, unit: 'g',  defaultAmount: 150, nutrients: { vit_b1: 0.7, vit_b3: 0.5, vit_b12: 0.5, selenium: 0.6, zinc: 0.4 } },
  { id: 'bacon',        name: 'Bacon',                category: 'Pork', icon: '🥓', caloriesPer100: 540, unit: 'g',  defaultAmount: 80,  nutrients: { vit_b1: 0.8, vit_b3: 0.7, vit_b12: 0.5, selenium: 0.7, phosphorus: 0.5 } },
  // ── Poultry ──
  { id: 'chicken_breast', name: 'Chicken Breast',     category: 'Poultry', icon: '🍗', caloriesPer100: 165, unit: 'g', defaultAmount: 200, nutrients: { vit_b3: 0.9, vit_b5: 0.5, vit_b6: 0.7, vit_b12: 0.4, selenium: 0.6, phosphorus: 0.5, choline: 0.4 } },
  { id: 'chicken_thigh', name: 'Chicken Thigh',       category: 'Poultry', icon: '🍗', caloriesPer100: 209, unit: 'g', defaultAmount: 180, nutrients: { vit_b3: 0.7, vit_b5: 0.5, vit_b6: 0.6, vit_b12: 0.5, selenium: 0.5, phosphorus: 0.5, choline: 0.4, zinc: 0.4 } },
  { id: 'turkey',        name: 'Turkey Breast',       category: 'Poultry', icon: '🦃', caloriesPer100: 157, unit: 'g', defaultAmount: 200, nutrients: { vit_b3: 0.9, vit_b6: 0.7, vit_b12: 0.5, selenium: 0.7, zinc: 0.5, phosphorus: 0.5 } },
  { id: 'duck',          name: 'Duck',                category: 'Poultry', icon: '🍗', caloriesPer100: 337, unit: 'g', defaultAmount: 180, nutrients: { vit_b3: 0.6, vit_b12: 0.6, iron: 0.6, zinc: 0.5, selenium: 0.5 } },
  { id: 'chicken_liver', name: 'Chicken Liver',       category: 'Poultry', icon: '🫀', caloriesPer100: 172, unit: 'g', defaultAmount: 100, nutrients: { vit_a: 0.8, vit_b2: 0.9, vit_b5: 0.8, vit_b9: 0.9, vit_b12: 1, choline: 0.9, copper: 0.7, iron: 0.8, selenium: 0.7 } },
  // ── Fish & Seafood ──
  { id: 'salmon',        name: 'Salmon',              category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 208, unit: 'g', defaultAmount: 180, nutrients: { vit_b2: 0.5, vit_b3: 0.8, vit_b5: 0.7, vit_b6: 0.7, vit_b12: 0.9, vit_d: 0.9, selenium: 0.8, phosphorus: 0.6, potassium: 0.5, iodine: 0.6 } },
  { id: 'tuna',          name: 'Tuna (canned)',        category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 132, unit: 'g', defaultAmount: 150, nutrients: { vit_b3: 0.9, vit_b6: 0.5, vit_b12: 0.9, vit_d: 0.6, selenium: 0.9, phosphorus: 0.5 } },
  { id: 'sardines',      name: 'Sardines',            category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 208, unit: 'g', defaultAmount: 100, nutrients: { vit_b12: 0.8, vit_d: 0.7, calcium: 0.8, phosphorus: 0.7, selenium: 0.7, iodine: 0.7, cobalt: 0.6 } },
  { id: 'mackerel',      name: 'Mackerel',            category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 205, unit: 'g', defaultAmount: 180, nutrients: { vit_b2: 0.5, vit_b3: 0.7, vit_b12: 0.9, vit_d: 0.8, selenium: 0.7, phosphorus: 0.6, iodine: 0.5 } },
  { id: 'cod',           name: 'Cod',                 category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 82,  unit: 'g', defaultAmount: 200, nutrients: { vit_b3: 0.6, vit_b12: 0.6, vit_d: 0.4, selenium: 0.6, phosphorus: 0.5, iodine: 0.7 } },
  { id: 'oysters',       name: 'Oysters',             category: 'Fish & Seafood', icon: '🦪', caloriesPer100: 68,  unit: 'g', defaultAmount: 100, nutrients: { vit_b12: 0.9, vit_d: 0.5, zinc: 1, copper: 0.9, iron: 0.7, selenium: 0.7, iodine: 0.8, cobalt: 0.8 } },
  { id: 'shrimp',        name: 'Shrimp',              category: 'Fish & Seafood', icon: '🦐', caloriesPer100: 99,  unit: 'g', defaultAmount: 150, nutrients: { vit_b12: 0.6, selenium: 0.8, iodine: 0.7, phosphorus: 0.5 } },
  // ── Eggs & Dairy ──
  { id: 'eggs_whole',    name: 'Whole Eggs',          category: 'Eggs & Dairy', icon: '🥚', caloriesPer100: 155, unit: 'g',  defaultAmount: 110, unitHint: '≈2 eggs', nutrients: { vit_a: 0.5, vit_b2: 0.5, vit_b5: 0.5, vit_b7: 0.9, vit_b12: 0.5, vit_d: 0.5, vit_k2: 0.6, choline: 0.9, selenium: 0.6, cobalt: 0.5 } },
  { id: 'milk_whole',    name: 'Whole Milk',          category: 'Eggs & Dairy', icon: '🥛', caloriesPer100: 61,  unit: 'ml', defaultAmount: 250, nutrients: { vit_a: 0.4, vit_b2: 0.6, vit_b12: 0.5, vit_d: 0.4, calcium: 0.8, phosphorus: 0.6, iodine: 0.7, potassium: 0.4 } },
  { id: 'greek_yogurt',  name: 'Greek Yogurt',        category: 'Eggs & Dairy', icon: '🥛', caloriesPer100: 59,  unit: 'g',  defaultAmount: 200, nutrients: { vit_b2: 0.5, vit_b12: 0.6, calcium: 0.7, phosphorus: 0.5, iodine: 0.6, potassium: 0.4 } },
  { id: 'cheese_hard',   name: 'Hard Cheese',         category: 'Eggs & Dairy', icon: '🧀', caloriesPer100: 392, unit: 'g',  defaultAmount: 50,  nutrients: { vit_a: 0.4, vit_b2: 0.5, vit_b12: 0.5, vit_k2: 0.9, calcium: 0.9, phosphorus: 0.6, selenium: 0.4 } },
  { id: 'butter',        name: 'Butter',              category: 'Eggs & Dairy', icon: '🧈', caloriesPer100: 717, unit: 'g',  defaultAmount: 20,  nutrients: { vit_a: 0.5, vit_d: 0.3, vit_k2: 0.6, vit_e: 0.3 } },
  { id: 'heavy_cream',   name: 'Heavy Cream',         category: 'Eggs & Dairy', icon: '🥛', caloriesPer100: 345, unit: 'ml', defaultAmount: 50,  nutrients: { vit_a: 0.4, vit_d: 0.3, vit_k2: 0.4, calcium: 0.4 } },
  // ── Vegetables ──
  { id: 'spinach',       name: 'Spinach',             category: 'Vegetables', icon: '🥬', caloriesPer100: 23,  unit: 'g', defaultAmount: 100, nutrients: { vit_k2: 0.8, vit_b9: 0.7, vit_a: 0.5, vit_e: 0.4, magnesium: 0.5, iron: 0.4, potassium: 0.5, manganese: 0.6 } },
  { id: 'broccoli',      name: 'Broccoli',            category: 'Vegetables', icon: '🥦', caloriesPer100: 34,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.9, vit_k2: 0.7, vit_b9: 0.5, vit_e: 0.3, potassium: 0.4, manganese: 0.4 } },
  { id: 'sweet_potato',  name: 'Sweet Potato',        category: 'Vegetables', icon: '🍠', caloriesPer100: 86,  unit: 'g', defaultAmount: 150, nutrients: { vit_a: 0.9, vit_c: 0.5, vit_b6: 0.4, potassium: 0.6, manganese: 0.5, boron: 0.4 } },
  { id: 'carrots',       name: 'Carrots',             category: 'Vegetables', icon: '🥕', caloriesPer100: 41,  unit: 'g', defaultAmount: 100, nutrients: { vit_a: 0.8, vit_k2: 0.4, vit_c: 0.3, potassium: 0.4, manganese: 0.3 } },
  { id: 'bell_pepper',   name: 'Bell Pepper',         category: 'Vegetables', icon: '🫑', caloriesPer100: 31,  unit: 'g', defaultAmount: 120, nutrients: { vit_c: 1.0, vit_b6: 0.4, vit_b9: 0.3, vit_a: 0.3, vit_e: 0.3 } },
  { id: 'avocado',       name: 'Avocado',             category: 'Vegetables', icon: '🥑', caloriesPer100: 160, unit: 'g', defaultAmount: 100, nutrients: { vit_k2: 0.5, vit_b5: 0.6, vit_b6: 0.5, vit_b9: 0.5, vit_e: 0.6, potassium: 0.7, copper: 0.4 } },
  { id: 'garlic',        name: 'Garlic',              category: 'Vegetables', icon: '🧄', caloriesPer100: 149, unit: 'g', defaultAmount: 20,  nutrients: { vit_b6: 0.6, vit_c: 0.5, manganese: 0.5, selenium: 0.4 } },
  { id: 'kale',          name: 'Kale',                category: 'Vegetables', icon: '🥬', caloriesPer100: 49,  unit: 'g', defaultAmount: 100, nutrients: { vit_k2: 0.9, vit_a: 0.6, vit_c: 0.8, vit_b9: 0.4, calcium: 0.4, manganese: 0.5, copper: 0.3 } },
  { id: 'mushrooms',     name: 'Mushrooms',           category: 'Vegetables', icon: '🍄', caloriesPer100: 22,  unit: 'g', defaultAmount: 100, nutrients: { vit_b2: 0.5, vit_b3: 0.4, vit_b5: 0.5, vit_d: 0.3, selenium: 0.5, copper: 0.5, phosphorus: 0.4 } },
  // ── Fruits ──
  { id: 'blueberries',   name: 'Blueberries',         category: 'Fruits', icon: '🫐', caloriesPer100: 57,  unit: 'g', defaultAmount: 100, nutrients: { vit_c: 0.5, vit_k2: 0.5, vit_e: 0.3, manganese: 0.8 } },
  { id: 'banana',        name: 'Banana',              category: 'Fruits', icon: '🍌', caloriesPer100: 89,  unit: 'g', defaultAmount: 120, nutrients: { vit_b6: 0.6, vit_c: 0.4, potassium: 0.8, magnesium: 0.4, manganese: 0.4 } },
  { id: 'orange',        name: 'Orange',              category: 'Fruits', icon: '🍊', caloriesPer100: 47,  unit: 'g', defaultAmount: 130, nutrients: { vit_c: 0.9, vit_b9: 0.4, potassium: 0.4, calcium: 0.3 } },
  { id: 'apple',         name: 'Apple',               category: 'Fruits', icon: '🍎', caloriesPer100: 52,  unit: 'g', defaultAmount: 180, nutrients: { vit_c: 0.3, potassium: 0.3, boron: 0.5 } },
  { id: 'kiwi',          name: 'Kiwi',                category: 'Fruits', icon: '🥝', caloriesPer100: 61,  unit: 'g', defaultAmount: 100, nutrients: { vit_c: 1.0, vit_k2: 0.5, vit_e: 0.4, potassium: 0.5, copper: 0.3 } },
  { id: 'mango',         name: 'Mango',               category: 'Fruits', icon: '🥭', caloriesPer100: 60,  unit: 'g', defaultAmount: 150, nutrients: { vit_a: 0.5, vit_c: 0.7, vit_b6: 0.3, vit_b9: 0.4, potassium: 0.4 } },
  { id: 'strawberries',  name: 'Strawberries',        category: 'Fruits', icon: '🍓', caloriesPer100: 32,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.9, vit_b9: 0.3, manganese: 0.5, potassium: 0.3 } },
]

const FOOD_BY_CATEGORY = FOOD_LIBRARY.reduce((acc, f) => {
  acc[f.category] = acc[f.category] || []
  acc[f.category].push(f)
  return acc
}, {})

const MEAL_SLOTS = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Post-Workout']
const todayKey = () => `tsm_nutrition3_${new Date().toDateString()}`
function emptyDay() { return { meals: {}, water: 0, notes: '' } }

// foods per slot: [{id, amount}]
function computeTotals(meals) {
  const scores = {}
  ALL_NUTRIENTS.forEach(n => { scores[n.id] = 0 })
  Object.values(meals).forEach(slot => {
    if (!slot?.foods) return
    slot.foods.forEach(({ id, amount }) => {
      const food = FOOD_LIBRARY.find(f => f.id === id)
      if (!food) return
      const multiplier = (amount || 100) / 100
      Object.entries(food.nutrients || {}).forEach(([nid, val]) => {
        scores[nid] = Math.min(1, (scores[nid] || 0) + val * multiplier * 0.35)
      })
    })
  })
  return scores
}

function totalCalories(meals) {
  return Math.round(Object.values(meals).reduce((sum, slot) => {
    if (!slot?.foods) return sum
    return sum + slot.foods.reduce((s, { id, amount }) => {
      const f = FOOD_LIBRARY.find(f => f.id === id)
      return s + (f ? f.caloriesPer100 * (amount || 100) / 100 : 0)
    }, 0)
  }, 0))
}

export default function Nutrition({ mobile }) {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey()) || 'null') || emptyDay() }
    catch { return emptyDay() }
  })
  const [activeMeal, setActiveMeal] = useState(null)
  const [panel, setPanel] = useState(null)
  const [expandedNutrient, setExpandedNutrient] = useState(null)

  useEffect(() => { localStorage.setItem(todayKey(), JSON.stringify(data)) }, [data])

  const addFood = (slot, foodId) => {
    const food = FOOD_LIBRARY.find(f => f.id === foodId)
    if (!food) return
    setData(prev => {
      const slotData = prev.meals[slot] || { foods: [] }
      if (slotData.foods.find(f => f.id === foodId)) return prev
      return { ...prev, meals: { ...prev.meals, [slot]: { ...slotData, foods: [...slotData.foods, { id: foodId, amount: food.defaultAmount }] } } }
    })
  }

  const removeFood = (slot, foodId) => {
    setData(prev => {
      const slotData = prev.meals[slot] || { foods: [] }
      return { ...prev, meals: { ...prev.meals, [slot]: { ...slotData, foods: slotData.foods.filter(f => f.id !== foodId) } } }
    })
  }

  const updateAmount = (slot, foodId, val) => {
    setData(prev => {
      const slotData = prev.meals[slot] || { foods: [] }
      return { ...prev, meals: { ...prev.meals, [slot]: { ...slotData, foods: slotData.foods.map(f => f.id === foodId ? { ...f, amount: Number(val) || 0 } : f) } } }
    })
  }

  const addWater = amt => setData(prev => ({ ...prev, water: Math.max(0, +(prev.water + amt).toFixed(2)) }))

  const scores = computeTotals(data.meals)
  const calories = totalCalories(data.meals)
  const loggedFoodIds = new Set(Object.values(data.meals).flatMap(s => (s?.foods || []).map(f => f.id)))

  const nutrientStatus = id => {
    const s = scores[id] || 0
    if (s >= 0.7) return 'good'
    if (s >= 0.35) return 'partial'
    return 'low'
  }

  const vitaminScore = Math.round(VITAMINS.reduce((s, v) => s + (scores[v.id] || 0), 0) / VITAMINS.length * 100)
  const mineralScore = Math.round(MINERALS.reduce((s, m) => s + (scores[m.id] || 0), 0) / MINERALS.length * 100)
  const overallScore = Math.round((vitaminScore + mineralScore) / 2)

  return (
    <div style={{ padding: mobile ? '16px 14px 20px' : '40px', minHeight: '100vh', background: '#F7F3EE' }}>
      <PageHeader icon="🥩" title="Nutrition Tracker" sub="Log your food and track micronutrient coverage" />

      {/* Overview row */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <MiniRing pct={overallScore} color="#C4A882" size={60} />
          <div>
            <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Overall Score</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{overallScore}%</div>
            <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>daily micronutrients</div>
          </div>
        </div>
        <button onClick={() => setPanel(panel === 'vitamins' ? null : 'vitamins')} style={{ background: panel === 'vitamins' ? '#FFF7ED' : '#FFFFFF', border: panel === 'vitamins' ? '1px solid #FDBA74' : '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left' }}>
          <MiniRing pct={vitaminScore} color="#e8703a" size={60} />
          <div>
            <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Vitamins</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{vitaminScore}%</div>
            <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>tap to see details</div>
          </div>
        </button>
        <button onClick={() => setPanel(panel === 'minerals' ? null : 'minerals')} style={{ background: panel === 'minerals' ? '#F0F9FF' : '#FFFFFF', border: panel === 'minerals' ? '1px solid #7DD3FC' : '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left' }}>
          <MiniRing pct={mineralScore} color="#0ea5e9" size={60} />
          <div>
            <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Minerals</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{mineralScore}%</div>
            <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>tap to see details</div>
          </div>
        </button>
      </div>

      {/* Calories read-only */}
      <div style={{ background: '#1C1917', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '22px' }}>🔥</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#5C5550', textTransform: 'uppercase', letterSpacing: '1px' }}>Calories today (view only)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#F7F3EE' }}>{calories} <span style={{ fontSize: '13px', color: '#5C5550', fontWeight: 400 }}>kcal from logged foods</span></div>
        </div>
        <div style={{ fontSize: '11px', color: '#5C5550', maxWidth: '200px', lineHeight: 1.5 }}>Focus on hitting 100% micronutrients — calories will follow naturally.</div>
      </div>

      {/* Nutrient panel */}
      {panel && (
        <NutrientPanel
          nutrients={panel === 'vitamins' ? VITAMINS : MINERALS}
          scores={scores}
          loggedFoodIds={loggedFoodIds}
          expandedNutrient={expandedNutrient}
          setExpandedNutrient={setExpandedNutrient}
          nutrientStatus={nutrientStatus}
          onClose={() => setPanel(null)}
          mobile={mobile}
        />
      )}

      {/* Water tracker */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A1410', marginBottom: '4px' }}>💧 Water Intake</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0891B2' }}>{data.water}L <span style={{ fontSize: '13px', color: '#9C8E84', fontWeight: 400 }}>/ 2.5L</span></div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0.25, 0.5, 1].map(amt => (
              <button key={amt} onClick={() => addWater(amt)} style={{ background: '#EBF8FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '10px 14px', color: '#0891B2', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+{amt}L</button>
            ))}
            <button onClick={() => addWater(-0.25)} style={{ background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '10px 14px', color: '#9C8E84', fontSize: '13px', cursor: 'pointer' }}>−</button>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '4px' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: '6px', borderRadius: '99px', background: i < Math.round(data.water / 2.5 * 10) ? '#0891B2' : '#EDE8E0', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Meal slots */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Meal Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MEAL_SLOTS.map(slot => {
            const slotData = data.meals[slot]
            const foods = slotData?.foods || []
            const open = activeMeal === slot
            const slotCals = foods.reduce((s, { id, amount }) => {
              const f = FOOD_LIBRARY.find(f => f.id === id)
              return s + (f ? Math.round(f.caloriesPer100 * amount / 100) : 0)
            }, 0)

            return (
              <div key={slot} style={{ borderRadius: '12px', border: `1px solid ${open ? '#C4A882' : '#EDE8E0'}`, overflow: 'hidden', background: open ? '#FFF9F3' : '#FAFAF8' }}>
                <button onClick={() => setActiveMeal(open ? null : slot)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: foods.length > 0 ? '#16A34A' : '#D8D0C5', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: foods.length > 0 ? '#1A1410' : '#9C8E84' }}>{slot}</div>
                    {foods.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#6B5E54', marginTop: '2px' }}>
                        {foods.map(({ id }) => FOOD_LIBRARY.find(f => f.id === id)?.name).filter(Boolean).join(', ')} · {slotCals} kcal
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#BEB5AE' }}>{open ? '▲' : '▼'}</span>
                </button>

                {open && (
                  <div style={{ padding: '0 16px 16px' }}>
                    {/* Logged items with amount controls */}
                    {foods.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Logged</div>
                        {foods.map(({ id, amount }) => {
                          const food = FOOD_LIBRARY.find(f => f.id === id)
                          if (!food) return null
                          const kcal = Math.round(food.caloriesPer100 * amount / 100)
                          return (
                            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#FFFFFF', borderRadius: '10px', padding: '10px 12px', border: '1px solid #EDE8E0' }}>
                              <span style={{ fontSize: '20px' }}>{food.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1410' }}>{food.name}</div>
                                <div style={{ fontSize: '11px', color: '#9C8E84' }}>{kcal} kcal</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="number"
                                  value={amount}
                                  min={1}
                                  onChange={e => updateAmount(slot, id, e.target.value)}
                                  style={{ width: '70px', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '7px', padding: '5px 8px', color: '#1A1410', fontSize: '13px', outline: 'none', textAlign: 'center' }}
                                />
                                <span style={{ fontSize: '12px', color: '#9C8E84', minWidth: '16px' }}>{food.unitHint || food.unit}</span>
                                <button onClick={() => removeFood(slot, id)} style={{ background: 'none', border: 'none', color: '#D8CFC5', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>×</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <FoodPicker selectedIds={new Set(foods.map(f => f.id))} onAdd={fid => addFood(slot, fid)} mobile={mobile} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily notes */}
      <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Daily Notes</h3>
        <textarea
          placeholder="How did your nutrition feel today? Any cravings, energy levels, etc..."
          value={data.notes}
          onChange={e => setData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          style={{ width: '100%', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '10px', padding: '12px 16px', color: '#1A1410', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  )
}

// ─── Mini Ring ────────────────────────────────────────────────────────────────
function MiniRing({ pct, color, size = 56 }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE8E0" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size * 0.18} fontWeight={700} fill="#1A1410">{pct}%</text>
    </svg>
  )
}

// ─── Nutrient Panel ───────────────────────────────────────────────────────────
function NutrientPanel({ nutrients, scores, loggedFoodIds, expandedNutrient, setExpandedNutrient, nutrientStatus, onClose }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410' }}>
          {nutrients === VITAMINS ? 'Vitamins' : 'Minerals'} Breakdown
        </h3>
        <button onClick={onClose} style={{ background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#6B5E54' }}>Close ×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {nutrients.map(n => {
          const score = scores[n.id] || 0
          const pct = Math.min(100, Math.round(score * 100))
          const status = nutrientStatus(n.id)
          const isExpanded = expandedNutrient === n.id
          const sources = FOOD_LIBRARY.filter(f => (f.nutrients[n.id] || 0) > 0.3).sort((a, b) => (b.nutrients[n.id] || 0) - (a.nutrients[n.id] || 0))

          return (
            <div key={n.id} style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${status === 'good' ? '#BBF7D0' : status === 'partial' ? '#FEF3C7' : '#EDE8E0'}` }}>
              <button onClick={() => setExpandedNutrient(isExpanded ? null : n.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: status === 'good' ? '#F0FAF4' : status === 'partial' ? '#FFFBEB' : '#FAFAF8', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: status === 'good' ? '#16A34A' : status === 'partial' ? '#D97706' : '#D1D5DB', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1410' }}>{n.label}</span>
                    <span style={{ fontSize: '12px', color: n.color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#EDE8E0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: n.color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#BEB5AE' }}>{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div style={{ padding: '12px 14px', background: '#FFFFFF', borderTop: '1px solid #EDE8E0' }}>
                  <div style={{ fontSize: '11px', color: '#9C8E84', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best animal sources:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {sources.map(f => {
                      const logged = loggedFoodIds.has(f.id)
                      return (
                        <div key={f.id} style={{ padding: '5px 10px', borderRadius: '99px', fontSize: '12px', background: logged ? '#F0FAF4' : '#F7F3EE', border: `1px solid ${logged ? '#BBF7D0' : '#EDE8E0'}`, color: logged ? '#166534' : '#6B5E54', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{f.icon}</span>
                          <span>{f.name}</span>
                          {logged && <span style={{ fontWeight: 700 }}>✓</span>}
                        </div>
                      )
                    })}
                  </div>
                  {pct < 70 && sources.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span>
                      <span>Add more {sources.slice(0, 2).map(f => f.name).join(' or ')} to hit your target</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Food Picker ──────────────────────────────────────────────────────────────
function FoodPicker({ selectedIds, onAdd, mobile }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...Object.keys(FOOD_BY_CATEGORY)]
  const filtered = FOOD_LIBRARY.filter(f => {
    const matchCat = activeCategory === 'All' || f.category === activeCategory
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Add food</div>
      <input type="text" placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '8px 12px', color: '#1A1410', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '4px 10px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontSize: '11px', background: activeCategory === cat ? '#1C1917' : '#F7F3EE', color: activeCategory === cat ? '#F7F3EE' : '#6B5E54', fontWeight: activeCategory === cat ? 600 : 400 }}>
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(155px, 1fr))', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
        {filtered.map(food => {
          const selected = selectedIds.has(food.id)
          return (
            <button key={food.id} onClick={() => !selected && onAdd(food.id)} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${selected ? '#16A34A' : '#EDE8E0'}`, background: selected ? '#F0FAF4' : '#FFFFFF', cursor: selected ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s', opacity: selected ? 0.75 : 1 }}>
              <span style={{ fontSize: '18px' }}>{food.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: selected ? '#166534' : '#1A1410', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.name}</div>
                <div style={{ fontSize: '10px', color: '#BEB5AE', marginTop: '1px' }}>{food.caloriesPer100} kcal/100{food.unit}</div>
              </div>
              {selected && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, flexShrink: 0 }}>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
