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

export type FoodCategory =
  | "grains"
  | "canned_goods"
  | "produce"
  | "dairy"
  | "baby_food"
  | "beverages"
  | "snacks"
  | "condiments"
  | "other"

export type ExpiryType = "exact" | "range" | "non_perishable"
export type ExpiryUrgencyLevel = "critical" | "high" | "medium" | "safe"

export interface FoodInventoryItem {
  id: string
  barangay_name: string
  item_name: string
  category: FoodCategory
  quantity: number
  unit: "packs" | "kg" | "cans" | "boxes" | "baskets" | "sacks" | "tins" | "bottles" | "pieces"
  expiry_type: ExpiryType
  expiry_date?: string // Exact expiry date (YYYY-MM-DD)
  expiry_date_from?: string // Range start (YYYY-MM-DD)
  expiry_date_to?: string // Range end (YYYY-MM-DD)
  condition?: "good" | "slightly_damaged_packaging"
  storage_condition?: "ambient" | "chilled" | "dry_store"
  notes?: string
  created_at?: string
}

export interface FoodPackContent {
  food_item_id: string
  item_name: string
  category: FoodCategory
  quantity_per_pack: number
  unit: string
  expiry_type: ExpiryType
  effective_expiry_date: string
}

export interface FoodPack {
  id: string
  barangay_name: string
  pack_name: string
  description?: string
  target_beneficiary_type?: VulnerabilityCategory | "general_relief"
  contents: FoodPackContent[]
  quantity_available: number
  earliest_expiry_date: string
  urgency_level: ExpiryUrgencyLevel
  created_at?: string
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

export function getEffectiveExpiryDate(item: {
  expiry_type: ExpiryType
  expiry_date?: string
  expiry_date_from?: string
  expiry_date_to?: string
}): string | null {
  if (item.expiry_type === "non_perishable") return null
  if (item.expiry_type === "exact") return item.expiry_date || null
  // In a range of expiration dates, the earliest date in the batch is when the first items expire!
  // However, FEFO urgency checks the soonest date (expiry_date_from) or end date (expiry_date_to).
  // We use expiry_date_from as the trigger for urgent dispatch of the batch.
  return item.expiry_date_from || item.expiry_date_to || null
}

export function getFoodItemUrgency(item: {
  expiry_type: ExpiryType
  expiry_date?: string
  expiry_date_from?: string
  expiry_date_to?: string
}): {
  level: ExpiryUrgencyLevel
  daysLeft: number
  label: string
  badgeVariant: "destructive" | "default" | "secondary" | "outline"
  badgeClass: string
  isExpiringSoon: boolean
} {
  if (item.expiry_type === "non_perishable") {
    return {
      level: "safe",
      daysLeft: 9999,
      label: "Non-Perishable (Safe)",
      badgeVariant: "outline",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
      isExpiringSoon: false,
    }
  }

  const effectiveDateStr = getEffectiveExpiryDate(item)
  if (!effectiveDateStr) {
    return {
      level: "safe",
      daysLeft: 9999,
      label: "No Expiry Specified",
      badgeVariant: "outline",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-300",
      isExpiringSoon: false,
    }
  }

  const expiryDate = new Date(effectiveDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = expiryDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return {
      level: "critical",
      daysLeft,
      label: `EXPIRED (${Math.abs(daysLeft)}d ago)`,
      badgeVariant: "destructive",
      badgeClass: "bg-red-600 text-white font-bold animate-pulse",
      isExpiringSoon: true,
    }
  }

  if (daysLeft <= 7) {
    return {
      level: "critical",
      daysLeft,
      label: `CRITICAL (${daysLeft}d left)`,
      badgeVariant: "destructive",
      badgeClass: "bg-rose-500 text-white font-semibold",
      isExpiringSoon: true,
    }
  }

  if (daysLeft <= 30) {
    return {
      level: "high",
      daysLeft,
      label: `High Urgency (${daysLeft}d left)`,
      badgeVariant: "default",
      badgeClass: "bg-amber-500 text-white font-medium",
      isExpiringSoon: true,
    }
  }

  if (daysLeft <= 90) {
    return {
      level: "medium",
      daysLeft,
      label: `Moderate (${daysLeft}d left)`,
      badgeVariant: "secondary",
      badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
      isExpiringSoon: false,
    }
  }

  return {
    level: "safe",
    daysLeft,
    label: `Good (${daysLeft}d left)`,
    badgeVariant: "outline",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
    isExpiringSoon: false,
  }
}

export function formatExpiryDisplay(item: {
  expiry_type: ExpiryType
  expiry_date?: string
  expiry_date_from?: string
  expiry_date_to?: string
}): string {
  if (item.expiry_type === "non_perishable") {
    return "Non-perishable (Long shelf life)"
  }
  if (item.expiry_type === "exact" && item.expiry_date) {
    return `Expires: ${new Date(item.expiry_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`
  }
  if (item.expiry_type === "range") {
    const fromStr = item.expiry_date_from
      ? new Date(item.expiry_date_from).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown"
    const toStr = item.expiry_date_to
      ? new Date(item.expiry_date_to).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown"
    return `Batch Range: ${fromStr} – ${toStr}`
  }
  return "Standard Shelf Life"
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
const FOOD_INVENTORY_KEY = "foodshare_food_inventory"
const FOOD_PACKS_KEY = "foodshare_food_packs"

// Default Food Inventory Seed Data (Rich real-world scenario with mixed batches and ranges)
export const DEFAULT_FOOD_INVENTORY: FoodInventoryItem[] = [
  {
    id: "food-001",
    barangay_name: "Abangay",
    item_name: "Assorted Canned Tuna in Vegetable Oil",
    category: "canned_goods",
    quantity: 120,
    unit: "cans",
    expiry_type: "range",
    expiry_date_from: "2026-10-15",
    expiry_date_to: "2026-10-28",
    condition: "good",
    storage_condition: "ambient",
    notes: "Mixed donor batch from local supermarket drive. Earliest tins expire in mid-October.",
    created_at: new Date().toISOString(),
  },
  {
    id: "food-002",
    barangay_name: "Abangay",
    item_name: "High-Protein Infant Cerelac & Soya",
    category: "baby_food",
    quantity: 45,
    unit: "boxes",
    expiry_type: "exact",
    expiry_date: "2026-10-18",
    condition: "good",
    storage_condition: "dry_store",
    notes: "Critical priority for identified underweight infants in Purok 4.",
    created_at: new Date().toISOString(),
  },
  {
    id: "food-003",
    barangay_name: "Abangay",
    item_name: "Maternal Calcium Milk Powder Formula",
    category: "dairy",
    quantity: 35,
    unit: "tins",
    expiry_type: "exact",
    expiry_date: "2026-11-12",
    condition: "good",
    storage_condition: "dry_store",
    notes: "High urgency nutritional support for pregnant and lactating mothers.",
    created_at: new Date().toISOString(),
  },
  {
    id: "food-004",
    barangay_name: "Abangay",
    item_name: "Fortified White Rice (50kg Sacks)",
    category: "grains",
    quantity: 30,
    unit: "sacks",
    expiry_type: "range",
    expiry_date_from: "2027-03-01",
    expiry_date_to: "2027-05-30",
    condition: "good",
    storage_condition: "dry_store",
    notes: "Standard municipal disaster reserve grain stock. Safe shelf life.",
    created_at: new Date().toISOString(),
  },
  {
    id: "food-005",
    barangay_name: "Abangay",
    item_name: "Canned Sardines in Tomato Chili Sauce",
    category: "canned_goods",
    quantity: 200,
    unit: "cans",
    expiry_type: "range",
    expiry_date_from: "2026-12-10",
    expiry_date_to: "2027-02-15",
    condition: "good",
    storage_condition: "ambient",
    notes: "Donated bulk crate with mixed manufacturing dates.",
    created_at: new Date().toISOString(),
  },
  {
    id: "food-006",
    barangay_name: "Abangay",
    item_name: "Fresh Harvest Highland Squash & Tubers",
    category: "produce",
    quantity: 60,
    unit: "kg",
    expiry_type: "exact",
    expiry_date: "2026-10-09",
    condition: "good",
    storage_condition: "chilled",
    notes: "Fresh produce from farmers guild. Must distribute within 7 days!",
    created_at: new Date().toISOString(),
  },
  {
    id: "food-007",
    barangay_name: "Abangay",
    item_name: "Iodized Table Salt & Brown Sugar",
    category: "condiments",
    quantity: 80,
    unit: "packs",
    expiry_type: "non_perishable",
    condition: "good",
    storage_condition: "dry_store",
    notes: "Non-perishable relief pack basic staple.",
    created_at: new Date().toISOString(),
  },
]

// Default Food Packs Seed Data
export const DEFAULT_FOOD_PACKS: FoodPack[] = [
  {
    id: "pack-001",
    barangay_name: "Abangay",
    pack_name: "Family Standard Emergency Food Pack",
    description: "Complete 3-5 day subsistence ration for family of 4-6 members.",
    target_beneficiary_type: "low_income",
    contents: [
      {
        food_item_id: "food-004",
        item_name: "Fortified White Rice",
        category: "grains",
        quantity_per_pack: 5,
        unit: "kg",
        expiry_type: "range",
        effective_expiry_date: "2027-03-01",
      },
      {
        food_item_id: "food-005",
        item_name: "Canned Sardines in Tomato Chili Sauce",
        category: "canned_goods",
        quantity_per_pack: 4,
        unit: "cans",
        expiry_type: "range",
        effective_expiry_date: "2026-12-10",
      },
      {
        food_item_id: "food-001",
        item_name: "Assorted Canned Tuna in Vegetable Oil",
        category: "canned_goods",
        quantity_per_pack: 3,
        unit: "cans",
        expiry_type: "range",
        effective_expiry_date: "2026-10-15",
      },
      {
        food_item_id: "food-007",
        item_name: "Iodized Table Salt & Brown Sugar",
        category: "condiments",
        quantity_per_pack: 1,
        unit: "pack",
        expiry_type: "non_perishable",
        effective_expiry_date: "2099-01-01",
      },
    ],
    quantity_available: 24,
    earliest_expiry_date: "2026-10-15",
    urgency_level: "critical",
    created_at: new Date().toISOString(),
  },
  {
    id: "pack-002",
    barangay_name: "Abangay",
    pack_name: "First 1,000 Days Maternal & Infant Care Pack",
    description: "Tailored nutrient-dense kit for pregnant mothers and toddlers.",
    target_beneficiary_type: "infant_care",
    contents: [
      {
        food_item_id: "food-002",
        item_name: "High-Protein Infant Cerelac & Soya",
        category: "baby_food",
        quantity_per_pack: 2,
        unit: "boxes",
        expiry_type: "exact",
        effective_expiry_date: "2026-10-18",
      },
      {
        food_item_id: "food-003",
        item_name: "Maternal Calcium Milk Powder Formula",
        category: "dairy",
        quantity_per_pack: 1,
        unit: "tin",
        expiry_type: "exact",
        effective_expiry_date: "2026-11-12",
      },
    ],
    quantity_available: 15,
    earliest_expiry_date: "2026-10-18",
    urgency_level: "critical",
    created_at: new Date().toISOString(),
  },
]

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

  // Deduct food item stock if food
  if (distribution.item_type === "food") {
    const foodList = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)
    const updatedFood = foodList.map((f) => {
      if (f.item_name.toLowerCase() === distribution.item_name.toLowerCase()) {
        return { ...f, quantity: Math.max(0, f.quantity - distribution.quantity) }
      }
      return f
    })
    saveToStorage(FOOD_INVENTORY_KEY, updatedFood)
  }

