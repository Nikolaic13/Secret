import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/food-images/${path}` },
        }),
      }),
    },
  }),
}))

import {
  MAX_IMAGE_SIZE_BYTES,
  validateImageFile,
  saveLocalFoodImage,
  getLocalFoodImage,
  removeLocalFoodImage,
  resolveFoodItemImage,
} from "@/lib/image-service"

const mockStorage: Record<string, string> = {}
beforeEach(() => {
  for (const k of Object.keys(mockStorage)) {
    delete mockStorage[k]
  }

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

describe("Image Service Unit Tests", () => {
  describe("validateImageFile", () => {
    it("accepts valid JPEG, PNG, WebP, and GIF image files within size limit", () => {
      expect(validateImageFile({ type: "image/jpeg", size: 1024 * 500 })).toEqual({ valid: true })
      expect(validateImageFile({ type: "image/png", size: 1024 * 1024 })).toEqual({ valid: true })
      expect(validateImageFile({ type: "image/webp", size: 2 * 1024 * 1024 })).toEqual({ valid: true })
      expect(validateImageFile({ type: "image/gif", size: 100 * 1024 })).toEqual({ valid: true })
    })

    it("rejects non-image MIME types", () => {
      const pdfResult = validateImageFile({ type: "application/pdf", size: 1024 })
      expect(pdfResult.valid).toBe(false)
      expect(pdfResult.error).toBe("Please select a valid image file (JPEG, PNG, WebP, or GIF).")

      const txtResult = validateImageFile({ type: "text/plain", size: 256 })
      expect(txtResult.valid).toBe(false)
      expect(txtResult.error).toBe("Please select a valid image file (JPEG, PNG, WebP, or GIF).")
    })

    it("rejects files larger than 10MB", () => {
      const oversizedResult = validateImageFile({
        type: "image/jpeg",
        size: MAX_IMAGE_SIZE_BYTES + 1,
      })
      expect(oversizedResult.valid).toBe(false)
      expect(oversizedResult.error).toBe("Image size must be less than 10MB.")
    })
  })

  describe("Local food image storage & resolution", () => {
    it("saves, retrieves, and removes cached images by food item ID", () => {
      saveLocalFoodImage("food-101", "data:image/jpeg;base64,abc123")
      expect(getLocalFoodImage("food-101")).toBe("data:image/jpeg;base64,abc123")

      removeLocalFoodImage("food-101")
      expect(getLocalFoodImage("food-101")).toBeUndefined()
    })

    it("clears cached image when saveLocalFoodImage is called with null or empty string", () => {
      saveLocalFoodImage("food-102", "https://cdn.example.com/photo.jpg")
      expect(getLocalFoodImage("food-102")).toBe("https://cdn.example.com/photo.jpg")

      saveLocalFoodImage("food-102", null)
      expect(getLocalFoodImage("food-102")).toBeUndefined()
    })

    it("prefers database image_url over localStorage fallback and falls back when missing", () => {
      saveLocalFoodImage("food-200", "data:image/jpeg;base64,localfallback")

      expect(
        resolveFoodItemImage({
          id: "food-200",
          image_url: "https://storage.example.com/remote.jpg",
        })
      ).toBe("https://storage.example.com/remote.jpg")

      expect(
        resolveFoodItemImage({
          id: "food-200",
          image_url: null,
        })
      ).toBe("data:image/jpeg;base64,localfallback")

      expect(
        resolveFoodItemImage({
          id: "food-unknown",
          image_url: null,
        })
      ).toBeUndefined()
    })
  })
})
