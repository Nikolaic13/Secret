"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useDonor, FoodItem } from "../context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Truck, MapPin, AlertCircle, CheckCircle2, User } from "lucide-react"
import { ExpiryType, formatExpiryDisplay } from "@/lib/distribution-service"
import { LocationPickerMap } from "@/components/maps/location-picker-map"
import { logDonationTransaction } from "@/lib/transaction-service"

const MUNICIPAL_HALL_ADDRESS = "Municipal Hall, Janiuay, Iloilo, Philippines"

function DonationFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit") || searchParams.get("id")

  const { profile, foodItems, fetchFoodItems, fetchLogs } = useDonor()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    expiry_type: "exact" as ExpiryType,
    expiry_date: "",
    expiry_date_from: "",
    expiry_date_to: "",
    delivery_method: "pickup",
    pickup_address: "",
    pickup_contact: "",
    pickup_latitude: 10.9575,
    pickup_longitude: 122.5028,
  })

  // Prefill when editing
  useEffect(() => {
    if (!editId) {
      setEditingItem(null)
      return
    }

    const itemToEdit = foodItems.find((item) => item.id === editId)
    if (itemToEdit) {
      setEditingItem(itemToEdit)
      setFormData({
        title: itemToEdit.title,
        description: itemToEdit.description || "",
        category: itemToEdit.category,
        quantity: itemToEdit.quantity.toString(),
        unit: itemToEdit.unit,
        expiry_type: itemToEdit.expiry_type || "exact",
        expiry_date: itemToEdit.expiry_date || "",
        expiry_date_from: itemToEdit.expiry_date_from || "",
        expiry_date_to: itemToEdit.expiry_date_to || "",
        delivery_method: itemToEdit.delivery_method || "pickup",
        pickup_address: itemToEdit.pickup_address || "",
        pickup_contact: itemToEdit.pickup_contact || "",
        pickup_latitude: itemToEdit.pickup_latitude || 10.9575,
        pickup_longitude: itemToEdit.pickup_longitude || 122.5028,
      })
    } else {
      // If foodItems not loaded yet, fetch single item
      supabase
        .from("food_items")
        .select("*")
        .eq("id", editId)
        .single()
        .then(({ data }) => {
          if (data) {
            setEditingItem(data)
            setFormData({
              title: data.title,
              description: data.description || "",
              category: data.category,
              quantity: data.quantity.toString(),
              unit: data.unit,
              expiry_type: data.expiry_type || "exact",
              expiry_date: data.expiry_date || "",
              expiry_date_from: data.expiry_date_from || "",
              expiry_date_to: data.expiry_date_to || "",
              delivery_method: data.delivery_method || "pickup",
              pickup_address: data.pickup_address || "",
              pickup_contact: data.pickup_contact || "",
              pickup_latitude: data.pickup_latitude || 10.9575,
              pickup_longitude: data.pickup_longitude || 122.5028,
            })
          }
        })
    }
  }, [editId, foodItems, supabase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const confirmSubmit = async () => {
    setLoading(true)
    setShowConfirmation(false)

    try {
      // Determine effective expiration date for db compatibility
      const effectiveExpiry =
        formData.expiry_type === "non_perishable"
          ? "2099-12-31"
          : formData.expiry_type === "range"
          ? formData.expiry_date_from || formData.expiry_date_to || new Date().toISOString().split("T")[0]
          : formData.expiry_date

      // Prepare the base item data
      const itemData: any = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        quantity: Number.parseInt(formData.quantity),
        unit: formData.unit,
        expiry_date: effectiveExpiry,
        updated_at: new Date().toISOString(),
      }

      // Add range fields if column exists in schema
      try {
        const { error: colError } = await supabase.from("food_items").select("expiry_type").limit(1)
        if (!colError) {
          itemData.expiry_type = formData.expiry_type
          if (formData.expiry_type === "range") {
            itemData.expiry_date_from = formData.expiry_date_from || null
            itemData.expiry_date_to = formData.expiry_date_to || null
          }
        }
      } catch (e) {
        console.warn("expiry_type column not available, skipping:", e)
      }

      // Add delivery-related fields if supported by database schema
      try {
        await supabase.from("food_items").select("delivery_method").limit(1)

        itemData.delivery_method = formData.delivery_method
        if (formData.delivery_method === "pickup") {
          itemData.pickup_address = formData.pickup_address
          itemData.pickup_contact = formData.pickup_contact
          itemData.pickup_latitude = formData.pickup_latitude
          itemData.pickup_longitude = formData.pickup_longitude
        } else {
          itemData.pickup_address = null
          itemData.pickup_contact = null
          itemData.pickup_latitude = null
          itemData.pickup_longitude = null
        }
      } catch (columnError) {
        console.warn("Delivery method columns not available, skipping:", columnError)
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase.from("food_items").update(itemData).eq("id", editingItem.id)
        if (error) throw error

        await logDonationTransaction({
          food_item_id: editingItem.id,
          item_title: itemData.title,
          actor_id: profile?.id,
          actor_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Donor",
          actor_role: "donor",
          action_type: "status_change",
          new_status: editingItem.status,
          quantity: itemData.quantity,
          unit: itemData.unit,
          notes: "Updated donation details and pickup location pin",
        })
      } else {
        // Create new item
        const newItemId = `food_${Date.now()}`
        const { data: insertedData, error } = await supabase
          .from("food_items")
          .insert({
            donor_id: profile?.id,
            ...itemData,
            status: "available",
          })
          .select()
          .single()

        if (error) throw error

        const assignedId = insertedData?.id || newItemId
        await logDonationTransaction({
          food_item_id: assignedId,
          item_title: itemData.title,
          actor_id: profile?.id,
          actor_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Donor",
          actor_role: "donor",
          action_type: formData.delivery_method === "pickup" ? "pickup_requested" : "donated",
          new_status: "available",
          quantity: itemData.quantity,
          unit: itemData.unit,
          notes:
            formData.delivery_method === "pickup"
              ? `New donation submitted with pinned pickup coordinates (${formData.pickup_latitude.toFixed(4)}, ${formData.pickup_longitude.toFixed(4)})`
              : "New donation posted for drop-off at Municipal Hall",
        })
      }

      await fetchFoodItems()
      await fetchLogs()
      router.push("/dashboard/donor/donations")
    } catch (error: any) {
      console.error("Error saving food item:", error)
      alert(`Failed to save food item: ${error.message}. Please check connection or database status.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/donor/donations">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Donations
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl text-gray-900">
            {editingItem ? "Edit Food Donation" : "Post Surplus Food"}
          </CardTitle>
          <CardDescription>
            {editingItem
              ? "Update details, adjust quantities, or change the pinned pickup location."
              : "Fill out the details below to share surplus food with community beneficiaries."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Food Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fresh Organic Vegetables, Boxed Milk"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  value={formData.category}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="grains">Grains & Cereals</SelectItem>
                    <SelectItem value="dairy">Dairy Products</SelectItem>
                    <SelectItem value="meat">Meat & Poultry</SelectItem>
                    <SelectItem value="seafood">Seafood</SelectItem>
                    <SelectItem value="canned">Canned Goods</SelectItem>
                    <SelectItem value="bakery">Bakery Items</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe the items, condition, storage requirements, packaging, and any special handling notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Quantity, Unit & Expiration Details */}
            <div className="grid md:grid-cols-3 gap-4 items-start">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="e.g., 10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium">Unit *</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  value={formData.unit}
                  required
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="packs">Packs</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiry Selector Card */}
              <div className="p-3.5 bg-gray-50 border rounded-lg space-y-3">
                <Label className="text-xs font-semibold text-gray-800 flex items-center justify-between">
                  <span>Expiration Details *</span>
                </Label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expiry_type: "exact" })}
                    className={`text-xs py-1.5 px-1 text-center rounded border font-medium transition-colors ${
                      formData.expiry_type === "exact"
                        ? "bg-white border-green-600 text-green-800 shadow-sm font-bold"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    Exact Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expiry_type: "range" })}
                    className={`text-xs py-1.5 px-1 text-center rounded border font-medium transition-colors ${
                      formData.expiry_type === "range"
                        ? "bg-white border-green-600 text-green-800 shadow-sm font-bold"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, expiry_type: "non_perishable" })}
                    className={`text-xs py-1.5 px-1 text-center rounded border font-medium transition-colors ${
                      formData.expiry_type === "non_perishable"
                        ? "bg-white border-green-600 text-green-800 shadow-sm font-bold"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    Non-Perish
                  </button>
                </div>

                {formData.expiry_type === "exact" && (
                  <div className="pt-1">
                    <Label htmlFor="expiry_date" className="text-[11px] text-gray-600">
                      Expiry Date *
                    </Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      required
                      className="bg-white mt-1 h-8 text-xs"
                    />
                  </div>
                )}

                {formData.expiry_type === "range" && (
                  <div className="pt-1 space-y-2">
                    <p className="text-[10px] text-gray-500">For mixed batch items:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <Label htmlFor="range_from" className="text-[10px] text-gray-600">
                          From *
                        </Label>
                        <Input
                          id="range_from"
                          type="date"
                          value={formData.expiry_date_from}
                          onChange={(e) => setFormData({ ...formData, expiry_date_from: e.target.value })}
                          required
                          className="bg-white mt-0.5 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="range_to" className="text-[10px] text-gray-600">
                          To *
                        </Label>
                        <Input
                          id="range_to"
                          type="date"
                          value={formData.expiry_date_to}
                          onChange={(e) => setFormData({ ...formData, expiry_date_to: e.target.value })}
                          required
                          className="bg-white mt-0.5 h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.expiry_type === "non_perishable" && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded">
                    Items like salt, sugar, vinegar, or honey do not spoil quickly and are treated as non-perishable.
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-4 pt-2">
              <Label className="text-sm font-medium">Delivery Method *</Label>
              <RadioGroup
                value={formData.delivery_method}
                onValueChange={(value) => setFormData({ ...formData, delivery_method: value })}
                className="grid sm:grid-cols-2 gap-3"
              >
                <label
                  htmlFor="pickup"
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.delivery_method === "pickup"
                      ? "border-green-600 bg-green-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" className="mt-0.5" />
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                      <Truck className="h-4 w-4 text-blue-600" />
                      Pickup Service
                    </div>
                    <p className="text-gray-500 mt-1">We will collect the food directly from your pinned location.</p>
                  </div>
                </label>

                <label
                  htmlFor="dropoff"
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.delivery_method === "dropoff"
                      ? "border-green-600 bg-green-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value="dropoff" id="dropoff" className="mt-0.5" />
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      Self Drop-off
                    </div>
                    <p className="text-gray-500 mt-1">You will deliver the items directly to the Municipal Hall.</p>
                  </div>
                </label>
              </RadioGroup>

              {/* Pickup location & map */}
              {formData.delivery_method === "pickup" && (
                <div className="space-y-4 p-5 bg-blue-50/60 rounded-xl border border-blue-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickup_address" className="text-xs font-semibold text-blue-900">
                        Pickup Address *
                      </Label>
                      <Textarea
                        id="pickup_address"
                        rows={2}
                        placeholder="Enter your street, purok, or landmark address"
                        value={formData.pickup_address}
                        onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                        required={formData.delivery_method === "pickup"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickup_contact" className="text-xs font-semibold text-blue-900">
                        Contact Phone Number *
                      </Label>
                      <Input
                        id="pickup_contact"
                        type="tel"
                        placeholder="e.g., 09123456789"
                        value={formData.pickup_contact}
                        onChange={(e) => setFormData({ ...formData, pickup_contact: e.target.value })}
                        required={formData.delivery_method === "pickup"}
                      />
                    </div>
                  </div>

                  {/* OpenStreetMap Pinner */}
                  <div className="pt-2">
                    <LocationPickerMap
                      initialLat={formData.pickup_latitude}
                      initialLng={formData.pickup_longitude}
                      onChange={(pos) =>
                        setFormData((prev) => ({
                          ...prev,
                          pickup_latitude: pos.lat,
                          pickup_longitude: pos.lng,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Drop-off notice */}
              {formData.delivery_method === "dropoff" && (
                <Alert className="bg-emerald-50 border-emerald-200 text-xs">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    <strong>Drop-off Location:</strong> {MUNICIPAL_HALL_ADDRESS}
                    <br />
                    <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Processing..." : editingItem ? "Update Food Item" : "Post Food Item"}
              </Button>
              <Link href="/dashboard/donor/donations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Food Donation</DialogTitle>
            <DialogDescription>
              Are you sure you want to {editingItem ? "update" : "post"} this food donation?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-gray-50 rounded-lg text-xs space-y-2 border">
              <h4 className="font-semibold text-gray-900 text-sm">{formData.title}</h4>
              <p className="text-gray-600">
                <strong>Category:</strong> <span className="capitalize">{formData.category}</span> |{" "}
                <strong>Quantity:</strong> {formData.quantity} {formData.unit}
              </p>
              <p className="text-gray-600">
                <strong>Expiration:</strong>{" "}
                {formatExpiryDisplay({
                  expiry_type: formData.expiry_type,
                  expiry_date: formData.expiry_date,
                  expiry_date_from: formData.expiry_date_from,
                  expiry_date_to: formData.expiry_date_to,
                })}
              </p>
              <p className="text-gray-600">
                <strong>Delivery Method:</strong> {formData.delivery_method === "pickup" ? "Pickup Service" : "Self Drop-off"}
                {formData.delivery_method === "pickup" && formData.pickup_address && (
                  <span> ({formData.pickup_address})</span>
                )}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Submitting..." : editingItem ? "Confirm Update" : "Confirm Donation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function NewDonationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-gray-500">
          Loading donation form...
        </div>
      }
    >
      <DonationFormContent />
    </Suspense>
  )
}
