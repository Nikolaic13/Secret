"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useBarangay } from "../context"
import {
  getBeneficiaries,
  getClothingInventory,
  getDistributions,
  getFoodInventory,
  getFoodPacks,
  recordDistribution,
  Beneficiary,
  ClothingItem,
  DistributionRecord,
  FoodInventoryItem,
  FoodPack,
  getAgeCategory,
  getAgeGroupLabel,
  isClothingAgeAppropriate,
  getFoodItemUrgency,
  formatExpiryDisplay,
} from "@/lib/distribution-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HeartHandshake,
  Shirt,
  Apple,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Flame,
  ShieldAlert,
  Clock,
  History,
  Info,
  Boxes,
} from "lucide-react"
import Link from "next/link"

const SAMPLE_FOOD_ITEMS = [
  { id: "f-01", name: "Fortified Rice (5kg Pack)", category: "Grains & Cereals", unit: "packs" },
  { id: "f-02", name: "Nutrient-Dense Canned Goods (4 cans)", category: "Canned Goods", unit: "packs" },
  { id: "f-03", name: "High-Protein Infant Cerelac & Milk", category: "Baby Food", unit: "boxes" },
  { id: "f-04", name: "Fresh Harvest Vegetable Basket", category: "Fresh Produce", unit: "baskets" },
  { id: "f-05", name: "Emergency Family Relief Pack (Complete)", category: "Relief Packs", unit: "packs" },
  { id: "f-06", name: "Elderly Nutritional Milk Formula", category: "Dairy / Supplements", unit: "tins" },
]

