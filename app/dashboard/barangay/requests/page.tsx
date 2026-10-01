"use client"

import { useBarangay } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, Send, AlertTriangle, CheckCircle2, ArrowRight, Clock, HelpCircle, ShieldCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RequestsPage() {
  const {
    saveMessage,
    requestForm,
    setRequestForm,
    submitFoodRequest,
    loading,
    barangayData,
  } = useBarangay()

  const foodCategoryOptions = [
    "grains",
    "canned",
    "dairy",
    "vegetables",
    "fruits",
    "meat",
    "seafood",
    "bakery",
    "other",
  ]

  const unitOptions = ["sacks", "kg", "packs", "boxes", "cans", "tins", "bottles"]

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      grains: "Grains & Rice (Cereals)",
      canned: "Canned Goods & Proteins",
      dairy: "Dairy & Infant Formula",
      vegetables: "Fresh Vegetables",
      fruits: "Fresh Fruits",
      meat: "Meat & Poultry",
      seafood: "Seafood & Fish",
      bakery: "Bread & Bakery Items",
      other: "Other Essentials",
    }
    return categoryMap[category] || category
  }

  const priorityOptions = [
    {
      level: 5,
      label: "Standard Priority (Routine replenishment)",
      color: "bg-blue-100 text-blue-800",
      description: "Regular buffer stock maintenance",
    },
    {
      level: 8,
      label: "High Priority (Critical demographic gap)",
      color: "bg-orange-100 text-orange-800",
      description: "Severe shortage affecting infants, pregnant mothers, or seniors",
    },
    {
      level: 10,
      label: "Emergency / Calamity Need (Immediate relief)",
      color: "bg-red-100 text-red-800",
      description: "Sudden calamity, flood, fire, or acute community crisis",
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Barangay Food & Relief Request
            </h1>
            <Badge variant="outline" className="text-xs bg-white text-gray-700">
              Official Workflow
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Submit formal food supply requests to the Municipal Social Welfare and Development (MSWD) office.
          </p>
        </div>

        <Link href="/dashboard/barangay/history">
          <Button variant="outline" className="border-gray-300 flex items-center gap-2 text-xs">
            <Clock className="h-4 w-4 text-gray-500" />
            Track Request Lifecycle
          </Button>
        </Link>
      </div>

      {/* Process Lifecycle Stepper Banner */}
      <Card className="bg-gradient-to-r from-orange-50/70 via-white to-orange-50/40 border-orange-200 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-950 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-orange-600" />
            Official Municipal Supply Request Process
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-orange-100 shadow-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">
                1
              </span>
              <div>
                <span className="font-semibold text-gray-900">Barangay Filing</span>
                <p className="text-gray-500 text-[11px] mt-0.5">Submit request with justification & urgency.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-orange-100 shadow-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">
                2
              </span>
              <div>
                <span className="font-semibold text-gray-900">MCDA Assessment</span>
                <p className="text-gray-500 text-[11px] mt-0.5">Algorithm ranks need using demographic data.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-orange-100 shadow-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">
                3
              </span>
              <div>
                <span className="font-semibold text-gray-900">MSWD Approval</span>
                <p className="text-gray-500 text-[11px] mt-0.5">Municipal office approves & allocates inventory.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-orange-100 shadow-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">
                4
              </span>
              <div>
                <span className="font-semibold text-gray-900">Dispatch & Claim</span>
                <p className="text-gray-500 text-[11px] mt-0.5">Supplies dispatched to barangay for distribution.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {saveMessage && (
        <Alert
          className={saveMessage.includes("Failed") ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200 text-emerald-900"}
        >
          <Package className={`h-5 w-5 ${saveMessage.includes("Failed") ? "text-red-600" : "text-emerald-600"}`} />
          <AlertTitle className="font-semibold">
            {saveMessage.includes("Failed") ? "Request Submission Failed" : "Request Submitted Successfully"}
          </AlertTitle>
          <AlertDescription className="text-sm mt-1">{saveMessage}</AlertDescription>
        </Alert>
      )}

      {/* Request Form */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-orange-600" />
            File New Supply Request
          </CardTitle>
          <CardDescription>
            Specify the food category, quantities, and justification. The Multi-Criteria Decision Analysis (MCDA) engine will prioritize your request against other barangays.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="food_category" className="text-sm font-semibold">
                  Requested Food Category *
                </Label>
                <select
                  id="food_category"
                  value={requestForm.food_category}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      food_category: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                >
                  <option value="">Select category...</option>
                  {foodCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity_needed" className="text-sm font-semibold">
                    Quantity Needed *
                  </Label>
                  <Input
                    id="quantity_needed"
                    type="number"
                    min="1"
                    value={requestForm.quantity_needed || ""}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        quantity_needed: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g. 50"
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-semibold">
                    Unit of Measurement
                  </Label>
                  <select
                    id="unit"
                    value={requestForm.unit}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        unit: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Level */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold">
                  Urgency / Priority Level *
                </Label>
                <select
                  id="priority"
                  value={requestForm.priority_level || 5}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      priority_level: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {priorityOptions.map((p) => (
                    <option key={p.level} value={p.level}>
                      Level {p.level} - {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Higher levels trigger immediate alerts to municipal relief officers.
                </p>
              </div>

              {/* MCDA Demographic Notice */}
              <div className="p-3.5 bg-orange-50/80 rounded-xl border border-orange-100 text-xs text-orange-900 space-y-1.5">
                <span className="font-semibold flex items-center gap-1.5 text-orange-800">
                  <HelpCircle className="h-4 w-4" />
                  Automated MCDA Prioritization Factors:
                </span>
                <p className="text-orange-700 leading-relaxed">
                  Your request is weighted against vulnerability demographics recorded for your barangay
                  {barangayData ? ` (Malnourished: ${barangayData.malnourished_children}, Infants: ${barangayData.families_with_infants}, Elderly: ${barangayData.elderly_population})` : ""}.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-semibold">
                  Justification & Community Context *
                </Label>
                <textarea
                  id="reason"
                  placeholder="Detail the community situation, affected puroks, estimated vulnerable families, or recent calamity events necessitating this aid..."
                  value={requestForm.reason}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      reason: e.target.value,
                    })
                  }
                  rows={5}
                  className="w-full p-3 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements" className="text-sm font-semibold">
                  Special Requirements / Dietary Specs (Optional)
                </Label>
                <textarea
                  id="special_requirements"
                  placeholder="e.g. Needs halal preparation, infant-safe packaging, soft-textured foods for bedridden seniors..."
                  value={requestForm.special_requirements}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      special_requirements: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-3 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <Link href="/dashboard/barangay/history" className="text-xs text-orange-700 hover:underline flex items-center gap-1">
              View previous food requests history
              <ArrowRight className="h-3 w-3" />
            </Link>

            <Button
              onClick={submitFoodRequest}
              disabled={loading}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 shadow-sm flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? "Submitting Request..." : "Submit Supply Request to MSWD"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
