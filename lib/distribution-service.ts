import { createClient } from "@/lib/supabase/client"

export type VulnerabilityCategory =
  | "low_income"
  | "senior"
  | "pwd"
  | "pregnant"
  | "solo_parent"
  | "malnourished_child"
  | "displaced_family"
  | "infant_care"

export type AgeGroup = "infant" | "child" | "teen" | "adult" | "senior" | "all_ages"

export interface Beneficiary {
  id: string
  barangay_name: string
  full_name: string
  age: number
  date_of_birth?: string
  gender: "male" | "female" | "other"
  household_size: number
  address_purok: string
  contact_number?: string
  vulnerability_category: VulnerabilityCategory
  is_urgent: boolean
  urgency_reason?: string
  last_aid_date?: string
  notes?: string
  created_at?: string
}

export interface ClothingItem {
  id: string
  barangay_name: string
  item_name: string
  clothing_type: "tops" | "bottoms" | "jacket" | "baby_wear" | "dress" | "footwear" | "undergarment" | "bundle"
  target_age_group: AgeGroup
  min_age: number
  max_age: number
  size: string
  gender_target: "male" | "female" | "unisex" | "kids"
  quantity: number
  condition: "new" | "gently_used"
  notes?: string
}

export interface DistributionRecord {
  id: string
  barangay_name: string
  beneficiary_id: string
  beneficiary_name: string
  beneficiary_age: number
  distribution_date: string
  item_type: "food" | "clothing" | "relief_pack" | "other"
  item_name: string
  category?: string
  clothing_size?: string
  clothing_age_group?: string
  quantity: number
  unit: string
  distributor_name: string
  notes?: string
  created_at?: string
}

export function getAgeCategory(age: number): AgeGroup {
  if (age <= 2) return "infant"
  if (age <= 12) return "child"
  if (age <= 17) return "teen"
  if (age <= 59) return "adult"
  return "senior"
}

export function getAgeGroupLabel(group: AgeGroup): string {
  switch (group) {
    case "infant":
      return "Infant (0-2 yrs)"
    case "child":
      return "Child (3-12 yrs)"
    case "teen":
      return "Teen (13-17 yrs)"
    case "adult":
      return "Adult (18-59 yrs)"
    case "senior":
      return "Senior Citizen (60+ yrs)"
    case "all_ages":
      return "All Ages / Flexible"
  }
}

export function isClothingAgeAppropriate(beneficiaryAge: number, item: ClothingItem): {
  isAppropriate: boolean
  warning?: string
} {
  const beneficiaryGroup = getAgeCategory(beneficiaryAge)

  if (item.target_age_group === "all_ages") {
    return { isAppropriate: true }
  }

  const withinAgeRange = beneficiaryAge >= item.min_age && beneficiaryAge <= item.max_age

  if (item.target_age_group === beneficiaryGroup || withinAgeRange) {
    return { isAppropriate: true }
  }

  return {
    isAppropriate: false,
    warning: `Age Mismatch: Beneficiary is ${beneficiaryAge} yrs old (${getAgeGroupLabel(
      beneficiaryGroup
    )}), but this item is intended for ${getAgeGroupLabel(item.target_age_group)} (Ages ${item.min_age}-${item.max_age}).`,
  }
}