export default function DistributionPage() {
  const { profile } = useBarangay()
  const barangayName = profile?.barangay || "Abangay"
  const searchParams = useSearchParams()
  const preselectedBeneficiaryId = searchParams.get("beneficiaryId")

  const [activeTab, setActiveTab] = useState("form")
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [clothingInventory, setClothingInventory] = useState<ClothingItem[]>([])
  const [foodInventory, setFoodInventory] = useState<FoodInventoryItem[]>([])
  const [foodPacks, setFoodPacks] = useState<FoodPack[]>([])
  const [distributionHistory, setDistributionHistory] = useState<DistributionRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Form Fields
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("")
  const [distributionDate, setDistributionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [itemType, setItemType] = useState<"food" | "clothing" | "relief_pack">("food")
  const [foodItem, setFoodItem] = useState<string>("")
  const [clothingItem, setClothingItem] = useState<string>("")
  const [selectedPackName, setSelectedPackName] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [unit, setUnit] = useState<string>("packs")
  const [distributorName, setDistributorName] = useState<string>(
    profile ? `${profile.first_name} ${profile.last_name}` : "Barangay Official"
  )
  const [notes, setNotes] = useState<string>("")
  const [overrideAgeFilter, setOverrideAgeFilter] = useState<boolean>(false)

  // Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [barangayName])

  useEffect(() => {
    if (preselectedBeneficiaryId && beneficiaries.length > 0) {
      setSelectedBeneficiaryId(preselectedBeneficiaryId)
    }
  }, [preselectedBeneficiaryId, beneficiaries])

  const loadData = async () => {
    setLoading(true)
    try {
      const [bData, cData, fData, pData, dData] = await Promise.all([
        getBeneficiaries(barangayName),
        getClothingInventory(barangayName),
        getFoodInventory(barangayName),
        getFoodPacks(barangayName),
        getDistributions(barangayName),
      ])
      setBeneficiaries(bData)
      setClothingInventory(cData)
      setFoodInventory(fData)
      setFoodPacks(pData)
      setDistributionHistory(dData)

      if (cData.length > 0 && !clothingItem) {
        setClothingItem(cData[0].item_name)
      }
      if (fData.length > 0 && !foodItem) {
        setFoodItem(fData[0].item_name)
        setUnit(fData[0].unit)
      }
      if (pData.length > 0 && !selectedPackName) {
        setSelectedPackName(pData[0].pack_name)
      }
    } finally {
      setLoading(false)
    }
  }

  // Selected Beneficiary Data
  const selectedBeneficiary = beneficiaries.find((b) => b.id === selectedBeneficiaryId)
  const beneficiaryAge = selectedBeneficiary ? selectedBeneficiary.age : null
  const beneficiaryAgeGroup = beneficiaryAge !== null ? getAgeCategory(beneficiaryAge) : null

  // Filter Clothing items by Beneficiary Age
  const availableClothing = clothingInventory.filter((c) => {
    if (overrideAgeFilter || beneficiaryAge === null) return true
    return isClothingAgeAppropriate(beneficiaryAge, c).isAppropriate
  })

  // Selected Clothing, Food, and Pack Item Details
  const activeClothingObj = clothingInventory.find((c) => c.item_name === clothingItem)
  const activeFoodObj = foodInventory.find((f) => f.item_name === foodItem)
  const activePackObj = foodPacks.find((p) => p.pack_name === selectedPackName)

  const ageAppropriateness =
    beneficiaryAge !== null && activeClothingObj
      ? isClothingAgeAppropriate(beneficiaryAge, activeClothingObj)
      : { isAppropriate: true }

  const handleBeneficiaryChange = (bId: string) => {
    setSelectedBeneficiaryId(bId)
    const b = beneficiaries.find((item) => item.id === bId)
    if (b) {
      const bGroup = getAgeCategory(b.age)
      // Pick first matching clothing item
      const matchingClothing = clothingInventory.find(
        (c) => isClothingAgeAppropriate(b.age, c).isAppropriate
      )
      if (matchingClothing) {
        setClothingItem(matchingClothing.item_name)
        setUnit("piece")
      }
    }
  }

  const handleItemTypeChange = (type: "food" | "clothing" | "relief_pack") => {
    setItemType(type)
    if (type === "clothing") {
      setUnit("piece")
      if (availableClothing.length > 0) {
        setClothingItem(availableClothing[0].item_name)
      }
    } else if (type === "food") {
      if (foodInventory.length > 0) {
        setFoodItem(foodInventory[0].item_name)
        setUnit(foodInventory[0].unit)
      } else {
        setUnit("packs")
      }
    } else {
      if (foodPacks.length > 0) {
        setSelectedPackName(foodPacks[0].pack_name)
      }
      setUnit("packs")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedBeneficiary) {
      setErrorMessage("Please select a beneficiary.")
      return
    }

    if (quantity <= 0) {
      setErrorMessage("Quantity must be greater than 0.")
      return
    }

    if (itemType === "clothing" && !activeClothingObj) {
      setErrorMessage("Please select a clothing item.")
      return
    }

    if (itemType === "clothing" && activeClothingObj && activeClothingObj.quantity < quantity) {
      setErrorMessage(
        `Insufficient clothing stock: only ${activeClothingObj.quantity} remaining for "${activeClothingObj.item_name}".`
      )
      return
    }

    if (itemType === "food" && activeFoodObj && activeFoodObj.quantity < quantity) {
      setErrorMessage(
        `Insufficient food stock: only ${activeFoodObj.quantity} ${activeFoodObj.unit} available for "${activeFoodObj.item_name}".`
      )
      return
    }

    if (itemType === "relief_pack" && activePackObj && activePackObj.quantity_available < quantity) {
      setErrorMessage(
        `Insufficient packs: only ${activePackObj.quantity_available} available for "${activePackObj.pack_name}". Assemble more in the Food Pack Creator.`
      )
      return
    }

    setIsSubmitting(true)
    try {
      let finalItemName = ""
      let finalCategory = ""
      let clothingSize: string | undefined = undefined
      let clothingAgeGroup: string | undefined = undefined

      if (itemType === "clothing" && activeClothingObj) {
        finalItemName = activeClothingObj.item_name
        finalCategory = "Clothing / Wearable"
        clothingSize = activeClothingObj.size
        clothingAgeGroup = activeClothingObj.target_age_group
      } else if (itemType === "food") {
        finalItemName = activeFoodObj?.item_name || foodItem
        finalCategory = activeFoodObj?.category ? activeFoodObj.category.replace("_", " ") : "Food Aid"
      } else {
        finalItemName = activePackObj?.pack_name || "Emergency Family Relief Pack"
        finalCategory = "Relief Pack"
      }

      await recordDistribution({
        barangay_name: barangayName,
        beneficiary_id: selectedBeneficiary.id,
        beneficiary_name: selectedBeneficiary.full_name,
        beneficiary_age: selectedBeneficiary.age,
        distribution_date: distributionDate,
        item_type: itemType,
        item_name: finalItemName,
        category: finalCategory,
        clothing_size: clothingSize,
        clothing_age_group: clothingAgeGroup,
        quantity: Number(quantity),
        unit: unit,
        distributor_name: distributorName,
        notes: notes.trim() || undefined,
      })

      setSuccessMessage(
        `Distribution logged successfully! ${quantity} ${unit} of "${finalItemName}" issued to ${selectedBeneficiary.full_name}.`
      )

      // Refresh data
      await loadData()

      // Reset form fields
      setNotes("")
      setQuantity(1)

      setTimeout(() => setSuccessMessage(null), 6000)
    } catch (err: any) {
      setErrorMessage(`Failed to record distribution: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Aid Distribution Center
            </h1>
            <Badge variant="outline" className="text-xs bg-white text-gray-700">
              Brgy. {barangayName}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Dispatch food relief packs and age-matched clothing supplies directly to registered beneficiaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/barangay/inventory">
            <Button variant="outline" className="border-gray-300 flex items-center gap-2 text-xs">
              <Boxes className="h-4 w-4 text-amber-500" />
              Manage Food & Pack Inventory
            </Button>
          </Link>
          <Link href="/dashboard/barangay/beneficiaries">
            <Button variant="outline" className="border-gray-300 flex items-center gap-2 text-xs">
              <User className="h-4 w-4 text-gray-500" />
              Manage Beneficiaries
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4" />
            Distribution Form
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Distribution Logs ({distributionHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Distribution Form */}
        <TabsContent value="form" className="space-y-6">
          {successMessage && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="font-semibold">Distribution Recorded</AlertTitle>
              <AlertDescription className="text-sm">{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column (2 spans) */}
            <Card className="lg:col-span-2 shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-emerald-600" />
                  Record Aid Handover
                </CardTitle>
                <CardDescription>
                  Accurately log relief supplies given to residents for municipal reporting and stock audit.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section 1: Beneficiary Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary" className="text-sm font-semibold flex items-center gap-1.5">
                      <User className="h-4 w-4 text-gray-600" />
                      Select Beneficiary *
                    </Label>
                    <Select
                      value={selectedBeneficiaryId}
                      onValueChange={handleBeneficiaryChange}
                    >
                      <SelectTrigger id="beneficiary" className="bg-white">
                        <SelectValue placeholder="Choose a registered resident..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {beneficiaries.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <div className="flex items-center gap-2 py-0.5">
                              {b.is_urgent && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                                  URGENT
                                </span>
                              )}
                              <span className="font-medium">{b.full_name}</span>
                              <span className="text-gray-400 text-xs">
                                ({b.age}y • {b.address_purok})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Section 2: Distribution Date & Item Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        Distribution Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={distributionDate}
                        onChange={(e) => setDistributionDate(e.target.value)}
                        required
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-gray-600" />
                        Aid Category *
                      </Label>
                      <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleItemTypeChange("food")}
                          className={`flex items-center justify-center gap-1 text-xs py-2 rounded-md font-medium transition-all ${
                            itemType === "food"
                              ? "bg-white text-emerald-800 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Apple className="h-3.5 w-3.5" />
                          Food
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemTypeChange("clothing")}
                          className={`flex items-center justify-center gap-1 text-xs py-2 rounded-md font-medium transition-all ${
                            itemType === "clothing"
                              ? "bg-white text-indigo-800 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Shirt className="h-3.5 w-3.5" />
                          Clothing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemTypeChange("relief_pack")}
                          className={`flex items-center justify-center gap-1 text-xs py-2 rounded-md font-medium transition-all ${
                            itemType === "relief_pack"
                              ? "bg-white text-orange-800 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Package className="h-3.5 w-3.5" />
                          Pack
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Item Selection with Age-Dependent Logic for Clothing */}
                  {itemType === "clothing" ? (
                    <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shirt className="h-4 w-4 text-indigo-600" />
                          <Label htmlFor="clothing_item" className="text-sm font-semibold text-indigo-950">
                            Select Age-Appropriate Clothing Item *
                          </Label>
                        </div>
                        {selectedBeneficiary && (
                          <Badge className="bg-indigo-100 text-indigo-800 text-[11px] border border-indigo-200">
                            Age: {selectedBeneficiary.age} ({getAgeGroupLabel(getAgeCategory(selectedBeneficiary.age))})
                          </Badge>
                        )}
                      </div>

                      {/* Age Filtering Notice */}
                      {selectedBeneficiary && !overrideAgeFilter && (
                        <div className="text-xs text-indigo-700 flex items-center gap-1.5 bg-indigo-100/60 p-2 rounded-md">
                          <Info className="h-4 w-4 shrink-0 text-indigo-600" />
                          <span>
                            Automatically showing clothing stock matching <strong>{getAgeGroupLabel(getAgeCategory(selectedBeneficiary.age))}</strong>.
                          </span>
                        </div>
                      )}

                      <Select value={clothingItem} onValueChange={setClothingItem}>
                        <SelectTrigger id="clothing_item" className="bg-white">
                          <SelectValue placeholder="Choose clothing item..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {(overrideAgeFilter ? clothingInventory : availableClothing).map((item) => (
                            <SelectItem key={item.id} value={item.item_name}>
                              <div className="flex items-center justify-between gap-4 py-0.5">
                                <span className="font-medium text-gray-900">{item.item_name}</span>
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] bg-gray-50">
                                    Size: {item.size}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px]">
                                    {getAgeGroupLabel(item.target_age_group)}
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    Stock: {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Age Mismatch Warning Banner */}
                      {!ageAppropriateness.isAppropriate && ageAppropriateness.warning && (
                        <Alert className="bg-amber-50 border-amber-300 text-amber-900 py-3">
                          <ShieldAlert className="h-5 w-5 text-amber-600" />
                          <AlertTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
                            Clothing Age Mismatch Warning
                          </AlertTitle>
                          <AlertDescription className="text-xs text-amber-700 mt-1">
                            {ageAppropriateness.warning}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Toggle to see all sizes */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={overrideAgeFilter}
                            onChange={(e) => setOverrideAgeFilter(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600"
                          />
                          Show all sizes (bypass age-specific filter)
                        </label>

                        {activeClothingObj && (
                          <span className="text-xs text-gray-500">
                            Available in stock: <strong>{activeClothingObj.quantity} {activeClothingObj.quantity === 1 ? "piece" : "pieces"}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : itemType === "food" ? (
                    <div className="space-y-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="food_item" className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                          <Apple className="h-4 w-4 text-emerald-600" />
                          Select Food Relief Item *
                        </Label>
                        <Link
                          href="/dashboard/barangay/inventory"
                          className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          + Log new stock
                        </Link>
                      </div>

                      <Select
                        value={foodItem}
                        onValueChange={(val) => {
                          setFoodItem(val)
                          const item = foodInventory.find((f) => f.item_name === val)
                          if (item) setUnit(item.unit)
                        }}
                      >
                        <SelectTrigger id="food_item" className="bg-white">
                          <SelectValue placeholder="Choose food item from inventory..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {foodInventory.map((item) => {
                            const urgency = getFoodItemUrgency(item)
                            return (
                              <SelectItem key={item.id} value={item.item_name}>
                                <div className="flex items-center justify-between gap-4 py-0.5">
                                  <div className="flex flex-col text-left">
                                    <span className="font-medium text-gray-900">{item.item_name}</span>
                                    <span className="text-[10px] text-gray-500">
                                      {formatExpiryDisplay(item)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${urgency.badgeClass}`}
                                    >
                                      {urgency.label}
                                    </span>
                                    <span className="text-xs text-gray-500 font-semibold">
                                      Stock: {item.quantity} {item.unit}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      {/* FEFO Priority Prompt */}
                      {activeFoodObj && (() => {
                        const urgency = getFoodItemUrgency(activeFoodObj)
                        if (urgency.isExpiringSoon) {
                          return (
                            <Alert className="bg-rose-50 border-rose-200 text-rose-900 py-2.5">
                              <Flame className="h-4 w-4 text-rose-500 shrink-0" />
                              <AlertTitle className="text-xs font-bold text-rose-800">
                                FEFO Priority Item ({urgency.label})
                              </AlertTitle>
                              <AlertDescription className="text-xs text-rose-700 mt-0.5">
                                This food item is nearing expiration. Handing it out now ensures prompt consumption without waste.
                              </AlertDescription>
                            </Alert>
                          )
                        }
                        return null
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pack_item" className="text-sm font-semibold text-orange-950 flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-600" />
                          Select Assembled Food Pack *
                        </Label>
                        <Link
                          href="/dashboard/barangay/inventory"
                          className="text-xs text-orange-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          Assemble more packs
                        </Link>
                      </div>

                      <Select value={selectedPackName} onValueChange={setSelectedPackName}>
                        <SelectTrigger id="pack_item" className="bg-white">
                          <SelectValue placeholder="Choose a ready food pack..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {foodPacks.map((pack) => {
                            const urgency = getFoodItemUrgency({
                              expiry_type: "exact",
                              expiry_date: pack.earliest_expiry_date,
                            })
                            return (
                              <SelectItem key={pack.id} value={pack.pack_name}>
                                <div className="flex items-center justify-between gap-4 py-0.5">
                                  <span className="font-medium text-gray-900">{pack.pack_name}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${urgency.badgeClass}`}
                                    >
                                      Earliest: {urgency.label}
                                    </span>
                                    <span className="text-xs text-gray-500 font-semibold">
                                      Ready: {pack.quantity_available}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      {activePackObj && (
                        <div className="bg-white p-2.5 rounded-lg border border-orange-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-800">
                              Contents ({activePackObj.contents.length} items bundled):
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Earliest Expiry: {activePackObj.earliest_expiry_date}
                            </span>
                          </div>
                          <ul className="text-gray-600 text-[11px] list-disc list-inside">
                            {activePackObj.contents.map((c, i) => (
                              <li key={i}>
                                {c.quantity_per_pack} {c.unit} {c.item_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 4: Quantity & Units */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="quantity" className="text-sm font-semibold">
                        Quantity to Distribute *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={activeClothingObj && itemType === "clothing" ? activeClothingObj.quantity : 100}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                        required
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="unit" className="text-sm font-semibold">
                        Unit of Measure
                      </Label>
                      <Input
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="e.g. piece, pack, kg, box"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Section 5: Distributor Name & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="distributor" className="text-sm font-semibold">
                        Distributor / Official In-Charge *
                      </Label>
                      <Input
                        id="distributor"
                        value={distributorName}
                        onChange={(e) => setDistributorName(e.target.value)}
                        placeholder="Name of Kagawad or BHW"
                        required
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="notes" className="text-sm font-semibold">
                        Special Notes / Remarks
                      </Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Home delivered, special diet, verified by purok leader"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !selectedBeneficiary}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 shadow-sm flex items-center gap-2"
                    >
                      <HeartHandshake className="h-4 w-4" />
                      {isSubmitting ? "Recording Distribution..." : "Confirm & Record Distribution"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Beneficiary Quick Summary Card (Right column) */}
            <div className="space-y-4">
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Recipient Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedBeneficiary ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-base">
                            {selectedBeneficiary.full_name}
                          </span>
                          {selectedBeneficiary.is_urgent && (
                            <Badge className="bg-red-600 text-white text-[10px] flex items-center gap-1">
                              <Flame className="h-3 w-3 animate-pulse" />
                              URGENT
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Age:</span>
                            <span className="font-semibold text-gray-900">
                              {selectedBeneficiary.age} years old ({getAgeGroupLabel(getAgeCategory(selectedBeneficiary.age))})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Purok / Location:</span>
                            <span className="font-semibold text-gray-900">
                              {selectedBeneficiary.address_purok}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Household:</span>
                            <span>{selectedBeneficiary.household_size} members</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Category:</span>
                            <Badge variant="outline" className="text-[10px]">
                              {selectedBeneficiary.vulnerability_category}
                            </Badge>
                          </div>
                        </div>

                        {selectedBeneficiary.urgency_reason && (
                          <div className="mt-3 p-2 bg-red-50 rounded border border-red-200 text-xs text-red-800">
                            <strong>Urgency Flag:</strong> {selectedBeneficiary.urgency_reason}
                          </div>
                        )}
                      </div>

                      {/* Age-Appropriate Guidance Info */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1 text-blue-800">
                          <Info className="h-4 w-4" />
                          Age Match Guidelines:
                        </div>
                        <p className="text-blue-700">
                          Beneficiary is in the <strong>{getAgeGroupLabel(getAgeCategory(selectedBeneficiary.age))}</strong> bracket.
                          Ensure any distributed apparel matches this size category.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No beneficiary selected yet.</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Select a resident from the dropdown to preview their profile and eligibility.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Clothing Stock Status */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                    <span>Clothing Inventory by Age</span>
                    <Shirt className="h-4 w-4 text-indigo-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {clothingInventory.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1 border-b last:border-0">
                      <div className="truncate max-w-[170px]">
                        <span className="font-medium text-gray-800">{c.item_name}</span>
                        <div className="text-[10px] text-gray-400">{c.size}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {c.quantity} left
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Distribution History / Audit Log */}
        <TabsContent value="history">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-blue-600" />
                Distribution History & Audit Trail
              </CardTitle>
              <CardDescription>
                Full record of relief goods and clothing distributed in Barangay {barangayName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {distributionHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <HeartHandshake className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No distributions recorded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Use the form above to record your first aid handover.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Age / Group</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Item Distributed</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Distributor</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributionHistory.map((d) => (
                        <TableRow key={d.id} className="hover:bg-gray-50/80">
                          <TableCell className="font-medium whitespace-nowrap text-xs">
                            {d.distribution_date}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 text-xs">
                            {d.beneficiary_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="secondary" className="text-[10px]">
                              {d.beneficiary_age}y (
                              {getAgeGroupLabel(getAgeCategory(d.beneficiary_age))})
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                d.item_type === "clothing"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : d.item_type === "food"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-orange-100 text-orange-800"
                              }
                            >
                              {d.item_type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-medium">{d.item_name}</span>
                            {d.clothing_size && (
                              <span className="text-gray-400 ml-1 text-[11px]">
                                (Size: {d.clothing_size})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {d.quantity} {d.unit}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {d.distributor_name}
                          </TableCell>
                          <TableCell className="text-xs text-gray-400 italic">
                            {d.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