  // Deduct food pack stock if relief_pack
  if (distribution.item_type === "relief_pack") {
    const packs = getFromStorage<FoodPack>(FOOD_PACKS_KEY, DEFAULT_FOOD_PACKS)
    const updatedPacks = packs.map((p) => {
      if (p.pack_name.toLowerCase() === distribution.item_name.toLowerCase()) {
        return { ...p, quantity_available: Math.max(0, p.quantity_available - distribution.quantity) }
      }
      return p
    })
    saveToStorage(FOOD_PACKS_KEY, updatedPacks)
  }

  return newRecord
}

// 4. Food Inventory API
export async function getFoodInventory(barangayName?: string): Promise<FoodInventoryItem[]> {
  try {
    const supabase = createClient()
    let query = supabase.from("food_inventory").select("*")
    if (barangayName) {
      query = query.eq("barangay_name", barangayName)
    }
    const { data, error } = await query
    if (error || !data || data.length === 0) {
      const stored = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)
      return barangayName ? stored.filter((f) => !f.barangay_name || f.barangay_name === barangayName) : stored
    }
    return data as FoodInventoryItem[]
  } catch {
    const stored = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)
    return barangayName ? stored.filter((f) => !f.barangay_name || f.barangay_name === barangayName) : stored
  }
}

