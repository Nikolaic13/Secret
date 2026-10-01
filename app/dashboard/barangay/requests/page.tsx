"use client"

import { useBarangay } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function RequestsPage() {
  const {
    saveMessage,
    requestForm,
    setRequestForm,
    submitFoodRequest,
    loading
  } = useBarangay()

  const foodCategoryOptions = [
    "vegetables",
    "fruits",
    "grains",
    "dairy",
    "meat",
    "seafood",
    "canned",
    "bakery",
    "other",
  ]

  const unitOptions = ["kg", "lbs", "pieces", "packs", "boxes", "cans", "bottles"]

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      vegetables: "Vegetables",
      fruits: "Fruits",
      grains: "Grains & Cereals",
      dairy: "Dairy Products",
      meat: "Meat & Poultry",
      seafood: "Seafood",
      canned: "Canned Goods",
      bakery: "Bakery Items",
      other: "Other",
    }
    return categoryMap[category] || category
  }

  return (
    <div className="space-y-6">
      {saveMessage && (
        <Alert
          className={saveMessage.includes("Failed") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}
        >
          <Package className={`h-4 w-4 ${saveMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`} />
          <AlertDescription className={saveMessage.includes("Failed") ? "text-red-800" : "text-green-800"}>
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Submit Food Request
          </CardTitle>
          <CardDescription>
            Request specific food categories based on your barangay's current needs. The MCDA algorithm will
            automatically prioritize your request based on demographic data and urgency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="food_category">Food Category *</Label>
                <select
                  id="food_category"
                  value={requestForm.food_category}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      food_category: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select food category</option>
                  {foodCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity_needed">Quantity Needed</Label>
                  <Input
                    id="quantity_needed"
                    type="number"
                    min="1"
                    value={requestForm.quantity_needed}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        quantity_needed: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    value={requestForm.unit}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        unit: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select unit</option>
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MCDA Information Box */}
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <strong>MCDA Prioritization:</strong> Your request will be automatically prioritized based on:
                  <ul className="mt-1 ml-4 list-disc text-xs">
                    <li>Your barangay's demographic vulnerability</li>
                    <li>Food security level and urgency score</li>
                    <li>Category-specific needs (e.g., children need dairy/fruits)</li>
                    <li>Distance from distribution center</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <textarea
                  id="reason"
                  placeholder="Explain why this food category is needed in your barangay..."
                  value={requestForm.reason}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      reason: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements">Special Requirements</Label>
                <textarea
                  id="special_requirements"
                  placeholder="Any special requirements or notes (optional)..."
                  value={requestForm.special_requirements}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      special_requirements: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={submitFoodRequest} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              <Package className="h-4 w-4 mr-2" />
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
