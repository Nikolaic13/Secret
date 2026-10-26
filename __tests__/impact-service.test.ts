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
  getCommunityImpactStories,
  getDonorJourneys,
  getDonorImpactMetrics,
  createImpactStory,
  toggleStoryCheer,
} from "@/lib/impact-service"

// In-memory mock for localStorage in Node test environment
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

describe("Impact Service Unit Tests", () => {
  describe("getCommunityImpactStories", () => {
    it("returns default community impact stories with all required fields", async () => {
      const stories = await getCommunityImpactStories()

      expect(stories).toBeDefined()
      expect(Array.isArray(stories)).toBe(true)
      expect(stories.length).toBeGreaterThan(0)

      const firstStory = stories[0]
      expect(firstStory).toHaveProperty("id")
      expect(firstStory).toHaveProperty("barangayName")
      expect(firstStory).toHaveProperty("title")
      expect(firstStory).toHaveProperty("description")
      expect(firstStory).toHaveProperty("targetGroup")
      expect(firstStory).toHaveProperty("beneficiariesServed")
      expect(firstStory).toHaveProperty("familiesCount")
      expect(firstStory).toHaveProperty("photos")
      expect(Array.isArray(firstStory.photos)).toBe(true)
      expect(firstStory.photos.length).toBeGreaterThan(0)
      expect(firstStory).toHaveProperty("itemsIncluded")
      expect(firstStory).toHaveProperty("tags")
    })

    it("filters stories accurately by barangay name", async () => {
      const damiresStories = await getCommunityImpactStories({ barangay: "Damires" })
      expect(damiresStories.length).toBeGreaterThan(0)
      for (const s of damiresStories) {
        expect(s.barangayName.toLowerCase()).toBe("damires")
      }

      const allStories = await getCommunityImpactStories({ barangay: "all" })
      expect(allStories.length).toBeGreaterThanOrEqual(damiresStories.length)
    })
  })

  describe("toggleStoryCheer", () => {
    it("toggles cheer count and user cheered state", async () => {
      const stories = await getCommunityImpactStories()
      const targetStory = stories[0]
      const initialCount = targetStory.cheerCount

      // 1. Cheer the story
      const cheerResult = await toggleStoryCheer(targetStory.id)
      expect(cheerResult.userHasCheered).toBe(true)
      expect(cheerResult.cheerCount).toBe(initialCount + 1)

      // 2. Uncheer the story
      const uncheerResult = await toggleStoryCheer(targetStory.id)
      expect(uncheerResult.userHasCheered).toBe(false)
      expect(uncheerResult.cheerCount).toBe(initialCount)
    })
  })

  describe("getDonorJourneys", () => {
    it("returns structured 4-step donation journeys", async () => {
      const journeys = await getDonorJourneys("test-donor-123")

      expect(journeys).toBeDefined()
      expect(journeys.length).toBeGreaterThan(0)

      const first = journeys[0]
      expect(first).toHaveProperty("foodItemId")
      expect(first).toHaveProperty("title")
      expect(first).toHaveProperty("category")
      expect(first).toHaveProperty("quantity")
      expect(first).toHaveProperty("estimatedMeals")
      expect(first).toHaveProperty("steps")
      expect(first.steps.length).toBe(4)

      // Verify the 4 mandatory lifecycle stages in sequential order
      const stepNames = first.steps.map((s) => s.step)
      expect(stepNames).toEqual(["donated", "collected", "allocated", "distributed"])

      // Verify step 1 (Donated) is completed
      expect(first.steps[0].isCompleted).toBe(true)
      expect(first.steps[0].location).toBeDefined()
    })

    it("computes reasonable meal equivalents from quantity", async () => {
      const journeys = await getDonorJourneys("test-donor-123")
      for (const j of journeys) {
        expect(j.estimatedMeals).toBeGreaterThan(0)
        if (j.quantity >= 50) {
          expect(j.estimatedMeals).toBeGreaterThanOrEqual(100)
        }
      }
    })
  })

  describe("getDonorImpactMetrics", () => {
    it("calculates cumulative donor impact statistics", async () => {
      const metrics = await getDonorImpactMetrics("test-donor-123")

      expect(metrics).toBeDefined()
      expect(metrics.totalDonations).toBeGreaterThan(0)
      expect(metrics.totalQuantity).toBeGreaterThan(0)
      expect(metrics.estimatedMeals).toBeGreaterThan(0)
      expect(metrics.divertedWasteKg).toBeGreaterThan(0)
      expect(metrics.barangaysReachedCount).toBeGreaterThan(0)
      expect(Array.isArray(metrics.barangaysReached)).toBe(true)
      expect(metrics.barangaysReached.length).toBeGreaterThan(0)
      expect(metrics.familiesSupported).toBeGreaterThan(0)
    })
  })

  describe("createImpactStory", () => {
    it("successfully creates and stores a new impact story dispatch", async () => {
      const newStory = await createImpactStory({
        barangayName: "Gines",
        title: "Purok 2 Rice Relief Distribution",
        summary: "Provided rice to 10 households in Purok 2.",
        description: "Nutritious fortified rice distributed by BHW and volunteers.",
        photos: ["/images/impact/brgy_feeding_drive.jpg"],
        targetGroup: "Low-Income Families",
        beneficiariesServed: 35,
        familiesCount: 10,
        purok: "Purok 2",
        date: new Date().toISOString(),
        officialsInvolved: ["BHW Maria", "Captain Lopez"],
        itemsIncluded: [{ name: "Fortified Rice", quantity: 30, unit: "kg" }],
        tags: ["Rice Relief", "Emergency Assistance"],
      })

      expect(newStory).toBeDefined()
      expect(newStory.id).toMatch(/^story_/)
      expect(newStory.barangayName).toBe("Gines")
      expect(newStory.title).toBe("Purok 2 Rice Relief Distribution")
      expect(newStory.cheerCount).toBe(0)

      // Querying with filter should retrieve the newly created story
      const ginesStories = await getCommunityImpactStories({ barangay: "Gines" })
      const found = ginesStories.find((s) => s.id === newStory.id)
      expect(found).toBeDefined()
      expect(found?.title).toBe("Purok 2 Rice Relief Distribution")
    })
  })
})