export async function addFoodInventoryItem(
  item: Omit<FoodInventoryItem, "id">
): Promise<FoodInventoryItem> {
  const newItem: FoodInventoryItem = {
    ...item,
    id: `food-${Date.now()}`,
    created_at: new Date().toISOString(),
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("food_inventory").insert([newItem]).select().single()
    if (!error && data) {
      return data as FoodInventoryItem
    }
  } catch (e) {
    console.warn("Falling back to local storage for addFoodInventoryItem", e)
  }

  const all = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)
  const updated = [newItem, ...all]
  saveToStorage(FOOD_INVENTORY_KEY, updated)
  return newItem
}

export async function updateFoodInventoryItem(
  id: string,
  updates: Partial<FoodInventoryItem>
): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from("food_inventory").update(updates).eq("id", id)
  } catch (e) {
    console.warn("Supabase update error, updating local storage", e)
  }

  const all = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)
  const updated = all.map((f) => (f.id === id ? { ...f, ...updates } : f))
  saveToStorage(FOOD_INVENTORY_KEY, updated)
}

export async function deleteFoodInventoryItem(id: string): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from("food_inventory").delete().eq("id", id)
  } catch (e) {
    console.warn("Supabase delete error, deleting from local storage", e)
  }

  const all = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)
  const updated = all.filter((f) => f.id !== id)
  saveToStorage(FOOD_INVENTORY_KEY, updated)
}

