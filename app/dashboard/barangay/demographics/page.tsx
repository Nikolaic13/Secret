"use client"

import { useBarangay } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Users, Package } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function DemographicsPage() {
  const {
    barangayData,
    saveMessage,
    demographicForm,
    setDemographicForm,
    saveDemographicData,
    loading
  } = useBarangay()

  return (
    <div className="space-y-6">
      {/* Save Message */}
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

      {/* Barangay Overview */}
      {barangayData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {barangayData.name} Overview
            </CardTitle>
            <CardDescription>
              Current demographic information for your barangay - used by MCDA algorithm for fair distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(barangayData.population || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Population</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(barangayData.children_population || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Children (0-17)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(barangayData.elderly_population || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Elderly (60+)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(barangayData.malnourished_children || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Malnourished Children</div>
              </div>
            </div>

            {/* MCDA Information */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>MCDA Algorithm:</strong> The Multi-Criteria Decision Analysis algorithm uses your demographic
                data, barangay urgency score ({barangayData.urgency_score}/10), food security level (
                {barangayData.food_security_level}/10), and distance ({barangayData.distance_km}km) to fairly
                prioritize food distribution based on actual need.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Demographic Data Input
          </CardTitle>
          <CardDescription>
            Update demographic information for your barangay. This data is crucial for the MCDA algorithm to
            fairly prioritize food distribution based on vulnerability and need.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total_population" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Population
                  </Label>
                  <Input
                    id="total_population"
                    type="number"
                    min="0"
                    value={barangayData?.population || 0}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">This is read-only data from the system</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children_population" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Children Population (0-17 years)
                  </Label>
                  <Input
                    id="children_population"
                    type="number"
                    min="0"
                    value={demographicForm.children_population}
                    onChange={(e) =>
                      setDemographicForm({
                        ...demographicForm,
                        children_population: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Higher child population increases priority for dairy, fruits, and vegetables
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="elderly_population" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Elderly Population (60+ years)
                  </Label>
                  <Input
                    id="elderly_population"
                    type="number"
                    min="0"
                    value={demographicForm.elderly_population}
                    onChange={(e) =>
                      setDemographicForm({
                        ...demographicForm,
                        elderly_population: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Higher elderly population increases priority for protein, dairy, and medical supplies
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="malnourished_children" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Malnourished Children
                  </Label>
                  <Input
                    id="malnourished_children"
                    type="number"
                    min="0"
                    value={demographicForm.malnourished_children}
                    onChange={(e) =>
                      setDemographicForm({
                        ...demographicForm,
                        malnourished_children: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Higher malnourished children population increases priority for basic sustenance and special
                    dietary needs
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveDemographicData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Package className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Demographic Data"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