// Fallback seed data if database table is not yet created in Supabase
const DEFAULT_BENEFICIARIES: Beneficiary[] = [
  {
    id: "b-001",
    barangay_name: "Abangay",
    full_name: "Tatay Roberto Dela Cruz",
    age: 72,
    date_of_birth: "1954-08-19",
    gender: "male",
    household_size: 2,
    address_purok: "Purok 1, Centro",
    contact_number: "09289876543",
    vulnerability_category: "senior",
    is_urgent: true,
    urgency_reason: "Bedridden senior citizen, low medication & immediate nourishment support needed",
    notes: "Requires soft food rations and elderly cardigan",
    created_at: new Date().toISOString(),
  },
  {
    id: "b-002",
    barangay_name: "Abangay",
    full_name: "Baby Lucas Gabriel",
    age: 1,
    date_of_birth: "2025-02-10",
    gender: "male",
    household_size: 3,
    address_purok: "Purok 4, Ilaya",
    contact_number: "09195551234",
    vulnerability_category: "infant_care",
    is_urgent: true,
    urgency_reason: "Underweight 1-year-old infant, urgent infant formula & clean baby wear needed",
    notes: "Monitored by Barangay Health Worker",
    created_at: new Date().toISOString(),
  },
  {
    id: "b-003",
    barangay_name: "Abangay",
    full_name: "Elena Ramirez",
    age: 29,
    date_of_birth: "1997-09-05",
    gender: "female",
    household_size: 5,
    address_purok: "Purok 3, Near Chapel",
    contact_number: "09301122334",
    vulnerability_category: "pregnant",
    is_urgent: true,
    urgency_reason: "8 months pregnant mother with 3 toddlers experiencing acute food shortage",
    created_at: new Date().toISOString(),
  },
  {
    id: "b-004",
    barangay_name: "Abangay",
    full_name: "Maria Santos",
    age: 34,
    date_of_birth: "1992-04-12",
    gender: "female",
    household_size: 4,
    address_purok: "Purok 2, Riverside",
    contact_number: "09171234567",
    vulnerability_category: "low_income",
    is_urgent: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "b-005",
    barangay_name: "Abangay",
    full_name: "Carlos Mendoza",
    age: 15,
    date_of_birth: "2011-06-20",
    gender: "male",
    household_size: 6,
    address_purok: "Purok 2",
    contact_number: "09456677889",
    vulnerability_category: "low_income",
    is_urgent: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "b-006",
    barangay_name: "Abangay",
    full_name: "Princess Joy Alcantara",
    age: 7,
    date_of_birth: "2019-03-14",
    gender: "female",
    household_size: 4,
    address_purok: "Purok 5",
    contact_number: "09214455667",
    vulnerability_category: "malnourished_child",
    is_urgent: true,
    urgency_reason: "Identified in supplementary feeding program, needs high-protein aid",
    created_at: new Date().toISOString(),
  },
]

const DEFAULT_CLOTHING: ClothingItem[] = [
  {
    id: "c-001",
    barangay_name: "Abangay",
    item_name: "Infant Cotton Onesies & Rompers (3-pack)",
    clothing_type: "baby_wear",
    target_age_group: "infant",
    min_age: 0,
    max_age: 2,
    size: "0-12M",
    gender_target: "unisex",
    quantity: 15,
    condition: "new",
    notes: "Soft breathable cotton for babies",
  },
  {
    id: "c-002",
    barangay_name: "Abangay",
    item_name: "Baby Knit Warmers & Booties Set",
    clothing_type: "baby_wear",
    target_age_group: "infant",
    min_age: 0,
    max_age: 1,
    size: "0-6M",
    gender_target: "unisex",
    quantity: 12,
    condition: "new",
  },
  {
    id: "c-003",
    barangay_name: "Abangay",
    item_name: "Kids Play Cotton T-Shirts",
    clothing_type: "tops",
    target_age_group: "child",
    min_age: 3,
    max_age: 8,
    size: "Kids Small (3-6Y)",
    gender_target: "kids",
    quantity: 25,
    condition: "gently_used",
  },
  {
    id: "c-004",
    barangay_name: "Abangay",
    item_name: "Children Denim & Active Shorts",
    clothing_type: "bottoms",
    target_age_group: "child",
    min_age: 6,
    max_age: 12,
    size: "Kids Medium (7-11Y)",
    gender_target: "kids",
    quantity: 20,
    condition: "gently_used",
  },
  {
    id: "c-005",
    barangay_name: "Abangay",
    item_name: "Youth Windbreaker & Light Jacket",
    clothing_type: "jacket",
    target_age_group: "teen",
    min_age: 13,
    max_age: 17,
    size: "Teen M",
    gender_target: "unisex",
    quantity: 10,
    condition: "gently_used",
  },
  {
    id: "c-006",
    barangay_name: "Abangay",
    item_name: "Teen Graphic Shirts & Polos",
    clothing_type: "tops",
    target_age_group: "teen",
    min_age: 13,
    max_age: 17,
    size: "Teen L",
    gender_target: "unisex",
    quantity: 16,
    condition: "gently_used",
  },
  {
    id: "c-007",
    barangay_name: "Abangay",
    item_name: "Adult Relief Crewneck T-Shirt",
    clothing_type: "tops",
    target_age_group: "adult",
    min_age: 18,
    max_age: 59,
    size: "Adult M",
    gender_target: "unisex",
    quantity: 35,
    condition: "new",
  },
  {
    id: "c-008",
    barangay_name: "Abangay",
    item_name: "Adult Cargo & Everyday Utility Pants",
    clothing_type: "bottoms",
    target_age_group: "adult",
    min_age: 18,
    max_age: 59,
    size: "Adult L",
    gender_target: "unisex",
    quantity: 22,
    condition: "gently_used",
  },
  {
    id: "c-009",
    barangay_name: "Abangay",
    item_name: "Senior Dignity Warm Cardigan & Shawl",
    clothing_type: "jacket",
    target_age_group: "senior",
    min_age: 60,
    max_age: 120,
    size: "Senior Free Size",
    gender_target: "unisex",
    quantity: 18,
    condition: "new",
    notes: "Warm soft knitwear for elderly care",
  },
]

