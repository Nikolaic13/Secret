import { describe, it, expect } from "vitest"
import {
  getFoodItemUrgency,
  getEffectiveExpiryDate,
  getAgeCategory,
  isClothingAgeAppropriate,
  ClothingItem,
} from "@/lib/distribution-service"

describe("Distribution Service Unit Tests", () => {
  describe("getEffectiveExpiryDate", () => {
    it("returns null for non_perishable items", () => {
      const result = getEffectiveExpiryDate({
        expiry_type: "non_perishable",
      })
      expect(result).toBeNull()
    })

    it("returns exact date for exact expiry type", () => {
      const result = getEffectiveExpiryDate({
        expiry_type: "exact",
        expiry_date: "2026-11-15",
      })
      expect(result).toBe("2026-11-15")
    })

    it("returns earliest date from range for range expiry type", () => {
      const result = getEffectiveExpiryDate({
        expiry_type: "range",
        expiry_date_from: "2026-10-30",
        expiry_date_to: "2026-11-10",
      })
      expect(result).toBe("2026-10-30")
    })
  })

  describe("getFoodItemUrgency", () => {
    it("marks non-perishable food as safe", () => {
      const urgency = getFoodItemUrgency({
        expiry_type: "non_perishable",
      })
      expect(urgency.level).toBe("safe")
      expect(urgency.isExpiringSoon).toBe(false)
      expect(urgency.label).toContain("Non-Perishable")
    })

    it("marks food expiring in 1 day as critical FEFO priority", () => {
      const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)
        .toISOString()
        .split("T")[0]

      const urgency = getFoodItemUrgency({
        expiry_type: "exact",
        expiry_date: tomorrow,
      })
      expect(urgency.level).toBe("critical")
      expect(urgency.isExpiringSoon).toBe(true)
    })

    it("marks food expiring in 40 days as moderate (medium)", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 40)
        .toISOString()
        .split("T")[0]

      const urgency = getFoodItemUrgency({
        expiry_type: "exact",
        expiry_date: futureDate,
      })
      expect(urgency.level).toBe("medium")
      expect(urgency.isExpiringSoon).toBe(false)
    })

    it("marks food expiring in 120 days as safe", () => {
      const distantFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 120)
        .toISOString()
        .split("T")[0]

      const urgency = getFoodItemUrgency({
        expiry_type: "exact",
        expiry_date: distantFuture,
      })
      expect(urgency.level).toBe("safe")
      expect(urgency.isExpiringSoon).toBe(false)
    })
  })

  describe("getAgeCategory and Clothing Matching", () => {
    it("categorizes beneficiary ages correctly", () => {
      expect(getAgeCategory(1)).toBe("infant")
      expect(getAgeCategory(6)).toBe("child")
      expect(getAgeCategory(15)).toBe("teen")
      expect(getAgeCategory(30)).toBe("adult")
      expect(getAgeCategory(68)).toBe("senior")
    })

    it("determines age-appropriateness for clothing items", () => {
      const teenJacket: ClothingItem = {
        id: "c-01",
        barangay_name: "Damires",
        item_name: "Warm Fleece Jacket",
        clothing_type: "jacket",
        min_age: 13,
        max_age: 17,
        target_age_group: "teen",
        size: "M",
        gender_target: "unisex",
        quantity: 5,
        condition: "new",
      }

      // isClothingAgeAppropriate(beneficiaryAge, clothingItem)
      expect(isClothingAgeAppropriate(15, teenJacket).isAppropriate).toBe(true)
      expect(isClothingAgeAppropriate(4, teenJacket).isAppropriate).toBe(false)
      expect(isClothingAgeAppropriate(72, teenJacket).isAppropriate).toBe(false)
    })
  })
})
