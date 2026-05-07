import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

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

// ─── Food library — nutrients scored per 100g/ml ─────────────────────────────
// countable: true = item uses unit count (qty) not grams in the UI
// gramsPerUnit: average weight per single unit (for calorie/nutrient math)
// unitName: singular label (e.g. 'egg', 'strip')
const FOOD_LIBRARY = [
  // ── Beef ── (USDA FDC — scores = min(1.0, amount_per_100g ÷ RDA))
  { id: 'ribeye',      name: 'Ribeye Steak',        category: 'Beef',         icon: '🥩', caloriesPer100: 291, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.10, vit_b3: 0.28, vit_b5: 0.10, vit_b6: 0.22, vit_b12: 1.0,  choline: 0.12, iron: 0.24, zinc: 0.39, selenium: 0.40, phosphorus: 0.26 } },
  { id: 'sirloin',     name: 'Sirloin Steak',       category: 'Beef',         icon: '🥩', caloriesPer100: 207, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.12, vit_b3: 0.41, vit_b5: 0.11, vit_b6: 0.29, vit_b12: 0.80, choline: 0.14, iron: 0.28, zinc: 0.27, selenium: 0.40, phosphorus: 0.30 } },
  { id: 'rump',        name: 'Rump Steak',          category: 'Beef',         icon: '🥩', caloriesPer100: 195, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.13, vit_b3: 0.37, vit_b5: 0.11, vit_b6: 0.27, vit_b12: 0.92, choline: 0.13, iron: 0.25, zinc: 0.37, selenium: 0.36, phosphorus: 0.29 } },
  { id: 'tbone',       name: 'T-Bone Steak',        category: 'Beef',         icon: '🥩', caloriesPer100: 244, unit: 'g', defaultAmount: 300, nutrients: { vit_b2: 0.09, vit_b3: 0.27, vit_b5: 0.10, vit_b6: 0.21, vit_b12: 0.92, choline: 0.11, iron: 0.23, zinc: 0.41, selenium: 0.40, phosphorus: 0.25 } },
  { id: 'fillet',      name: 'Fillet / Tenderloin', category: 'Beef',         icon: '🥩', caloriesPer100: 215, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.08, vit_b3: 0.25, vit_b5: 0.09, vit_b6: 0.19, vit_b12: 0.73, choline: 0.11, iron: 0.19, zinc: 0.25, selenium: 0.33, phosphorus: 0.24 } },
  { id: 'brisket',     name: 'Brisket',             category: 'Beef',         icon: '🥩', caloriesPer100: 250, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.10, vit_b3: 0.23, vit_b5: 0.09, vit_b6: 0.16, vit_b12: 1.0,  choline: 0.10, iron: 0.28, zinc: 0.46, selenium: 0.38, phosphorus: 0.22 } },
  { id: 'ground_beef', name: 'Ground Beef (80/20)', category: 'Beef',         icon: '🥩', caloriesPer100: 254, unit: 'g', defaultAmount: 150, nutrients: { vit_b2: 0.12, vit_b3: 0.28, vit_b5: 0.09, vit_b6: 0.21, vit_b12: 0.95, choline: 0.13, iron: 0.28, zinc: 0.42, selenium: 0.33, phosphorus: 0.24 } },
  { id: 'beef_liver',  name: 'Beef Liver',          category: 'Beef',         icon: '🫀', caloriesPer100: 175, unit: 'g', defaultAmount: 25,  nutrients: { vit_a: 1.0, vit_b1: 0.16, vit_b2: 1.0, vit_b3: 0.86, vit_b5: 1.0, vit_b6: 0.64, vit_b7: 1.0, vit_b9: 0.73, vit_b12: 1.0, choline: 0.77, copper: 1.0, iron: 0.61, zinc: 0.36, selenium: 0.65, phosphorus: 0.55, cobalt: 1.0 } },
  { id: 'beef_heart',  name: 'Beef Heart',          category: 'Beef',         icon: '🫀', caloriesPer100: 112, unit: 'g', defaultAmount: 100, nutrients: { vit_b1: 0.24, vit_b2: 0.71, vit_b3: 0.47, vit_b5: 0.37, vit_b6: 0.17, vit_b12: 1.0,  choline: 0.40, iron: 0.54, copper: 0.47, selenium: 0.38, phosphorus: 0.30 } },
  { id: 'beef_kidney', name: 'Beef Kidney',         category: 'Beef',         icon: '🫘', caloriesPer100: 99,  unit: 'g', defaultAmount: 100, nutrients: { vit_a: 0.13, vit_b1: 0.31, vit_b2: 1.0, vit_b3: 0.53, vit_b5: 0.66, vit_b6: 0.39, vit_b7: 1.0, vit_b9: 0.25, vit_b12: 1.0, vit_c: 0.12, choline: 0.63, iron: 0.55, zinc: 0.17, selenium: 1.0, copper: 0.49, phosphorus: 0.37 } },
  { id: 'beef_tongue', name: 'Beef Tongue',         category: 'Beef',         icon: '🥩', caloriesPer100: 224, unit: 'g', defaultAmount: 100, nutrients: { vit_b2: 0.22, vit_b3: 0.31, vit_b5: 0.15, vit_b12: 1.0,  choline: 0.14, iron: 0.31, zinc: 0.28, selenium: 0.24, phosphorus: 0.25 } },
  { id: 'beef_bone_broth',    name: 'Beef Bone Broth',    category: 'Beef',     icon: '🍲', caloriesPer100: 15,  unit: 'ml', defaultAmount: 300, nutrients: { sodium: 0.10, potassium: 0.02, phosphorus: 0.02 } },
  { id: 'chicken_bone_broth', name: 'Chicken Bone Broth', category: 'Poultry',  icon: '🍲', caloriesPer100: 12,  unit: 'ml', defaultAmount: 300, nutrients: { sodium: 0.09, potassium: 0.02 } },
  // ── Lamb ──
  { id: 'lamb_chop',   name: 'Lamb Chops',          category: 'Lamb',         icon: '🍖', caloriesPer100: 294, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.20, vit_b3: 0.37, vit_b5: 0.13, vit_b6: 0.12, vit_b12: 0.97, choline: 0.15, iron: 0.23, zinc: 0.37, selenium: 0.44, phosphorus: 0.25 } },
  { id: 'lamb_leg',    name: 'Leg of Lamb',         category: 'Lamb',         icon: '🍖', caloriesPer100: 217, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.16, vit_b3: 0.36, vit_b5: 0.12, vit_b6: 0.09, vit_b12: 1.0,  choline: 0.16, iron: 0.21, zinc: 0.36, selenium: 0.53, phosphorus: 0.26 } },
  { id: 'lamb_liver',  name: 'Lamb Liver',          category: 'Lamb',         icon: '🫀', caloriesPer100: 168, unit: 'g', defaultAmount: 25,  nutrients: { vit_a: 1.0, vit_b1: 0.27, vit_b2: 1.0, vit_b3: 1.0, vit_b5: 1.0, vit_b6: 0.37, vit_b7: 1.0, vit_b9: 0.99, vit_b12: 1.0, choline: 0.88, copper: 1.0, iron: 0.96, zinc: 0.36, selenium: 1.0, phosphorus: 0.54, cobalt: 1.0 } },
  // ── Pork ──
  { id: 'pork_chop',   name: 'Pork Chops',          category: 'Pork',         icon: '🥩', caloriesPer100: 231, unit: 'g', defaultAmount: 200, nutrients: { vit_b1: 0.78, vit_b2: 0.21, vit_b3: 0.39, vit_b5: 0.18, vit_b6: 0.35, vit_b12: 0.23, choline: 0.15, iron: 0.11, zinc: 0.15, selenium: 0.65, phosphorus: 0.30 } },
  { id: 'pork_loin',   name: 'Pork Loin',           category: 'Pork',         icon: '🥩', caloriesPer100: 242, unit: 'g', defaultAmount: 200, nutrients: { vit_b1: 0.83, vit_b2: 0.22, vit_b3: 0.44, vit_b5: 0.22, vit_b6: 0.33, vit_b12: 0.31, choline: 0.18, zinc: 0.21, selenium: 0.71, phosphorus: 0.33 } },
  { id: 'pork_belly',  name: 'Pork Belly',          category: 'Pork',         icon: '🥓', caloriesPer100: 518, unit: 'g', defaultAmount: 150, nutrients: { vit_b1: 0.35, vit_b2: 0.10, vit_b3: 0.22, vit_b6: 0.14, vit_b12: 0.30, selenium: 0.38, phosphorus: 0.18 } },
  { id: 'bacon',       name: 'Bacon',               category: 'Pork',         icon: '🥓', caloriesPer100: 540, unit: 'g', defaultAmount: 80,  nutrients: { vit_b1: 0.33, vit_b2: 0.11, vit_b3: 0.33, vit_b6: 0.20, vit_b12: 0.37, selenium: 0.56, phosphorus: 0.32, sodium: 0.75 } },
  // ── Poultry ──
  { id: 'chicken_breast', name: 'Chicken Breast',   category: 'Poultry',      icon: '🍗', caloriesPer100: 165, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.07, vit_b3: 0.71, vit_b5: 0.20, vit_b6: 0.53, vit_b12: 0.13, choline: 0.13, selenium: 0.50, phosphorus: 0.31 } },
  { id: 'chicken_thigh',  name: 'Chicken Thigh',    category: 'Poultry',      icon: '🍗', caloriesPer100: 209, unit: 'g', defaultAmount: 180, nutrients: { vit_b2: 0.15, vit_b3: 0.42, vit_b5: 0.23, vit_b6: 0.26, vit_b12: 0.15, choline: 0.13, iron: 0.13, zinc: 0.15, selenium: 0.37, phosphorus: 0.26 } },
  { id: 'turkey',      name: 'Turkey Breast',       category: 'Poultry',      icon: '🦃', caloriesPer100: 157, unit: 'g', defaultAmount: 200, nutrients: { vit_b2: 0.13, vit_b3: 0.38, vit_b5: 0.17, vit_b6: 0.44, vit_b12: 0.15, choline: 0.14, iron: 0.14, zinc: 0.15, selenium: 0.45, phosphorus: 0.29 } },
  { id: 'duck',        name: 'Duck',                category: 'Poultry',      icon: '🍗', caloriesPer100: 337, unit: 'g', defaultAmount: 180, nutrients: { vit_b1: 0.24, vit_b2: 0.23, vit_b3: 0.36, vit_b5: 0.24, vit_b6: 0.11, vit_b12: 0.13, iron: 0.34, zinc: 0.14, selenium: 0.27, phosphorus: 0.29 } },
  { id: 'chicken_liver', name: 'Chicken Liver',     category: 'Poultry',      icon: '🫀', caloriesPer100: 172, unit: 'g', defaultAmount: 25,  nutrients: { vit_a: 1.0, vit_b1: 0.24, vit_b2: 1.0, vit_b3: 0.64, vit_b5: 1.0, vit_b6: 0.36, vit_b7: 1.0, vit_b9: 1.0, vit_b12: 1.0, vit_c: 0.31, choline: 0.53, iron: 1.0, zinc: 0.24, selenium: 1.0, copper: 0.54, phosphorus: 0.42 } },
  // ── Fish & Seafood ──
  { id: 'salmon',      name: 'Salmon',              category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 208, unit: 'g', defaultAmount: 180, nutrients: { vit_b1: 0.20, vit_b2: 0.20, vit_b3: 0.49, vit_b5: 0.33, vit_b6: 0.35, vit_b7: 0.17, vit_b12: 1.0, vit_d: 0.73, vit_e: 0.24, choline: 0.15, selenium: 0.57, phosphorus: 0.34, potassium: 0.14, iodine: 0.13 } },
  { id: 'tuna',        name: 'Tuna (canned)',       category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 132, unit: 'g', defaultAmount: 150, nutrients: { vit_b3: 0.83, vit_b6: 0.25, vit_b12: 1.0,  vit_d: 0.11, selenium: 1.0,  phosphorus: 0.29 } },
  { id: 'sardines',    name: 'Sardines',            category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 208, unit: 'g', defaultAmount: 100, nutrients: { vit_b2: 0.18, vit_b3: 0.33, vit_b5: 0.13, vit_b12: 1.0,  vit_d: 0.32, vit_e: 0.14, calcium: 0.38, iron: 0.37, selenium: 0.96, phosphorus: 0.70, iodine: 0.25 } },
  { id: 'mackerel',    name: 'Mackerel',            category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 205, unit: 'g', defaultAmount: 180, nutrients: { vit_b1: 0.15, vit_b2: 0.28, vit_b3: 0.57, vit_b5: 0.18, vit_b6: 0.24, vit_b12: 1.0,  vit_d: 1.0,  selenium: 0.94, phosphorus: 0.31, iodine: 0.27 } },
  { id: 'cod',         name: 'Cod',                 category: 'Fish & Seafood', icon: '🐟', caloriesPer100: 82,  unit: 'g', defaultAmount: 200, nutrients: { vit_b3: 0.13, vit_b6: 0.15, vit_b12: 0.38, vit_d: 0.07, selenium: 0.48, phosphorus: 0.31, iodine: 0.70 } },
  { id: 'oysters',     name: 'Oysters',             category: 'Fish & Seafood', icon: '🦪', caloriesPer100: 68,  unit: 'g', defaultAmount: 100, nutrients: { vit_b2: 0.12, vit_b5: 0.10, vit_b12: 1.0,  vit_d: 0.53, zinc: 1.0, copper: 1.0, iron: 0.83, selenium: 1.0,  iodine: 1.0,  cobalt: 0.70 } },
  { id: 'shrimp',      name: 'Shrimp',              category: 'Fish & Seafood', icon: '🦐', caloriesPer100: 99,  unit: 'g', defaultAmount: 150, nutrients: { vit_b3: 0.16, vit_b12: 0.59, choline: 0.15, selenium: 0.69, phosphorus: 0.29, iodine: 0.23 } },
  // ── Eggs & Dairy ──
  { id: 'eggs_whole',  name: 'Whole Eggs',          category: 'Eggs & Dairy',  icon: '🥚', caloriesPer100: 155, unit: 'g', defaultAmount: 110, countable: true, gramsPerUnit: 55, unitName: 'egg', nutrients: { vit_a: 0.17, vit_b2: 0.35, vit_b5: 0.29, vit_b6: 0.10, vit_b7: 0.67, vit_b9: 0.11, vit_b12: 0.37, vit_d: 0.13, vit_k2: 0.38, choline: 0.53, iron: 0.22, zinc: 0.12, selenium: 0.56, phosphorus: 0.28, iodine: 0.18 } },
  { id: 'milk_whole',  name: 'Whole Milk',          category: 'Eggs & Dairy',  icon: '🥛', caloriesPer100: 61,  unit: 'ml', defaultAmount: 250, nutrients: { vit_a: 0.05, vit_b2: 0.13, vit_b5: 0.06, vit_b12: 0.18, vit_d: 0.09, calcium: 0.11, phosphorus: 0.12, iodine: 0.31 } },
  { id: 'greek_yogurt',name: 'Greek Yogurt',        category: 'Eggs & Dairy',  icon: '🥛', caloriesPer100: 59,  unit: 'g',  defaultAmount: 200, nutrients: { vit_b2: 0.16, vit_b5: 0.09, vit_b12: 0.31, calcium: 0.10, phosphorus: 0.16, iodine: 0.23 } },
  { id: 'kefir',       name: 'Kefir',               category: 'Eggs & Dairy',  icon: '🥛', caloriesPer100: 52,  unit: 'ml', defaultAmount: 250, nutrients: { vit_b2: 0.13, vit_b12: 0.21, vit_k2: 0.22, calcium: 0.11, phosphorus: 0.13, iodine: 0.23 } },
  { id: 'parmesan',    name: 'Parmesan',            category: 'Eggs & Dairy',  icon: '🧀', caloriesPer100: 431, unit: 'g',  defaultAmount: 30,  nutrients: { vit_a: 0.19, vit_b2: 0.26, vit_b12: 0.68, vit_k2: 1.0, calcium: 1.0, phosphorus: 0.99, selenium: 0.41, zinc: 0.25 } },
  { id: 'cheddar',     name: 'Cheddar Cheese',      category: 'Eggs & Dairy',  icon: '🧀', caloriesPer100: 403, unit: 'g',  defaultAmount: 40,  nutrients: { vit_a: 0.29, vit_b2: 0.22, vit_b12: 0.35, vit_k2: 0.44, calcium: 0.71, phosphorus: 0.65, selenium: 0.25, zinc: 0.28 } },
  { id: 'gouda',       name: 'Gouda Cheese',        category: 'Eggs & Dairy',  icon: '🧀', caloriesPer100: 356, unit: 'g',  defaultAmount: 40,  nutrients: { vit_a: 0.23, vit_b2: 0.13, vit_b12: 0.64, vit_k2: 1.0, calcium: 0.70, phosphorus: 0.78, zinc: 0.35 } },
  { id: 'mozzarella',  name: 'Mozzarella',          category: 'Eggs & Dairy',  icon: '🧀', caloriesPer100: 280, unit: 'g',  defaultAmount: 50,  nutrients: { vit_a: 0.17, vit_b2: 0.22, vit_b12: 0.28, vit_k2: 0.18, calcium: 0.51, phosphorus: 0.51, selenium: 0.31, zinc: 0.27 } },
  { id: 'butter',      name: 'Butter',              category: 'Eggs & Dairy',  icon: '🧈', caloriesPer100: 717, unit: 'g',  defaultAmount: 20,  nutrients: { vit_a: 0.76, vit_d: 0.10, vit_e: 0.15, vit_k2: 0.47 } },
  { id: 'heavy_cream', name: 'Heavy Cream',         category: 'Eggs & Dairy',  icon: '🥛', caloriesPer100: 345, unit: 'ml', defaultAmount: 50,  nutrients: { vit_a: 0.32, vit_d: 0.05, vit_k2: 0.18, calcium: 0.07 } },
  // ── Nuts & Seeds ──
  { id: 'brazil_nuts', name: 'Brazil Nuts',         category: 'Nuts & Seeds',  icon: '🌰', caloriesPer100: 656, unit: 'g',  defaultAmount: 30,  nutrients: { vit_b1: 0.52, vit_e: 0.38, calcium: 0.16, magnesium: 0.90, phosphorus: 1.0, copper: 1.0, zinc: 0.37, manganese: 0.53, selenium: 1.0 } },
  { id: 'almonds',     name: 'Almonds',             category: 'Nuts & Seeds',  icon: '🌰', caloriesPer100: 579, unit: 'g',  defaultAmount: 30,  nutrients: { vit_b1: 0.18, vit_b2: 0.68, vit_e: 1.0, calcium: 0.26, magnesium: 0.64, manganese: 0.95, copper: 1.0, phosphorus: 0.69, zinc: 0.28, iron: 0.46 } },
  { id: 'walnuts',     name: 'Walnuts',             category: 'Nuts & Seeds',  icon: '🌰', caloriesPer100: 654, unit: 'g',  defaultAmount: 30,  nutrients: { vit_b1: 0.28, vit_b6: 0.32, vit_b9: 0.25, magnesium: 0.38, phosphorus: 0.49, copper: 1.0, manganese: 1.0, zinc: 0.28, iron: 0.36 } },
  { id: 'cashews',     name: 'Cashews',             category: 'Nuts & Seeds',  icon: '🌰', caloriesPer100: 553, unit: 'g',  defaultAmount: 30,  nutrients: { vit_b1: 0.35, vit_b5: 0.17, vit_b6: 0.25, magnesium: 0.70, phosphorus: 0.85, copper: 1.0, zinc: 0.53, iron: 0.84, manganese: 0.72, selenium: 0.36 } },
  { id: 'pecans',      name: 'Pecans',              category: 'Nuts & Seeds',  icon: '🌰', caloriesPer100: 691, unit: 'g',  defaultAmount: 30,  nutrients: { vit_b1: 0.55, vit_b5: 0.17, vit_b6: 0.12, magnesium: 0.29, phosphorus: 0.40, copper: 1.0, zinc: 0.41, manganese: 1.0, iron: 0.32 } },
  { id: 'macadamia',   name: 'Macadamia Nuts',      category: 'Nuts & Seeds',  icon: '🌰', caloriesPer100: 718, unit: 'g',  defaultAmount: 30,  nutrients: { vit_b1: 1.0, vit_b6: 0.16, magnesium: 0.31, phosphorus: 0.27, copper: 0.84, manganese: 1.0, iron: 0.46, zinc: 0.12 } },
  // ── Vegetables ── (note: leafy greens contain K1/phylloquinone, NOT K2/menaquinones)
  { id: 'spinach',     name: 'Spinach',             category: 'Vegetables',    icon: '🥬', caloriesPer100: 23,  unit: 'g', defaultAmount: 100, nutrients: { vit_a: 0.52, vit_b2: 0.15, vit_b9: 0.49, vit_c: 0.31, vit_e: 0.14, calcium: 0.10, magnesium: 0.19, iron: 0.34, potassium: 0.16, manganese: 0.39 } },
  { id: 'sweet_potato',name: 'Sweet Potato',        category: 'Vegetables',    icon: '🍠', caloriesPer100: 86,  unit: 'g', defaultAmount: 150, nutrients: { vit_a: 1.0,  vit_b5: 0.16, vit_b6: 0.17, vit_c: 0.19, potassium: 0.10, manganese: 0.11 } },
  { id: 'carrots',     name: 'Carrots',             category: 'Vegetables',    icon: '🥕', caloriesPer100: 41,  unit: 'g', defaultAmount: 100, nutrients: { vit_a: 0.93, vit_b6: 0.08, vit_c: 0.07, potassium: 0.09, manganese: 0.06 } },
  { id: 'bell_pepper', name: 'Bell Pepper',         category: 'Vegetables',    icon: '🫑', caloriesPer100: 31,  unit: 'g', defaultAmount: 120, nutrients: { vit_a: 0.17, vit_b6: 0.17, vit_b9: 0.12, vit_c: 1.0,  vit_e: 0.11, potassium: 0.06 } },
  { id: 'avocado',     name: 'Avocado',             category: 'Vegetables',    icon: '🥑', caloriesPer100: 160, unit: 'g', defaultAmount: 100, nutrients: { vit_b5: 0.28, vit_b6: 0.15, vit_b9: 0.20, vit_c: 0.11, vit_e: 0.14, potassium: 0.14, copper: 0.21 } },
  { id: 'garlic',      name: 'Garlic',              category: 'Vegetables',    icon: '🧄', caloriesPer100: 149, unit: 'g', defaultAmount: 20,  nutrients: { vit_b1: 0.17, vit_b6: 0.73, vit_c: 0.35, calcium: 0.18, manganese: 0.73, selenium: 0.26 } },
  { id: 'kale',        name: 'Kale',                category: 'Vegetables',    icon: '🥬', caloriesPer100: 49,  unit: 'g', defaultAmount: 100, nutrients: { vit_a: 0.27, vit_b2: 0.10, vit_b6: 0.16, vit_b9: 0.35, vit_c: 1.0,  calcium: 0.25, magnesium: 0.08, potassium: 0.10, manganese: 0.29, copper: 0.32 } },
  { id: 'sauerkraut',  name: 'Sauerkraut',          category: 'Vegetables',    icon: '🥬', caloriesPer100: 19,  unit: 'g', defaultAmount: 100, nutrients: { vit_c: 0.16, vit_k2: 0.16, vit_b9: 0.06, iron: 0.19, manganese: 0.07, sodium: 0.29 } },
  // ── Fruits ──
  { id: 'blueberries', name: 'Blueberries',         category: 'Fruits',        icon: '🫐', caloriesPer100: 57,  unit: 'g', defaultAmount: 100, nutrients: { vit_c: 0.11, vit_e: 0.04, manganese: 0.15 } },
  { id: 'banana',      name: 'Banana',              category: 'Fruits',        icon: '🍌', caloriesPer100: 89,  unit: 'g', defaultAmount: 120, nutrients: { vit_b6: 0.22, vit_c: 0.10, potassium: 0.10, magnesium: 0.06, manganese: 0.12 } },
  { id: 'orange',      name: 'Orange',              category: 'Fruits',        icon: '🍊', caloriesPer100: 47,  unit: 'g', defaultAmount: 130, nutrients: { vit_c: 0.59, vit_b9: 0.08, potassium: 0.05, calcium: 0.04 } },
  { id: 'apple',       name: 'Apple',               category: 'Fruits',        icon: '🍎', caloriesPer100: 52,  unit: 'g', defaultAmount: 180, nutrients: { vit_c: 0.05, potassium: 0.03 } },
  { id: 'kiwi',        name: 'Kiwi',                category: 'Fruits',        icon: '🥝', caloriesPer100: 61,  unit: 'g', defaultAmount: 100, nutrients: { vit_c: 1.0,  vit_b9: 0.06, vit_e: 0.10, potassium: 0.09, copper: 0.14 } },
  { id: 'mango',       name: 'Mango',               category: 'Fruits',        icon: '🥭', caloriesPer100: 60,  unit: 'g', defaultAmount: 150, nutrients: { vit_a: 0.06, vit_b9: 0.11, vit_c: 0.40, potassium: 0.05 } },
  { id: 'strawberries',name: 'Strawberries',        category: 'Fruits',        icon: '🍓', caloriesPer100: 32,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.65, vit_b9: 0.06, manganese: 0.17, potassium: 0.04 } },
  { id: 'dragonfruit', name: 'Dragon Fruit',        category: 'Fruits',        icon: '🐉', caloriesPer100: 60,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.10, iron: 0.08, magnesium: 0.04 } },
  { id: 'white_grapes',name: 'White Grapes',        category: 'Fruits',        icon: '🍇', caloriesPer100: 67,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.04, potassium: 0.05, copper: 0.21 } },
  { id: 'red_grapes',  name: 'Red Grapes',          category: 'Fruits',        icon: '🍇', caloriesPer100: 67,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.04, potassium: 0.05, copper: 0.21 } },
  { id: 'pomegranate', name: 'Pomegranate',         category: 'Fruits',        icon: '🍎', caloriesPer100: 83,  unit: 'g', defaultAmount: 100, nutrients: { vit_b9: 0.10, vit_c: 0.11, potassium: 0.07, copper: 0.18 } },
  { id: 'papaya',      name: 'Papaya',              category: 'Fruits',        icon: '🍈', caloriesPer100: 43,  unit: 'g', defaultAmount: 150, nutrients: { vit_c: 0.69, vit_b9: 0.09, potassium: 0.05 } },
  // ── Grains ──
  { id: 'white_rice',  name: 'White Rice (cooked)', category: 'Grains',        icon: '🍚', caloriesPer100: 130, unit: 'g', defaultAmount: 150, nutrients: { vit_b1: 0.15, vit_b3: 0.09, manganese: 0.15, phosphorus: 0.06, selenium: 0.14 } },
  { id: 'brown_rice',  name: 'Brown Rice (cooked)', category: 'Grains',        icon: '🍚', caloriesPer100: 112, unit: 'g', defaultAmount: 150, nutrients: { vit_b1: 0.08, vit_b3: 0.10, vit_b6: 0.09, magnesium: 0.10, phosphorus: 0.12, manganese: 0.49, selenium: 0.18 } },
  // ── Goat's Dairy ──
  { id: 'goats_milk',   name: "Goat's Milk",        category: "Goat's Dairy",  icon: '🥛', caloriesPer100: 69,  unit: 'ml', defaultAmount: 250, nutrients: { vit_a: 0.06, vit_b2: 0.16, vit_b5: 0.06, vit_b12: 0.05, calcium: 0.13, phosphorus: 0.16, potassium: 0.06, iodine: 0.10 } },
  { id: 'goats_yoghurt',name: "Goat's Yoghurt",     category: "Goat's Dairy",  icon: '🫙', caloriesPer100: 59,  unit: 'g',  defaultAmount: 150, nutrients: { vit_b2: 0.16, vit_b12: 0.03, calcium: 0.12, phosphorus: 0.19, potassium: 0.04, iodine: 0.07 } },
  { id: 'goats_kefir',  name: "Goat's Kefir",       category: "Goat's Dairy",  icon: '🥛', caloriesPer100: 52,  unit: 'ml', defaultAmount: 200, nutrients: { vit_a: 0.06, vit_b2: 0.16, vit_b12: 0.05, vit_k2: 0.11, calcium: 0.12, phosphorus: 0.16, potassium: 0.06, iodine: 0.07 } },
  // ── Pantry ──
  { id: 'raw_honey',   name: 'Raw Honey',           category: 'Pantry',        icon: '🍯', caloriesPer100: 304, unit: 'g',  defaultAmount: 20,  nutrients: { manganese: 0.03, copper: 0.04, potassium: 0.01 } },
  { id: 'cacao_powder',name: 'Cacao Powder',        category: 'Pantry',        icon: '🍫', caloriesPer100: 228, unit: 'g',  defaultAmount: 15,  nutrients: { magnesium: 1.0, iron: 1.0, copper: 1.0, manganese: 1.0, phosphorus: 1.0, zinc: 0.62, potassium: 0.44, selenium: 0.26 } },
  { id: 'coconut_water',name: 'Coconut Water',      category: 'Pantry',        icon: '🥥', caloriesPer100: 19,  unit: 'ml', defaultAmount: 330, nutrients: { magnesium: 0.06, potassium: 0.07, sodium: 0.05, manganese: 0.06 } },
  { id: 'coconut_oil', name: 'Coconut Oil',         category: 'Pantry',        icon: '🥥', caloriesPer100: 862, unit: 'g',  defaultAmount: 15,  nutrients: { vit_e: 0.01 } },
  { id: 'olive_oil',   name: 'Olive Oil',           category: 'Pantry',        icon: '🫒', caloriesPer100: 884, unit: 'ml', defaultAmount: 15,  nutrients: { vit_e: 0.96 } },
  { id: 'apple_cider_vinegar', name: 'Apple Cider Vinegar', category: 'Pantry', icon: '🍶', caloriesPer100: 22,  unit: 'ml', defaultAmount: 15,  nutrients: { potassium: 0.02 } },
]