// 5. Food Packs API (Assemble, Manage, Deduct)
export async function getFoodPacks(barangayName?: string): Promise<FoodPack[]> {
  try {
    const supabase = createClient()
    let query = supabase.from("food_packs").select("*")
    if (barangayName) {
      query = query.eq("barangay_name", barangayName)
    }
    const { data, error } = await query
    if (error || !data || data.length === 0) {
      const stored = getFromStorage<FoodPack>(FOOD_PACKS_KEY, DEFAULT_FOOD_PACKS)
      return barangayName ? stored.filter((p) => !p.barangay_name || p.barangay_name === barangayName) : stored
    }
    return data as FoodPack[]
  } catch {
    const stored = getFromStorage<FoodPack>(FOOD_PACKS_KEY, DEFAULT_FOOD_PACKS)
    return barangayName ? stored.filter((p) => !p.barangay_name || p.barangay_name === barangayName) : stored
  }
}

export async function createFoodPack(packData: {
  barangay_name: string
  pack_name: string
  description?: string
  target_beneficiary_type?: VulnerabilityCategory | "general_relief"
  contents: {
    food_item_id: string
    quantity_per_pack: number
  }[]
  packs_to_create: number
}): Promise<FoodPack> {
  // 1. Fetch current food inventory
  const inventory = getFromStorage<FoodInventoryItem>(FOOD_INVENTORY_KEY, DEFAULT_FOOD_INVENTORY)

  // 2. Validate sufficient inventory
  for (const c of packData.contents) {
    const invItem = inventory.find((i) => i.id === c.food_item_id)
    if (!invItem) {
      throw new Error(`Inventory item not found for ID ${c.food_item_id}`)
    }
    const totalNeeded = c.quantity_per_pack * packData.packs_to_create
    if (invItem.quantity < totalNeeded) {
      throw new Error(
        `Insufficient stock for "${invItem.item_name}". Required: ${totalNeeded} ${invItem.unit}, Available: ${invItem.quantity} ${invItem.unit}`
      )
    }
  }

  // 3. Deduct stock from inventory
  const updatedInventory = inventory.map((invItem) => {
    const c = packData.contents.find((ci) => ci.food_item_id === invItem.id)
    if (c) {
      const deduction = c.quantity_per_pack * packData.packs_to_create
      return { ...invItem, quantity: invItem.quantity - deduction }
    }
    return invItem
  })
  saveToStorage(FOOD_INVENTORY_KEY, updatedInventory)

  // 4. Construct detailed contents & find earliest expiry date among contents
  let earliestDate: string | null = null
  const detailedContents: FoodPackContent[] = packData.contents.map((c) => {
    const invItem = inventory.find((i) => i.id === c.food_item_id)!
    const effDate = getEffectiveExpiryDate(invItem) || "2099-12-31"

    if (!earliestDate || new Date(effDate) < new Date(earliestDate)) {
      earliestDate = effDate
    }

    return {
      food_item_id: invItem.id,
      item_name: invItem.item_name,
      category: invItem.category,
      quantity_per_pack: c.quantity_per_pack,
      unit: invItem.unit,
      expiry_type: invItem.expiry_type,
      effective_expiry_date: effDate,
    }
  })

  const finalEarliestExpiry = earliestDate || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]
  const urgency = getFoodItemUrgency({
    expiry_type: "exact",
    expiry_date: finalEarliestExpiry,
  }).level

  const newPack: FoodPack = {
    id: `pack-${Date.now()}`,
    barangay_name: packData.barangay_name,
    pack_name: packData.pack_name,
    description: packData.description,
    target_beneficiary_type: packData.target_beneficiary_type,
    contents: detailedContents,
    quantity_available: packData.packs_to_create,
    earliest_expiry_date: finalEarliestExpiry,
    urgency_level: urgency,
    created_at: new Date().toISOString(),
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("food_packs").insert([newPack]).select().single()
    if (!error && data) {
      return data as FoodPack
    }
  } catch (e) {
    console.warn("Falling back to local storage for createFoodPack", e)
  }

  const existingPacks = getFromStorage<FoodPack>(FOOD_PACKS_KEY, DEFAULT_FOOD_PACKS)
  const updatedPacks = [newPack, ...existingPacks]
  saveToStorage(FOOD_PACKS_KEY, updatedPacks)

  return newPack
}