const DEFAULT_DISTRIBUTIONS: DistributionRecord[] = [
  {
    id: "dist-001",
    barangay_name: "Abangay",
    beneficiary_id: "b-001",
    beneficiary_name: "Tatay Roberto Dela Cruz",
    beneficiary_age: 72,
    distribution_date: "2026-09-28",
    item_type: "clothing",
    item_name: "Senior Dignity Warm Cardigan & Shawl",
    category: "Clothing",
    clothing_size: "Senior Free Size",
    clothing_age_group: "senior",
    quantity: 1,
    unit: "piece",
    distributor_name: "Brgy. Captain / Relief Team",
    notes: "Delivered to residence in Purok 1 due to mobility difficulty",
    created_at: "2026-09-28T09:30:00Z",
  },
  {
    id: "dist-002",
    barangay_name: "Abangay",
    beneficiary_id: "b-003",
    beneficiary_name: "Elena Ramirez",
    beneficiary_age: 29,
    distribution_date: "2026-09-29",
    item_type: "food",
    item_name: "Fortified Rice & Powdered Milk Pack",
    category: "Grains & Dairy",
    quantity: 10,
    unit: "kg",
    distributor_name: "Maria Cruz (Kagawad)",
    notes: "Special maternal nutrition aid",
    created_at: "2026-09-29T14:15:00Z",
  },
]

// Storage Keys
const BENEFICIARIES_KEY = "foodshare_beneficiaries"
const CLOTHING_KEY = "foodshare_clothing_inventory"
const DISTRIBUTIONS_KEY = "foodshare_aid_distributions"

function getFromStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error("Failed to save to localStorage", err)
  }
}

// 1. Beneficiaries API
export async function getBeneficiaries(barangayName?: string): Promise<Beneficiary[]> {
  try {
    const supabase = createClient()
    let query = supabase.from("barangay_beneficiaries").select("*")
    if (barangayName) {
      query = query.eq("barangay_name", barangayName)
    }
    const { data, error } = await query.order("is_urgent", { ascending: false }).order("created_at", { ascending: false })
    if (error || !data || data.length === 0) {
      const stored = getFromStorage<Beneficiary>(BENEFICIARIES_KEY, DEFAULT_BENEFICIARIES)
      return barangayName ? stored.filter((b) => !b.barangay_name || b.barangay_name === barangayName) : stored
    }
    return data as Beneficiary[]
  } catch {
    const stored = getFromStorage<Beneficiary>(BENEFICIARIES_KEY, DEFAULT_BENEFICIARIES)
    return barangayName ? stored.filter((b) => !b.barangay_name || b.barangay_name === barangayName) : stored
  }
}

