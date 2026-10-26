import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock Supabase client to support chainable query builder (.select().order().eq())
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => {
        const q: any = {
          order: () => q,
          eq: () => q,
          then: (resolve: any) => resolve({ data: null, error: null }),
        }
        return q
      },
      insert: () => Promise.resolve({ error: null }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "test-user-id" } } }),
    },
  }),
}))

import {
  logDonationTransaction,
  getTransactionLogs,
  TransactionLogEntry,
} from "@/lib/transaction-service"

const mockStorage: Record<string, string> = {}
beforeEach(() => {
  for (const k of Object.keys(mockStorage)) {
    delete mockStorage[k]
  }

  // Ensure window is defined for Node test environment
  globalThis.window = globalThis as any

  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value
    },
    removeItem: (key: string) => {
      delete mockStorage[key]
    },
    clear: () => {
      for (const k of Object.keys(mockStorage)) delete mockStorage[k]
    },
    length: Object.keys(mockStorage).length,
    key: (index: number) => Object.keys(mockStorage)[index] || null,
  } as Storage
})

describe("Transaction Service Unit Tests", () => {
  it("logs a new donation distribution transaction", async () => {
    const entry = await logDonationTransaction({
      food_item_id: "food-test-01",
      item_title: "Fortified Rice 50kg",
      action_type: "distributed",
      target_barangay: "Damires",
      quantity: 50,
      unit: "kg",
      notes: "Distributed to Purok 3 beneficiaries",
    })

    expect(entry).toBeDefined()
    expect(entry.id).toMatch(/^log_/)
    expect(entry.action_type).toBe("distributed")
    expect(entry.target_barangay).toBe("Damires")
    expect(entry.created_at).toBeDefined()

    // Fetch logs and verify entry is retrievable
    const logs = await getTransactionLogs()
    const found = logs.find((l) => l.id === entry.id)
    expect(found).toBeDefined()
    expect(found?.item_title).toBe("Fortified Rice 50kg")
  })

  it("filters logs by target_barangay", async () => {
    await logDonationTransaction({
      food_item_id: "food-02",
      item_title: "Fresh Vegetables",
      action_type: "algo_allocated",
      target_barangay: "Aquino",
      quantity: 20,
      unit: "kg",
    })

    await logDonationTransaction({
      food_item_id: "food-03",
      item_title: "Canned Goods",
      action_type: "manual_allocated",
      target_barangay: "Lonoy",
      quantity: 15,
      unit: "packs",
    })

    const aquinoLogs = await getTransactionLogs({ target_barangay: "Aquino" })
    expect(aquinoLogs.length).toBeGreaterThan(0)
    for (const l of aquinoLogs) {
      expect(l.target_barangay).toBe("Aquino")
    }
  })
})