const FOOD_BY_CATEGORY = FOOD_LIBRARY.reduce((acc, f) => {
  acc[f.category] = acc[f.category] || []
  acc[f.category].push(f)
  return acc
}, {})

const MEAL_SLOTS = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Post-Workout']

function emptyDay() { return { meals: {}, water: 0, notes: '' } }

// Returns today as YYYY-MM-DD in local time
function todayLocal() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function friendlyDate(dateStr) {
  const today = todayLocal()
  if (dateStr === today) return 'Today'
  if (dateStr === shiftDate(today, -1)) return 'Yesterday'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ─── Nutrient totals ──────────────────────────────────────────────────────────
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
        scores[nid] = Math.min(1, (scores[nid] || 0) + val * multiplier)
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

// ─── Nutrition Component ──────────────────────────────────────────────────────
export default function Nutrition({ user, mobile }) {
  const [selectedDate, setSelectedDate] = useState(todayLocal)
  const [data, setData] = useState(emptyDay())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeMeal, setActiveMeal] = useState(null)
  const [panel, setPanel] = useState(null)
  const [expandedNutrient, setExpandedNutrient] = useState(null)
  const saveTimer = useRef(null)
  const isToday = selectedDate === todayLocal()
  const [weekData, setWeekData] = useState([])

  // Load last 7 days for the progress chart
  useEffect(() => {
    const loadWeek = async () => {
      const today = new Date()
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (6 - i))
        const off = d.getTimezoneOffset()
        const iso = new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
        return { iso, label: d.toLocaleDateString('en-US', { weekday: 'short' }) }
      })
      if (user) {
        const { data: rows } = await supabase
          .from('nutrition_logs')
          .select('date, meals')
          .eq('user_id', user.id)
          .in('date', days.map(d => d.iso))
        setWeekData(days.map(({ iso, label }) => {
          const row = rows?.find(r => r.date === iso)
          if (!row?.meals) return { iso, label, pct: null }
          const scores = computeTotals(row.meals)
          const avg = Math.round(ALL_NUTRIENTS.reduce((s, n) => s + (scores[n.id] || 0), 0) / ALL_NUTRIENTS.length * 100)
          return { iso, label, pct: avg }
        }))
      } else {
        setWeekData(days.map(({ iso, label }) => {
          try {
            const saved = localStorage.getItem(`tsm_nutrition_${iso}`)
            if (!saved) return { iso, label, pct: null }
            const dayData = JSON.parse(saved)
            const scores = computeTotals(dayData.meals || {})
            const avg = Math.round(ALL_NUTRIENTS.reduce((s, n) => s + (scores[n.id] || 0), 0) / ALL_NUTRIENTS.length * 100)
            return { iso, label, pct: avg }
          } catch { return { iso, label, pct: null } }
        }))
      }
    }
    loadWeek()
  }, [user, selectedDate])

  // Load day data from Supabase
  useEffect(() => {
    loadDay(selectedDate)
  }, [selectedDate, user])

  // Auto-save on data change (debounced 1.5s)
  useEffect(() => {
    if (loading) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveDay(selectedDate, data), 1500)
    return () => clearTimeout(saveTimer.current)
  }, [data])

  const loadDay = async (date) => {
    setLoading(true)
    if (user) {
      const { data: row } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()
      if (row) {
        setData({ meals: row.meals || {}, water: row.water || 0, notes: row.notes || '' })
      } else {
        setData(emptyDay())
      }
    } else {
      // Fallback to localStorage for offline/unauthenticated
      try {
        const cached = JSON.parse(localStorage.getItem(`tsm_nutrition_${date}`) || 'null')
        setData(cached || emptyDay())
      } catch { setData(emptyDay()) }
    }
    setLoading(false)
  }

  const saveDay = async (date, dayData) => {
    if (!user) {
      localStorage.setItem(`tsm_nutrition_${date}`, JSON.stringify(dayData))
      return
    }
    setSaving(true)
    const { error } = await supabase.from('nutrition_logs').upsert({
      user_id: user.id,
      date,
      meals: dayData.meals,
      water: dayData.water,
      notes: dayData.notes,
    }, { onConflict: 'user_id,date' })
    if (error) console.error('Nutrition save failed:', error.message, error)
    setSaving(false)
  }

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

  const updateAmount = (slot, foodId, rawVal, isCount) => {
    const food = FOOD_LIBRARY.find(f => f.id === foodId)
    let grams
    if (isCount && food?.countable) {
      grams = Math.max(food.gramsPerUnit, Math.round((Number(rawVal) || 1) * food.gramsPerUnit))
    } else {
      grams = Number(rawVal) || 0
    }
    setData(prev => {
      const slotData = prev.meals[slot] || { foods: [] }
      return { ...prev, meals: { ...prev.meals, [slot]: { ...slotData, foods: slotData.foods.map(f => f.id === foodId ? { ...f, amount: grams } : f) } } }
    })
  }

  const addWater = amt => setData(prev => ({ ...prev, water: Math.max(0, +(prev.water + amt).toFixed(2)) }))

  const scores = computeTotals(data.meals)
  const calories = totalCalories(data.meals)
  const loggedFoodIds = new Set(Object.values(data.meals).flatMap(s => (s?.foods || []).map(f => f.id)))

  const nutrientStatus = id => {
    const s = scores[id] || 0
    if (s >= 0.6) return 'good'
    if (s >= 0.3) return 'partial'
    return 'low'
  }

  const vitaminScore = Math.round(VITAMINS.reduce((s, v) => s + (scores[v.id] || 0), 0) / VITAMINS.length * 100)
  const mineralScore = Math.round(MINERALS.reduce((s, m) => s + (scores[m.id] || 0), 0) / MINERALS.length * 100)
  const overallScore = Math.round((vitaminScore + mineralScore) / 2)

  const p = mobile ? '16px 14px 20px' : '40px'

  return (
    <div style={{ padding: p, minHeight: '100vh', background: '#F7F3EE', touchAction: 'pan-y' }}>
      <PageHeader icon="🥩" title="Nutrition Tracker" sub="Log your food and track micronutrient coverage" />

      {/* ── Date navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px', padding: '12px 18px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedDate(d => shiftDate(d, -1))}
          style={{ background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '16px', color: '#6B5E54', touchAction: 'manipulation', lineHeight: 1 }}
        >‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1410' }}>{friendlyDate(selectedDate)}</div>
          <div style={{ fontSize: '11px', color: '#9C8E84', marginTop: '1px' }}>{selectedDate}</div>
          {saving && <div style={{ fontSize: '10px', color: '#C4A882', marginTop: '2px' }}>Saving…</div>}
        </div>
        <button
          onClick={() => { if (!isToday) setSelectedDate(d => shiftDate(d, 1)) }}
          style={{ background: isToday ? 'transparent' : '#F7F3EE', border: `1px solid ${isToday ? 'transparent' : '#EDE8E0'}`, borderRadius: '8px', padding: '8px 16px', cursor: isToday ? 'default' : 'pointer', fontSize: '16px', color: isToday ? '#D8D0C5' : '#6B5E54', touchAction: 'manipulation', lineHeight: 1 }}
        >›</button>
      </div>

      {/* Week progress chart */}
      {weekData.length > 0 && <NutritionWeekChart data={weekData} selectedDate={selectedDate} onSelect={setSelectedDate} />}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#BEB5AE', fontSize: '14px' }}>Loading…</div>
      ) : (
        <>
          {/* ── Overview row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <MiniRing pct={overallScore} color="#C4A882" size={60} />
              <div>
                <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Overall Score</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{overallScore}%</div>
                <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>aim for 75%+</div>
              </div>
            </div>
            <button onClick={() => setPanel(panel === 'vitamins' ? null : 'vitamins')} style={{ background: panel === 'vitamins' ? '#FFF7ED' : '#FFFFFF', border: panel === 'vitamins' ? '1px solid #FDBA74' : '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
              <MiniRing pct={vitaminScore} color="#e8703a" size={60} />
              <div>
                <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Vitamins</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{vitaminScore}%</div>
                <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>tap to see details</div>
              </div>
            </button>
            <button onClick={() => setPanel(panel === 'minerals' ? null : 'minerals')} style={{ background: panel === 'minerals' ? '#F0F9FF' : '#FFFFFF', border: panel === 'minerals' ? '1px solid #7DD3FC' : '1px solid #EDE8E0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
              <MiniRing pct={mineralScore} color="#0ea5e9" size={60} />
              <div>
                <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Minerals</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1410' }}>{mineralScore}%</div>
                <div style={{ fontSize: '11px', color: '#BEB5AE', marginTop: '2px' }}>tap to see details</div>
              </div>
            </button>
          </div>

          {/* ── Calories ── */}
          <div style={{ background: '#1C1917', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '22px' }}>🔥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#5C5550', textTransform: 'uppercase', letterSpacing: '1px' }}>Calories (view only)</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#F7F3EE' }}>{calories} <span style={{ fontSize: '13px', color: '#5C5550', fontWeight: 400 }}>kcal from logged foods</span></div>
            </div>
            <div style={{ fontSize: '11px', color: '#5C5550', maxWidth: '200px', lineHeight: 1.5 }}>Focus on hitting 100% micronutrients — calories will follow naturally.</div>
          </div>

          {/* ── Nutrient panel ── */}
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

          {/* ── Water ── */}
          <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1A1410', marginBottom: '4px' }}>💧 Water Intake</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0891B2' }}>{data.water}L <span style={{ fontSize: '13px', color: '#9C8E84', fontWeight: 400 }}>/ 2.5L</span></div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0.25, 0.5, 1].map(amt => (
                  <button key={amt} onClick={() => addWater(amt)} style={{ background: '#EBF8FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '10px 14px', color: '#0891B2', fontSize: '13px', fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation' }}>+{amt}L</button>
                ))}
                <button onClick={() => addWater(-0.25)} style={{ background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '10px 14px', color: '#9C8E84', fontSize: '13px', cursor: 'pointer', touchAction: 'manipulation' }}>−</button>
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '4px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: '6px', borderRadius: '99px', background: i < Math.round(data.water / 2.5 * 10) ? '#0891B2' : '#EDE8E0', transition: 'background 0.3s' }} />
              ))}
            </div>
          </div>

          {/* ── Meal slots ── */}
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
                    <button onClick={() => setActiveMeal(open ? null : slot)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
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
                        {foods.length > 0 && (
                          <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontSize: '11px', color: '#9C8E84', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Logged</div>
                            {foods.map(({ id, amount }) => {
                              const food = FOOD_LIBRARY.find(f => f.id === id)
                              if (!food) return null
                              const kcal = Math.round(food.caloriesPer100 * amount / 100)
                              // Countable items: show qty (e.g. "3 eggs"), not grams
                              const isCountable = food.countable && food.gramsPerUnit
                              const displayQty = isCountable ? Math.max(1, Math.round(amount / food.gramsPerUnit)) : amount
                              const displayUnit = isCountable
                                ? `${food.unitName}${displayQty !== 1 ? 's' : ''}`
                                : food.unit
                              return (
                                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#FFFFFF', borderRadius: '10px', padding: '10px 12px', border: '1px solid #EDE8E0' }}>
                                  <span style={{ fontSize: '20px' }}>{food.icon}</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1410' }}>{food.name}</div>
                                    <div style={{ fontSize: '11px', color: '#9C8E84' }}>{kcal} kcal{isCountable ? ` · ${amount}g` : ''}</div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isCountable ? (
                                      // Countable: +/- buttons for whole units
                                      <>
                                        <button
                                          onClick={() => updateAmount(slot, id, displayQty - 1, true)}
                                          style={{ width: '28px', height: '28px', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '6px', color: '#6B5E54', fontSize: '16px', cursor: 'pointer', touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                        >−</button>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1410', minWidth: '28px', textAlign: 'center' }}>{displayQty}</span>
                                        <button
                                          onClick={() => updateAmount(slot, id, displayQty + 1, true)}
                                          style={{ width: '28px', height: '28px', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '6px', color: '#6B5E54', fontSize: '16px', cursor: 'pointer', touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                        >+</button>
                                        <span style={{ fontSize: '12px', color: '#9C8E84', minWidth: '28px' }}>{displayUnit}</span>
                                      </>
                                    ) : (
                                      // Gram-based: number input
                                      <>
                                        <input
                                          type="number"
                                          value={amount}
                                          min={1}
                                          onChange={e => updateAmount(slot, id, e.target.value, false)}
                                          style={{ width: '65px', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '7px', padding: '5px 8px', color: '#1A1410', fontSize: '16px', outline: 'none', textAlign: 'center' }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#9C8E84', minWidth: '16px' }}>{displayUnit}</span>
                                      </>
                                    )}
                                    <button onClick={() => removeFood(slot, id)} style={{ background: 'none', border: 'none', color: '#D8CFC5', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px', touchAction: 'manipulation' }}>×</button>
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

          {/* ── Daily notes ── */}
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
        </>
      )}
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
        <button onClick={onClose} style={{ background: '#F7F3EE', border: '1px solid #EDE8E0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#6B5E54', touchAction: 'manipulation' }}>Close ×</button>
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
              <button onClick={() => setExpandedNutrient(isExpanded ? null : n.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: status === 'good' ? '#F0FAF4' : status === 'partial' ? '#FFFBEB' : '#FAFAF8', border: 'none', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
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
                  <div style={{ fontSize: '11px', color: '#9C8E84', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best sources:</div>
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
                  {pct < 75 && sources.length > 0 && (
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
      <input
        type="text"
        placeholder="Search foods..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', background: '#F7F3EE', border: '1px solid #E0D8CE', borderRadius: '8px', padding: '8px 12px', color: '#1A1410', fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
      />
      {/* Category chips — horizontally scrollable, no page scroll interference */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', touchAction: 'pan-x' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer', fontSize: '11px', background: activeCategory === cat ? '#1C1917' : '#F7F3EE', color: activeCategory === cat ? '#F7F3EE' : '#6B5E54', fontWeight: activeCategory === cat ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0, touchAction: 'manipulation' }}>
            {cat}
          </button>
        ))}
      </div>
      {/* Food grid — contained vertical scroll, won't hijack page scroll */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(155px, 1fr))',
        gap: '8px',
        maxHeight: mobile ? '300px' : '280px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
        paddingRight: '2px',
      }}>
        {filtered.map(food => {
          const selected = selectedIds.has(food.id)
          return (
            <button key={food.id} onClick={() => !selected && onAdd(food.id)} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${selected ? '#16A34A' : '#EDE8E0'}`, background: selected ? '#F0FAF4' : '#FFFFFF', cursor: selected ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s', opacity: selected ? 0.75 : 1, touchAction: 'manipulation' }}>
              <span style={{ fontSize: '18px' }}>{food.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: selected ? '#166534' : '#1A1410', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.name}</div>
                <div style={{ fontSize: '10px', color: '#BEB5AE', marginTop: '1px' }}>
                  {food.countable
                    ? `${food.caloriesPer100} kcal/100g · per ${food.unitName}`
                    : `${food.caloriesPer100} kcal/100${food.unit}`}
                </div>
              </div>
              {selected && <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, flexShrink: 0 }}>✓</span>}
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '24px', textAlign: 'center', color: '#BEB5AE', fontSize: '13px' }}>No foods match "{search}"</div>
        )}
      </div>
    </div>
  )
}

function NutritionWeekChart({ data, selectedDate, onSelect }) {
  const maxH = 56
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#9C8E84', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>This Week — Tap a day to view</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
        {data.map(({ iso, label, pct }) => {
          const barH = pct !== null ? Math.max(4, Math.round((pct / 100) * maxH)) : 4
          const isSelected = iso === selectedDate
          return (
            <div key={iso} onClick={() => onSelect(iso)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: pct !== null ? '#1A1410' : '#D8D0C5' }}>
                {pct !== null ? `${pct}%` : '–'}
              </div>
              <div style={{ width: '100%', height: `${maxH}px`, display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%', height: `${barH}px`, borderRadius: '5px 5px 3px 3px',
                  background: pct === null ? '#F0EBE4'
                    : pct >= 75 ? 'linear-gradient(180deg, #1C1917 0%, #7C5C3A 100%)'
                    : pct >= 50 ? '#9C8E84' : '#D8D0C5',
                  outline: isSelected ? '2px solid #1C1917' : 'none',
                  outlineOffset: '2px',
                  transition: 'height 0.4s ease',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: isSelected ? '#1C1917' : '#9C8E84', fontWeight: isSelected ? 800 : 400 }}>{label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PageHeader({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <span style={{ fontSize: '26px' }}>{icon}</span>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1410' }}>{title}</h1>
      </div>
      <p style={{ fontSize: '14px', color: '#9C8E84', marginLeft: '38px' }}>{sub}</p>
    </div>
  )
}