export async function addBeneficiary(
  beneficiary: Omit<Beneficiary, "id" | "created_at">
): Promise<Beneficiary> {
  const newId = `b-${Date.now()}`
  const newRecord: Beneficiary = {
    ...beneficiary,
    id: newId,
    created_at: new Date().toISOString(),
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("barangay_beneficiaries").insert([newRecord]).select().single()
    if (!error && data) {
      return data as Beneficiary
    }
  } catch (e) {
    console.warn("Falling back to local storage for addBeneficiary", e)
  }

  const all = getFromStorage<Beneficiary>(BENEFICIARIES_KEY, DEFAULT_BENEFICIARIES)
  const updated = [newRecord, ...all]
  saveToStorage(BENEFICIARIES_KEY, updated)
  return newRecord
}

// 2. Clothing Inventory API
export async function getClothingInventory(barangayName?: string): Promise<ClothingItem[]> {
  try {
    const supabase = createClient()
    let query = supabase.from("clothing_inventory").select("*")
    if (barangayName) {
      query = query.eq("barangay_name", barangayName)
    }
    const { data, error } = await query
    if (error || !data || data.length === 0) {
      const stored = getFromStorage<ClothingItem>(CLOTHING_KEY, DEFAULT_CLOTHING)
      return barangayName ? stored.filter((c) => !c.barangay_name || c.barangay_name === barangayName) : stored
    }
    return data as ClothingItem[]
  } catch {
    const stored = getFromStorage<ClothingItem>(CLOTHING_KEY, DEFAULT_CLOTHING)
    return barangayName ? stored.filter((c) => !c.barangay_name || c.barangay_name === barangayName) : stored
  }
}

export async function addClothingItem(item: Omit<ClothingItem, "id">): Promise<ClothingItem> {
  const newItem: ClothingItem = {
    ...item,
    id: `c-${Date.now()}`,
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("clothing_inventory").insert([newItem]).select().single()
    if (!error && data) {
      return data as ClothingItem
    }
  } catch (e) {
    console.warn("Falling back to local storage for addClothingItem", e)
  }

  const all = getFromStorage<ClothingItem>(CLOTHING_KEY, DEFAULT_CLOTHING)
  const updated = [newItem, ...all]
  saveToStorage(CLOTHING_KEY, updated)
  return newItem
}

// 3. Distribution Records API
export async function getDistributions(barangayName?: string): Promise<DistributionRecord[]> {
  try {
    const supabase = createClient()
    let query = supabase.from("aid_distributions").select("*")
    if (barangayName) {
      query = query.eq("barangay_name", barangayName)
    }
    const { data, error } = await query.order("distribution_date", { ascending: false })
    if (error || !data || data.length === 0) {
      const stored = getFromStorage<DistributionRecord>(DISTRIBUTIONS_KEY, DEFAULT_DISTRIBUTIONS)
      return barangayName ? stored.filter((d) => !d.barangay_name || d.barangay_name === barangayName) : stored
    }
    return data as DistributionRecord[]
  } catch {
    const stored = getFromStorage<DistributionRecord>(DISTRIBUTIONS_KEY, DEFAULT_DISTRIBUTIONS)
    return barangayName ? stored.filter((d) => !d.barangay_name || d.barangay_name === barangayName) : stored
  }
}

export async function recordDistribution(
  distribution: Omit<DistributionRecord, "id" | "created_at">
): Promise<DistributionRecord> {
  const newRecord: DistributionRecord = {
    ...distribution,
    id: `dist-${Date.now()}`,
    created_at: new Date().toISOString(),
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("aid_distributions").insert([newRecord]).select().single()
    if (!error && data) {
      return data as DistributionRecord
    }
  } catch (e) {
    console.warn("Falling back to local storage for recordDistribution", e)
  }

  const all = getFromStorage<DistributionRecord>(DISTRIBUTIONS_KEY, DEFAULT_DISTRIBUTIONS)
  const updated = [newRecord, ...all]
  saveToStorage(DISTRIBUTIONS_KEY, updated)

  // Deduct clothing stock if clothing
  if (distribution.item_type === "clothing") {
    const clothes = getFromStorage<ClothingItem>(CLOTHING_KEY, DEFAULT_CLOTHING)
    const updatedClothes = clothes.map((c) => {
      if (c.item_name === distribution.item_name) {
        return { ...c, quantity: Math.max(0, c.quantity - distribution.quantity) }
      }
      return c
    })
    saveToStorage(CLOTHING_KEY, updatedClothes)
  }

  return newRecord
}
