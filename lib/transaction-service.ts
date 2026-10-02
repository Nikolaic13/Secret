import { createClient } from "@/lib/supabase/client"

export interface TransactionLogEntry {
  id: string
  food_item_id: string
  item_title: string
  actor_id?: string
  actor_name?: string
  actor_role?: string
  action_type:
    | "donated"
    | "pickup_requested"
    | "driver_assigned"
    | "claimed"
    | "stored"
    | "algo_allocated"
    | "manual_allocated"
    | "manual_overridden"
    | "distributed"
    | "rejected"
    | "status_change"
  old_status?: string
  new_status?: string
  target_barangay?: string
  quantity?: number
  unit?: string
  notes?: string
  created_at: string
}

const LOCAL_STORAGE_KEY = "foodshare_transaction_logs"

/**
 * Log a transaction in both Supabase and localStorage fallback
 */
export async function logDonationTransaction(entry: Omit<TransactionLogEntry, "id" | "created_at">): Promise<TransactionLogEntry> {
  const newLog: TransactionLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  }

  // 1. Try Supabase
  try {
    const supabase = createClient()
    await supabase.from("transaction_logs").insert([newLog])
  } catch (err) {
    console.warn("Could not insert transaction log into Supabase, saving to localStorage:", err)
  }

  // 2. LocalStorage backup
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY)
      const list: TransactionLogEntry[] = existing ? JSON.parse(existing) : []
      list.unshift(newLog)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error("Failed saving transaction log to localStorage:", e)
    }
  }

  return newLog
}

/**
 * Fetch all transaction logs, optionally filtered by food_item_id or target_barangay
 */
export async function getTransactionLogs(filters?: {
  food_item_id?: string
  target_barangay?: string
  actor_id?: string
}): Promise<TransactionLogEntry[]> {
  let logs: TransactionLogEntry[] = []

  try {
    const supabase = createClient()
    let query = supabase.from("transaction_logs").select("*").order("created_at", { ascending: false })

    if (filters?.food_item_id) {
      query = query.eq("food_item_id", filters.food_item_id)
    }
    if (filters?.target_barangay) {
      query = query.eq("target_barangay", filters.target_barangay)
    }
    if (filters?.actor_id) {
      query = query.eq("actor_id", filters.actor_id)
    }

    const { data, error } = await query
    if (!error && data && data.length > 0) {
      logs = data as TransactionLogEntry[]
      return logs
    }
  } catch (err) {
    console.warn("Could not fetch transaction logs from Supabase, checking localStorage fallback:", err)
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (existing) {
        let localLogs: TransactionLogEntry[] = JSON.parse(existing)
        if (filters?.food_item_id) {
          localLogs = localLogs.filter((l) => l.food_item_id === filters.food_item_id)
        }
        if (filters?.target_barangay) {
          localLogs = localLogs.filter((l) => l.target_barangay === filters.target_barangay)
        }
        if (filters?.actor_id) {
          localLogs = localLogs.filter((l) => l.actor_id === filters.actor_id)
        }
        return localLogs
      }
    } catch (e) {
      console.error("Failed reading transaction logs from localStorage", e)
    }
  }

  return logs
}
