"use client"

import { useState, useEffect } from "react"
import { useBarangay } from "../context"
import {
  getFoodInventory,
  addFoodInventoryItem,
  deleteFoodInventoryItem,
  getFoodPacks,
  createFoodPack,
  FoodInventoryItem,
  FoodPack,
  FoodCategory,
  ExpiryType,
  ExpiryUrgencyLevel,
  getFoodItemUrgency,
  formatExpiryDisplay,
  VulnerabilityCategory,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Apple,
  Package,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  HeartHandshake,
} from "lucide-react"
import Link from "next/link"

const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: "grains", label: "Grains & Rice" },
  { value: "canned_goods", label: "Canned Goods" },
  { value: "produce", label: "Fresh Produce" },
  { value: "dairy", label: "Dairy & Formula" },
  { value: "baby_food", label: "Baby & Infant Food" },
  { value: "beverages", label: "Water & Beverages" },
  { value: "snacks", label: "Snacks & Biscuits" },
  { value: "condiments", label: "Condiments & Staples" },
  { value: "other", label: "Other Food Aid" },
]

export default function BarangayInventoryPage() {
  const { profile } = useBarangay()
  const barangayName = profile?.barangay || "Abangay"

  const [activeTab, setActiveTab] = useState("inventory")
  const [foodItems, setFoodItems] = useState<FoodInventoryItem[]>([])
  const [foodPacks, setFoodPacks] = useState<FoodPack[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Add Item Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState<FoodCategory>("grains")
  const [quantity, setQuantity] = useState<number>(10)
  const [unit, setUnit] = useState<any>("packs")
  const [expiryType, setExpiryType] = useState<ExpiryType>("exact")
  const [expiryDate, setExpiryDate] = useState("")
  const [expiryDateFrom, setExpiryDateFrom] = useState("")
  const [expiryDateTo, setExpiryDateTo] = useState("")
  const [storageCondition, setStorageCondition] = useState<any>("dry_store")
  const [condition, setCondition] = useState<any>("good")
  const [notes, setNotes] = useState("")

  // Pack Assembler State
  const [packName, setPackName] = useState("Emergency Family Relief Pack")
  const [packDesc, setPackDesc] = useState("Essential staple food supplies for 3-5 days")
  const [packTarget, setPackTarget] = useState<VulnerabilityCategory | "general_relief">("low_income")
  const [packsToCreate, setPacksToCreate] = useState<number>(5)
  const [packItems, setPackItems] = useState<{ food_item_id: string; quantity_per_pack: number }[]>([])

  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [barangayName])

  const loadData = async () => {
    setLoading(true)
    try {
      const [inv, packs] = await Promise.all([
        getFoodInventory(barangayName),
        getFoodPacks(barangayName),
      ])
      setFoodItems(inv)
      setFoodPacks(packs)

      // Initialize default pack items if empty
      if (inv.length > 0 && packItems.length === 0) {
        setPackItems([
          { food_item_id: inv[0].id, quantity_per_pack: 2 },
          ...(inv.length > 1 ? [{ food_item_id: inv[1].id, quantity_per_pack: 1 }] : []),
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter food items
  const filteredFoodItems = foodItems.filter((item) => {
    const urgency = getFoodItemUrgency(item)
    if (urgencyFilter === "critical" && urgency.level !== "critical") return false
    if (urgencyFilter === "high" && urgency.level !== "high") return false
    if (urgencyFilter === "expiring_soon" && !urgency.isExpiringSoon) return false
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false
    if (searchQuery && !item.item_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Urgent items count (FEFO priority)
  const urgentItemsCount = foodItems.filter((i) => getFoodItemUrgency(i).isExpiringSoon).length

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) {
      setErrorMsg("Item name is required.")
      return
    }

    if (expiryType === "exact" && !expiryDate) {
      setErrorMsg("Please specify the exact expiration date.")
      return
    }

    if (expiryType === "range" && (!expiryDateFrom || !expiryDateTo)) {
      setErrorMsg("Please specify both start and end expiration dates for the range.")
      return
    }

    setActionLoading(true)
    setErrorMsg(null)
    try {
      await addFoodInventoryItem({
        barangay_name: barangayName,
        item_name: itemName.trim(),
        category,
        quantity: Number(quantity),
        unit,
        expiry_type: expiryType,
        expiry_date: expiryType === "exact" ? expiryDate : undefined,
        expiry_date_from: expiryType === "range" ? expiryDateFrom : undefined,
        expiry_date_to: expiryType === "range" ? expiryDateTo : undefined,
        storage_condition: storageCondition,
        condition,
        notes: notes.trim() || undefined,
      })

      setSuccessMsg(`Successfully logged "${itemName}" into food inventory.`)
      setIsAddOpen(false)
      // Reset
      setItemName("")
      setQuantity(10)
      setNotes("")
      setExpiryDate("")
      setExpiryDateFrom("")
      setExpiryDateTo("")
      await loadData()
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add food item")
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) return
    try {
      await deleteFoodInventoryItem(id)
      setSuccessMsg(`Removed "${name}" from inventory.`)
      await loadData()
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete item")
    }
  }

  // Handle Assemble Food Pack
  const handleAssemblePack = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (packItems.length === 0) {
      setErrorMsg("Please add at least one item to bundle in this pack.")
      return
    }

    if (packsToCreate <= 0) {
      setErrorMsg("Please specify a valid number of packs to assemble.")
      return
    }

    setActionLoading(true)
    try {
      const created = await createFoodPack({
        barangay_name: barangayName,
        pack_name: packName.trim(),
        description: packDesc.trim(),
        target_beneficiary_type: packTarget,
        contents: packItems,
        packs_to_create: Number(packsToCreate),
      })

      setSuccessMsg(
        `Successfully assembled ${packsToCreate} units of "${created.pack_name}"! Ingredients deducted from inventory.`
      )
      await loadData()
      setActiveTab("packs")
      setTimeout(() => setSuccessMsg(null), 6000)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to assemble food packs")
    } finally {
      setActionLoading(false)
    }
  }

  // Pack Assembler item helpers
  const addPackRow = () => {
    const unselected = foodItems.find((fi) => !packItems.some((pi) => pi.food_item_id === fi.id))
    if (unselected) {
      setPackItems([...packItems, { food_item_id: unselected.id, quantity_per_pack: 1 }])
    } else if (foodItems.length > 0) {
      setPackItems([...packItems, { food_item_id: foodItems[0].id, quantity_per_pack: 1 }])
    }
  }

  const updatePackRow = (index: number, field: "food_item_id" | "quantity_per_pack", value: any) => {
    const next = [...packItems]
    next[index] = { ...next[index], [field]: value }
    setPackItems(next)
  }

  const removePackRow = (index: number) => {
    setPackItems(packItems.filter((_, i) => i !== index))
  }

  // Calculate maximum packs buildable with current stock
  const calculateMaxPacksPossible = () => {
    if (packItems.length === 0) return 0
    let minBuildable = Infinity
    for (const pi of packItems) {
      const item = foodItems.find((f) => f.id === pi.food_item_id)
      if (!item || pi.quantity_per_pack <= 0) return 0
      const buildable = Math.floor(item.quantity / pi.quantity_per_pack)
      if (buildable < minBuildable) {
        minBuildable = buildable
      }
    }
    return minBuildable === Infinity ? 0 : minBuildable
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Food Inventory & Pack Assembler
            </h1>
            <Badge variant="outline" className="text-xs bg-white text-gray-700">
              Brgy. {barangayName}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Generalized Food Share management with expiration date ranges, FEFO urgency sorting, and custom food pack assembly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/barangay/distribution">
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-xs">
              <HeartHandshake className="h-4 w-4" />
              Aid Distribution Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertTitle className="font-semibold">Success</AlertTitle>
          <AlertDescription className="text-sm">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Action Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* FEFO Priority Warning Banner */}
      {urgentItemsCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900">
          <div className="flex items-start gap-3">
            <div className="bg-rose-500 text-white p-2 rounded-lg mt-0.5">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                FEFO Alert: {urgentItemsCount} Food {urgentItemsCount === 1 ? "Stock Item Needs" : "Stock Items Need"} Urgent Distribution!
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                First Expired, First Out (FEFO) protocol: Prioritize near-expiry items to prevent food spoilage and maximize relief efficiency.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setActiveTab("inventory")
              setUrgencyFilter("expiring_soon")
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs shrink-0"
          >
            View Urgent Foods
          </Button>
        </div>
      )}

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Food Items</p>
              <h3 className="text-xl font-bold text-gray-900">{foodItems.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Assembled Packs</p>
              <h3 className="text-xl font-bold text-gray-900">
                {foodPacks.reduce((acc, p) => acc + p.quantity_available, 0)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Expiry Batches</p>
              <h3 className="text-xl font-bold text-gray-900">
                {foodItems.filter((i) => i.expiry_type === "range").length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl">
              <Flame className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">FEFO Critical</p>
              <h3 className="text-xl font-bold text-rose-600">{urgentItemsCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-100 p-1 flex-wrap">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Food Inventory ({foodItems.length})
          </TabsTrigger>
          <TabsTrigger value="packs" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Food Packs ({foodPacks.length})
          </TabsTrigger>
          <TabsTrigger value="assemble" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Create Food Packs
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FOOD INVENTORY TABLE */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Apple className="h-5 w-5 text-emerald-600" />
                  Barangay Food Stockpile
                </CardTitle>
                <CardDescription>
                  Real-time inventory table with dynamic expiration range support and FEFO urgency indicators.
                </CardDescription>
              </div>

              {/* Add Food Dialog */}
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs">
                    <Plus className="h-4 w-4" />
                    Log Food Stock
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <form onSubmit={handleAddItem}>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-base">
                        <Boxes className="h-5 w-5 text-emerald-600" />
                        Log Incoming Food Aid / Donation
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Add donations or relief supplies with accurate expiration dates or date ranges.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-4 text-xs">
                      <div>
                        <Label htmlFor="item_name" className="text-xs font-semibold">
                          Food Item Name *
                        </Label>
                        <Input
                          id="item_name"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g., Canned Tuna in Oil, Fortified Rice"
                          required
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs font-semibold">Category *</Label>
                          <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {FOOD_CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold">Storage Type</Label>
                          <Select value={storageCondition} onValueChange={setStorageCondition}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dry_store">Dry Store (Grains/Cans)</SelectItem>
                              <SelectItem value="chilled">Chilled / Produce</SelectItem>
                              <SelectItem value="ambient">Ambient Room Temp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="qty" className="text-xs font-semibold">
                            Quantity *
                          </Label>
                          <Input
                            id="qty"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-semibold">Unit *</Label>
                          <Select value={unit} onValueChange={setUnit}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="packs">packs</SelectItem>
                              <SelectItem value="cans">cans</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="boxes">boxes</SelectItem>
                              <SelectItem value="sacks">sacks</SelectItem>
                              <SelectItem value="baskets">baskets</SelectItem>
                              <SelectItem value="tins">tins</SelectItem>
                              <SelectItem value="pieces">pieces</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Expiration Type Generalization */}
                      <div className="space-y-1.5 p-3 bg-gray-50 border rounded-lg">
                        <Label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                          <span>Expiration Date Format *</span>
                          <span className="text-[10px] text-gray-500 font-normal">
                            Supports mixed batches
                          </span>
                        </Label>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => setExpiryType("exact")}
                            className={`text-[11px] py-1.5 px-2 rounded border font-medium ${
                              expiryType === "exact"
                                ? "bg-white border-emerald-600 text-emerald-800 shadow-sm font-bold"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            Exact Date
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpiryType("range")}
                            className={`text-[11px] py-1.5 px-2 rounded border font-medium ${
                              expiryType === "range"
                                ? "bg-white border-emerald-600 text-emerald-800 shadow-sm font-bold"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            Date Range
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpiryType("non_perishable")}
                            className={`text-[11px] py-1.5 px-2 rounded border font-medium ${
                              expiryType === "non_perishable"
                                ? "bg-white border-emerald-600 text-emerald-800 shadow-sm font-bold"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            Non-Perishable
                          </button>
                        </div>

                        {expiryType === "exact" && (
                          <div className="pt-2">
                            <Label htmlFor="exact_date" className="text-[11px] text-gray-600">
                              Expiration Date
                            </Label>
                            <Input
                              id="exact_date"
                              type="date"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              className="mt-0.5 text-xs bg-white"
                              required
                            />
                          </div>
                        )}

                        {expiryType === "range" && (
                          <div className="pt-2 space-y-1.5">
                            <p className="text-[10px] text-gray-500">
                              For mixed donations with varying expiry dates (e.g. cans expiring across months):
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="range_from" className="text-[10px] text-gray-600">
                                  Earliest Date (From)
                                </Label>
                                <Input
                                  id="range_from"
                                  type="date"
                                  value={expiryDateFrom}
                                  onChange={(e) => setExpiryDateFrom(e.target.value)}
                                  className="mt-0.5 text-xs bg-white"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="range_to" className="text-[10px] text-gray-600">
                                  Latest Date (To)
                                </Label>
                                <Input
                                  id="range_to"
                                  type="date"
                                  value={expiryDateTo}
                                  onChange={(e) => setExpiryDateTo(e.target.value)}
                                  className="mt-0.5 text-xs bg-white"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {expiryType === "non_perishable" && (
                          <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded mt-2">
                            Items such as table salt, white sugar, and honey have extended shelf life and will be flagged as safe.
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-xs">
                          Notes / Donor Attribution
                        </Label>
                        <Textarea
                          id="notes"
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g., Donated by Janiuay Supermarket; batch A-2"
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {actionLoading ? "Saving..." : "Save to Inventory"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 text-xs">
                <div className="flex-1">
                  <Input
                    placeholder="Search by food name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="h-8 text-xs w-[160px]">
                      <SelectValue placeholder="Urgency Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgencies</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon (FEFO)</SelectItem>
                      <SelectItem value="critical">Critical (&le;7d / Expired)</SelectItem>
                      <SelectItem value="high">High Urgency (8-30d)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 text-xs w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {FOOD_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 text-gray-700 text-xs">
                      <TableHead>Food Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Expiration Date / Range</TableHead>
                      <TableHead>FEFO Urgency</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFoodItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-xs">
                          No food items match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFoodItems.map((item) => {
                        const urgency = getFoodItemUrgency(item)
                        return (
                          <TableRow key={item.id} className="text-xs hover:bg-gray-50">
                            <TableCell className="font-semibold text-gray-900">
                              <div className="flex flex-col">
                                <span>{item.item_name}</span>
                                {item.notes && (
                                  <span className="text-[10px] text-gray-400 font-normal truncate max-w-xs">
                                    {item.notes}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                                {item.category.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-gray-900">
                                {item.quantity} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span>{formatExpiryDisplay(item)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${urgency.badgeClass}`}
                              >
                                {urgency.level === "critical" && <Flame className="h-3 w-3 shrink-0" />}
                                {urgency.label}
                              </span>
                            </TableCell>
                            <TableCell className="capitalize text-gray-500">
                              {item.storage_condition?.replace("_", " ") || "dry store"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id, item.item_name)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ASSEMBLED FOOD PACKS */}
        <TabsContent value="packs" className="space-y-4">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Ready-for-Handover Food Packs
                </CardTitle>
                <CardDescription>
                  Bundled relief kits ready to be issued to registered beneficiaries during aid distributions.
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => setActiveTab("assemble")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" />
                Assemble New Pack
              </Button>
            </CardHeader>

            <CardContent>
              {foodPacks.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-500 text-xs">
                  <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-700">No Food Packs Created Yet</p>
                  <p className="mt-1">Use the "Create Food Packs" tool to bundle items from your current food inventory.</p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("assemble")}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Assemble First Pack
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foodPacks.map((pack) => {
                    const urgency = getFoodItemUrgency({
                      expiry_type: "exact",
                      expiry_date: pack.earliest_expiry_date,
                    })

                    return (
                      <Card key={pack.id} className="border-gray-200 shadow-xs hover:border-emerald-300 transition-all">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-sm font-bold text-gray-900">
                                {pack.pack_name}
                              </CardTitle>
                              {pack.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{pack.description}</p>
                              )}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${urgency.badgeClass}`}
                            >
                              {urgency.level === "critical" && <Flame className="h-3 w-3 shrink-0" />}
                              Earliest: {urgency.label}
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 pt-2 space-y-3 text-xs">
                          {/* Stock and target info */}
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                            <div>
                              <span className="text-gray-500 block text-[10px]">Available in Stock</span>
                              <span className="text-base font-extrabold text-emerald-700">
                                {pack.quantity_available} packs
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-500 block text-[10px]">Target Sector</span>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                {pack.target_beneficiary_type?.replace("_", " ") || "general"}
                              </Badge>
                            </div>
                          </div>

                          {/* Contents list */}
                          <div>
                            <span className="font-semibold text-gray-700 block mb-1 text-[11px]">
                              Bundle Contents ({pack.contents.length} items):
                            </span>
                            <ul className="space-y-1 bg-white border rounded p-2 text-gray-600">
                              {pack.contents.map((c, i) => (
                                <li key={i} className="flex items-center justify-between text-[11px]">
                                  <span>
                                    • {c.quantity_per_pack} {c.unit} {c.item_name}
                                  </span>
                                  <span className="text-gray-400 text-[10px]">
                                    (Exp: {c.effective_expiry_date})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Quick distribution link */}
                          <div className="pt-1 flex justify-end">
                            <Link href="/dashboard/barangay/distribution">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs flex items-center gap-1"
                              >
                                Distribute This Pack
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CREATE FOOD PACKS ASSEMBLER */}
        <TabsContent value="assemble" className="space-y-4">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Relief Food Pack Assembler
              </CardTitle>
              <CardDescription>
                Bundle multiple food items from your inventory into structured relief packs. Stock will be automatically deducted upon assembly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAssemblePack} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="p_name" className="text-xs font-semibold">
                      Pack Name *
                    </Label>
                    <Input
                      id="p_name"
                      value={packName}
                      onChange={(e) => setPackName(e.target.value)}
                      placeholder="e.g., Emergency Family Relief Pack"
                      required
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Target Beneficiary Demographic</Label>
                    <Select value={packTarget} onValueChange={(v: any) => setPackTarget(v)}>
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low_income">Low Income Families</SelectItem>
                        <SelectItem value="senior">Senior Citizens</SelectItem>
                        <SelectItem value="infant_care">Infant & Maternal Care</SelectItem>
                        <SelectItem value="malnourished_child">Malnourished Children</SelectItem>
                        <SelectItem value="pwd">Persons with Disability (PWD)</SelectItem>
                        <SelectItem value="general_relief">General Calamity Relief</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="p_desc" className="text-xs font-semibold">
                    Description / Ration Scope
                  </Label>
                  <Input
                    id="p_desc"
                    value={packDesc}
                    onChange={(e) => setPackDesc(e.target.value)}
                    placeholder="e.g., 3-day basic subsistence pack containing rice and protein"
                    className="mt-1 text-xs"
                  />
                </div>

                {/* Bundle Items Builder */}
                <div className="space-y-2 border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Pack Ingredients & Rations</h4>
                      <p className="text-[11px] text-gray-500">
                        Choose which food items from active inventory are bundled in each individual pack.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPackRow}
                      className="text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Ingredient
                    </Button>
                  </div>

                  {packItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      No ingredients selected. Click "+ Add Ingredient" above.
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      {packItems.map((pi, index) => {
                        const matchedItem = foodItems.find((f) => f.id === pi.food_item_id)
                        const urgency = matchedItem ? getFoodItemUrgency(matchedItem) : null

                        return (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white p-2.5 rounded-lg border text-xs"
                          >
                            <div className="flex-1 w-full sm:w-auto">
                              <Select
                                value={pi.food_item_id}
                                onValueChange={(val) => updatePackRow(index, "food_item_id", val)}
                              >
                                <SelectTrigger className="h-8 text-xs bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {foodItems.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                      {f.item_name} ({f.quantity} {f.unit} left)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <div className="flex items-center gap-1">
                                <Label className="text-[10px] text-gray-500 whitespace-nowrap">Qty/Pack:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={pi.quantity_per_pack}
                                  onChange={(e) =>
                                    updatePackRow(index, "quantity_per_pack", Math.max(1, Number(e.target.value)))
                                  }
                                  className="w-16 h-8 text-xs text-center"
                                />
                                <span className="text-[11px] text-gray-500 w-10">
                                  {matchedItem?.unit || "units"}
                                </span>
                              </div>

                              {urgency && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${urgency.badgeClass}`}
                                >
                                  {urgency.level}
                                </span>
                              )}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePackRow(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Calculation & Assembly Actions */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950">Assembly Feasibility</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Based on current inventory, you can assemble up to{" "}
                      <span className="font-black text-sm text-emerald-900 underline">
                        {calculateMaxPacksPossible()} packs
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="num_packs" className="text-xs font-semibold whitespace-nowrap">
                        Assemble:
                      </Label>
                      <Input
                        id="num_packs"
                        type="number"
                        min="1"
                        max={calculateMaxPacksPossible() || 1}
                        value={packsToCreate}
                        onChange={(e) => setPacksToCreate(Math.max(1, Number(e.target.value)))}
                        className="w-20 h-9 text-xs text-center bg-white font-bold"
                      />
                      <span className="text-xs font-bold text-gray-700">packs</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={actionLoading || calculateMaxPacksPossible() === 0}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Package className="h-4 w-4" />
                      {actionLoading ? "Packaging..." : "Assemble & Deduct Stock"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
