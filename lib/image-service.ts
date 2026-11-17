import { createClient } from "@/lib/supabase/client"

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const LOCAL_FOOD_IMAGES_KEY = "foodshare_food_item_images"

const FOOD_IMAGES_BUCKET = "food-images"

/**
 * Validate an image file's MIME type and byte size before processing or upload.
 */
export function validateImageFile(file: { type: string; size: number }): {
  valid: boolean
  error?: string
} {
  const mimeType = (file.type || "").toLowerCase()
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: "Please select a valid image file (JPEG, PNG, WebP, or GIF).",
    }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image size must be less than 10MB.",
    }
  }

  return { valid: true }
}

/**
 * Resize and compress an image file client-side using an HTML5 canvas.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.8
): Promise<{ dataUrl: string; blob: Blob }> {
  const sourceDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Failed to read image file."))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to decode image file."))
    image.src = sourceDataUrl
  })

  let targetWidth = img.width || maxDimension
  let targetHeight = img.height || maxDimension

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth >= targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth)
      targetWidth = maxDimension
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight)
      targetHeight = maxDimension
    }
  }

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Unable to initialize image compression canvas.")
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  const dataUrl = canvas.toDataURL("image/jpeg", quality)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error("Failed to compress image blob."))
        }
      },
      "image/jpeg",
      quality
    )
  })

  return { dataUrl, blob }
}

/**
 * Validate, compress, and upload a donation photo to Supabase Storage with a compressed Data URL fallback.
 */
export async function uploadDonationImage(file: File, donorId?: string): Promise<string> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file.")
  }

  const { dataUrl, blob } = await compressImageToDataUrl(file)

  try {
    const supabase = createClient()
    const filePath = `donations/${donorId || "donor"}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}.jpg`

    const { error: uploadError } = await supabase.storage
      .from(FOOD_IMAGES_BUCKET)
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: false,
      })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from(FOOD_IMAGES_BUCKET)
        .getPublicUrl(filePath)

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl
      }
    } else {
      console.warn("Supabase storage upload failed, using compressed image fallback:", uploadError.message)
    }
  } catch (err) {
    console.warn("Could not upload image to Supabase Storage, using compressed image fallback:", err)
  }

  return dataUrl
}

function readLocalImageMap(): Record<string, string> {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return {}
  }

  try {
    const raw = localStorage.getItem(LOCAL_FOOD_IMAGES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeLocalImageMap(map: Record<string, string>): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return
  }

  try {
    localStorage.setItem(LOCAL_FOOD_IMAGES_KEY, JSON.stringify(map))
  } catch (err) {
    console.error("Failed to save food item image cache to localStorage:", err)
  }
}

/**
 * Persist or clear a food item image URL/Data URL in localStorage as a schema fallback.
 */
export function saveLocalFoodImage(foodItemId: string, imageUrl: string | null | undefined): void {
  if (!foodItemId) return
  const map = readLocalImageMap()

  if (!imageUrl) {
    if (foodItemId in map) {
      delete map[foodItemId]
      writeLocalImageMap(map)
    }
    return
  }

  map[foodItemId] = imageUrl
  writeLocalImageMap(map)
}

/**
 * Retrieve a cached food item image from localStorage by food item ID.
 */
export function getLocalFoodImage(foodItemId: string): string | undefined {
  if (!foodItemId) return undefined
  const map = readLocalImageMap()
  return map[foodItemId] || undefined
}

/**
 * Remove a food item's cached image from localStorage.
 */
export function removeLocalFoodImage(foodItemId: string): void {
  if (!foodItemId) return
  const map = readLocalImageMap()
  if (foodItemId in map) {
    delete map[foodItemId]
    writeLocalImageMap(map)
  }
}

/**
 * Resolve a food item's display image, preferring the DB column value and falling back to localStorage.
 */
export function resolveFoodItemImage(
  item: { id?: string | number; image_url?: string | null } | null | undefined
): string | undefined {
  if (!item) return undefined
  if (item.image_url) return item.image_url
  if (item.id !== undefined && item.id !== null) {
    return getLocalFoodImage(String(item.id))
  }
  return undefined
}
