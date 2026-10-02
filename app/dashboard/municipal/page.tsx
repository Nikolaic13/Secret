"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import {
  Heart,
  LogOut,
  Package,
  Warehouse,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  RefreshCw,
  Send,
  Target,
  Utensils,
  MapPin,
  Phone,
  Calendar,
  CheckSquare,
  Square,
  X,
  History,
  RotateCcw,
  Navigation,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LocationViewerMap } from "@/components/maps/location-picker-map"
import { TransactionLogTimeline } from "@/components/transactions/transaction-timeline"
import {
  logDonationTransaction,
  getTransactionLogs,
  TransactionLogEntry,
} from "@/lib/transaction-service"

interface FoodItem {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  expiry_date: string
  status: string
  storage_status: string
  storage_location: string
  storage_notes: string
  stored_at: string
  assigned_barangay: string
  claimed_at: string
  delivery_method: string
  pickup_address: string
  pickup_contact: string
  pickup_latitude?: number
  pickup_longitude?: number
  is_manual_override?: boolean
  override_reason?: string
  created_at: string
  donor_id: string
  rejection_reason?: string // Added for rejection
  rejected_at?: string // Added for rejection
  rejected_by?: string // Added for rejection
  profiles?: {
    id: string
    first_name: string
    last_name: string
    phone: string
    address: string
  }
}

interface BarangayData {
  name: string
  population: number
  urgency_score: number
  distance_km: number
  children_population: number
  elderly_population: number
  pregnant_women: number
  families_with_infants: number
  malnourished_children: number
  pwd_population: number
  senior_citizens: number
  solo_parents: number
  indigenous_families: number
  food_security_level: number
}

interface FoodRequest {
  id: string
  barangay_name: string
  food_category: string
  quantity_needed: number
  unit: string
  reason: string
  special_requirements: string
  status: string
  created_at: string
}

interface CategoryGroup {
  category: string
  items: FoodItem[]
  totalQuantity: number
  requestingBarangays: FoodRequest[]
}

// Define a more specific profile interface
interface MunicipalProfile {
  role: string
  approval_status: string
  first_name: string
  last_name: string
}

export default function MunicipalDashboard() {
  const [user, setUser] = useState<any>(null) // Keeping any for user for now, but could be more specific
  const [profile, setProfile] = useState<MunicipalProfile | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [barangayData, setBarangayData] = useState<BarangayData[]>([])
  const [foodRequests, setFoodRequests] = useState<FoodRequest[]>([])
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([])
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [storageLocation, setStorageLocation] = useState("")
  const [storageNotes, setStorageNotes] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryGroup | null>(null)
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [showStoreDialog, setShowStoreDialog] = useState(false)
  const [showDistributeDialog, setShowDistributeDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const [rejectionReason, setRejectionReason] = useState("")
  const [activeTab, setActiveTab] = useState("donations")

  // New Features States: Manual Override, Map View & Audit Trail
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideItem, setOverrideItem] = useState<FoodItem | null>(null)
  const [overrideBarangay, setOverrideBarangay] = useState("")
  const [overrideReason, setOverrideReason] = useState("")
  const [viewingMapItem, setViewingMapItem] = useState<FoodItem | null>(null)
  const [transactionLogs, setTransactionLogs] = useState<TransactionLogEntry[]>([])
  const [selectedItemForLogs, setSelectedItemForLogs] = useState<FoodItem | null>(null)
  const [showItemLogsDialog, setShowItemLogsDialog] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const storageLocations = [
    "Municipal Cold Storage Unit A",
    "Municipal Cold Storage Unit B",
    "Municipal Dry Storage Warehouse",
    "Municipal Emergency Food Bank",
    "Municipal Distribution Center",
    "Temporary Storage - Municipal Hall",
    "Refrigerated Storage - Health Center",
  ]

  // Official list of all 57 Janiuay barangays (44 rural + 13 poblacion)
  const JANIUAY_BARANGAYS = [
    // Rural Barangays (44)
    "Abangay",
    "Agcarope",
    "Aglobong",
    "Aguingay",
    "Anhawan",
    "Atimonan",
    "Balanac",
    "Barasalon",
    "Bongol",
    "Cabantog",
    "Calmay",
    "Canawili",
    "Canawillian",
    "Caranas",
    "Caraudan",
    "Carigangan",
    "Cunsad",
    "Dabong",
    "Damires",
    "Damo-ong",
    "Danao",
    "Gines",
    "Guadalupe",
    "Jibolo",
    "Kuyot",
    "Madong",
    "Manacabac",
    "Mangil",
    "Matag-ub",
    "Monte-Magapa",
    "Pangilihan",
    "Panuran",
    "Pararinga",
    "Patong-patong",
    "Quipot",
    "Santo Tomas",
    "Sarawag",
    "Tambal",
    "Tamu-an",
    "Tiringanan",
    "Tolarucan",
    "Tuburan",
    "Ubian",
    "Yabon",
    // Poblacion Barangays (13)
    "Aquino Nobleza East (Poblacion)",
    "Aquino Nobleza West (Poblacion)",
    "R. Armada (Poblacion)",
    "Concepcion Poblacion (D.G. Abordo)",
    "Golgota (Poblacion)",
    "Locsin (Poblacion)",
    "Don T. Lutero Center (Poblacion)",
    "Don T. Lutero East (Poblacion)",
    "Don T. Lutero West (Poblacion)",
    "Crispin Salazar North (Poblacion)",
    "Crispin Salazar South (Poblacion)",
    "San Julian (Poblacion)",
    "San Pedro (Poblacion)",
    "Santa Rita (Poblacion)",
    "Capt. A. Tirador (Poblacion)",
    "S. M. Villa (Poblacion)",
  ]

  // Default demographic data for barangays (used when database data is not available)
  const getDefaultBarangayData = (name: string): BarangayData => {
    const isPoblacion = name.includes("(Poblacion)")

    return {
      name,
      population: isPoblacion ? 2200 : 1200, // Poblacion barangays are generally more populated
      urgency_score: isPoblacion ? 4 : 6, // Poblacion areas typically have lower urgency
      distance_km: isPoblacion ? 1.5 : 15, // Poblacion areas are closer to center
      children_population: isPoblacion ? 440 : 240,
      elderly_population: isPoblacion ? 220 : 120,
      pregnant_women: isPoblacion ? 44 : 24,
      families_with_infants: isPoblacion ? 80 : 45,
      malnourished_children: isPoblacion ? 66 : 36,
      pwd_population: isPoblacion ? 88 : 48,
      senior_citizens: isPoblacion ? 176 : 96,
      solo_parents: isPoblacion ? 132 : 72,
      indigenous_families: isPoblacion ? 22 : 12,
      food_security_level: isPoblacion ? 7 : 5, // Poblacion areas typically have better food security
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && profile) {
      fetchAllData()
    }
  }, [user, profile])

  useEffect(() => {
    if (foodItems.length > 0) {
      generateCategoryGroups()
    }
  }, [foodItems, foodRequests])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("❌ No user found, redirecting to login")
        router.push("/auth/officials/login")
        return
      }

      console.log("✅ User authenticated:", user.email)

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, approval_status, first_name, last_name")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("❌ Error fetching user profile:", profileError)
        setFetchError("Failed to fetch user profile")
        return
      }

      if (!profileData) {
        setFetchError("User profile not found.")
        return
      }

      const typedProfile: MunicipalProfile = profileData as MunicipalProfile // Type assertion

      if (typedProfile.role !== "municipal") {
        console.log("❌ User is not municipal representative")
        router.push("/dashboard")
        return
      }

      if (typedProfile.approval_status !== "approved") {
        setFetchError("Your account is pending approval. Please wait for admin approval.")
        return
      }

      setUser(user)
      setProfile(typedProfile)
      console.log("✅ Municipal representative authenticated successfully")
    } catch (error) {
      console.error("💥 Error in checkUser:", error)
      setFetchError("Authentication error")
    }
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    setFetchError(null)

    try {
      console.log("🔄 Starting to fetch all data...")
      await Promise.all([fetchFoodItems(), fetchBarangayData(), fetchFoodRequests(), fetchLogs()])
      console.log("✅ All data fetched successfully")
    } catch (error) {
      console.error("💥 Error fetching data:", error)
      setFetchError("Failed to load dashboard data")
    } finally {
      setDataLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const logs = await getTransactionLogs()
      setTransactionLogs(logs)
    } catch (err) {
      console.error("Error fetching transaction logs:", err)
    }
  }

  const fetchFoodItems = async () => {
    try {
      console.log("🍽️ Fetching food items...")

      const { data: foodItemsData, error: foodItemsError } = await supabase
        .from("food_items")
        .select("*")
        .order("created_at", { ascending: false })

      if (foodItemsError) {
        console.error("❌ Error fetching food items:", foodItemsError)
        throw foodItemsError
      }

      console.log("[v0] Food items fetched:", foodItemsData?.length || 0)

      // Get unique donor IDs
      const donorIds = [...new Set(foodItemsData?.map((item) => item.donor_id).filter(Boolean))]
      console.log("[v0] Unique donor IDs:", donorIds.length)

      // Fetch donor profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, address")
        .in("id", donorIds)

      if (profilesError) {
        console.error("❌ Error fetching profiles:", profilesError)
      }

      console.log("[v0] Profiles fetched:", profilesData?.length || 0)

      // Merge profiles with food items
      const itemsWithProfiles = foodItemsData?.map((item) => {
        const profile = profilesData?.find((p) => p.id === item.donor_id)
        return {
          ...item,
          profiles: profile || {
            first_name: "Unknown",
            last_name: "Donor",
            phone: "",
            address: "",
          },
        }
      })

      console.log("[v0] Final merged items:", itemsWithProfiles?.length || 0)
      console.log("[v0] Sample merged item:", itemsWithProfiles?.[0])

      setFoodItems(itemsWithProfiles || [])
    } catch (error) {
      console.error("Error fetching food items:", error)
      setFoodItems([])
    }
  }

  const fetchBarangayData = async () => {
    try {
      console.log("🏘️ Fetching barangay data...")

      const { data, error } = await supabase.from("barangay_data").select("*").order("name")

      if (error) {
        console.error("❌ Error fetching barangay data:", error)
        // Don't throw error, just use default data
        setBarangayData([])
        return
      }

      // Filter to only include official Janiuay barangays
      const filteredData = (data || []).filter((barangay) => JANIUAY_BARANGAYS.includes(barangay.name))

      setBarangayData(filteredData)
      console.log(`✅ Fetched ${filteredData.length} official Janiuay barangays from database`)
    } catch (error) {
      console.error("💥 Exception fetching barangay data:", error)
      setBarangayData([])
    }
  }

  const fetchFoodRequests = async () => {
    try {
      console.log("📋 Fetching food requests...")

      const { data, error } = await supabase
        .from("food_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data && data.length > 0) {
        setFoodRequests(data)
        console.log(`✅ Fetched ${data.length} food requests from database`)
        return
      }

      // Check localStorage fallback
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("foodshare_food_requests")
        if (stored) {
          const parsed = JSON.parse(stored)
          setFoodRequests(parsed)
          console.log(`✅ Fetched ${parsed.length} food requests from local storage`)
          return
        }
      }

      setFoodRequests([])
    } catch (error) {
      console.error("💥 Exception fetching food requests:", error)
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("foodshare_food_requests")
        if (stored) {
          setFoodRequests(JSON.parse(stored))
          return
        }
      }
      setFoodRequests([])
    }
  }

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    setLoading(true)
    try {
      // 1. Try Supabase
      try {
        await supabase.from("food_requests").update({ status: newStatus }).eq("id", requestId)
      } catch (err) {
        console.warn("Could not update status via Supabase, using localStorage", err)
      }

      // 2. Update localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("foodshare_food_requests")
        if (stored) {
          const parsed = JSON.parse(stored)
          const updated = parsed.map((r: any) => (r.id === requestId ? { ...r, status: newStatus } : r))
          localStorage.setItem("foodshare_food_requests", JSON.stringify(updated))
        }
      }

      // 3. Update React state
      setFoodRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      )

      setActionMessage(`Food request marked as ${newStatus.toUpperCase()}`)
      setTimeout(() => setActionMessage(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  const generateCategoryGroups = () => {
    console.log("🔄 Generating category groups...")

    // Get only stored items
    const storedItems = foodItems.filter((item) => item.storage_status === "in_storage")

    // Group by category
    const categoryMap = new Map<string, FoodItem[]>()

    storedItems.forEach((item) => {
      const category = item.category
      if (!categoryMap.has(category)) {
        categoryMap.set(category, [])
      }
      categoryMap.get(category)!.push(item)
    })

    // Create category groups with requests
    const groups: CategoryGroup[] = Array.from(categoryMap.entries()).map(([category, items]) => {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
      const requestingBarangays = foodRequests.filter(
        (req) => req.food_category.toLowerCase() === category.toLowerCase(),
      )

      return {
        category,
        items,
        totalQuantity,
        requestingBarangays,
      }
    })

    setCategoryGroups(groups)
    console.log(`✅ Generated ${groups.length} category groups`)
  }

  const calculateMCDAScore = (barangay: BarangayData, request: FoodRequest): number => {
    let score = 0
    const weights = {
      demographics: 0.4, // Demographic vulnerability (most important)
      urgency: 0.25, // General barangay urgency
      foodSecurity: 0.25, // Food security level
      distance: 0.1, // Distance factor
    }

    // 1. Demographics matching (category-specific vulnerability) - most important
    let demographicScore = 0
    const totalPop = barangay.population || 1

    switch (request.food_category.toLowerCase()) {
      case "dairy":
        // Children, elderly, and pregnant women need dairy
        demographicScore =
          (barangay.children_population + barangay.elderly_population + barangay.pregnant_women * 2) / totalPop
        break
      case "meat":
      case "seafood":
        // Malnourished children and elderly need protein
        demographicScore =
          (barangay.malnourished_children * 3 + barangay.elderly_population + barangay.pregnant_women) / totalPop
        break
      case "vegetables":
      case "fruits":
        // General nutrition for vulnerable groups
        demographicScore =
          (barangay.malnourished_children + barangay.children_population + barangay.elderly_population) / totalPop
        break
      case "grains":
      case "canned":
      case "bakery":
        // Basic sustenance for economically vulnerable
        demographicScore =
          (barangay.solo_parents + barangay.indigenous_families + barangay.pwd_population * 1.5) / totalPop
        break
      default:
        // General vulnerability score
        demographicScore =
          (barangay.children_population + barangay.elderly_population + barangay.solo_parents) / totalPop
    }

    // Cap demographic score and apply weight
    score += Math.min(demographicScore * 2, 1) * weights.demographics

    // 2. General barangay urgency score
    score += (barangay.urgency_score / 10) * weights.urgency

    // 3. Food security level (lower level = higher need)
    const foodSecurityScore = (10 - barangay.food_security_level) / 10
    score += foodSecurityScore * weights.foodSecurity

    // 4. Distance factor (closer is better, assuming max 50km)
    const maxDistance = 50
    const distanceScore = Math.max(0, (maxDistance - barangay.distance_km) / maxDistance)
    score += distanceScore * weights.distance

    // Convert to percentage and round
    return Math.round(score * 100)
  }

  const getMCDARecommendations = (
    category: string,
    requestingBarangays: FoodRequest[],
  ): { barangay: BarangayData; request: FoodRequest; score: number }[] => {
    console.log(`🎯 Calculating MCDA recommendations for ${category} (${requestingBarangays.length} requests)...`)

    // Only consider barangays that have made specific requests for this category
    const recommendations = requestingBarangays
      .map((request) => {
        // Find barangay data from database or use default
        let barangay = barangayData.find((b) => b.name === request.barangay_name)
        if (!barangay) {
          // Use default data if not found in database
          barangay = getDefaultBarangayData(request.barangay_name)
          console.log(`⚠️ Using default data for ${request.barangay_name}`)
        }

        const score = calculateMCDAScore(barangay, request)

        return {
          barangay,
          request,
          score,
        }
      })
      .filter((item): item is { barangay: BarangayData; request: FoodRequest; score: number } => item !== null)

    // Sort by score (highest first)
    const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score)

    console.log(`📊 MCDA Scores for ${category}:`)
    sortedRecommendations.forEach((rec) => {
      console.log(`  ${rec.barangay.name}: ${rec.score}% (Qty: ${rec.request.quantity_needed} ${rec.request.unit})`)
    })

    return sortedRecommendations
  }

  const handleClaimFood = async (foodId: string) => {
    setLoading(true)
    setActionMessage(null)

    try {
      console.log(`🤝 Claiming food item ${foodId}...`)
      const targetItem = foodItems.find((f) => f.id === foodId)

      const { error } = await supabase
        .from("food_items")
        .update({
          status: "waiting_pickup",
          storage_status: "claimed",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", foodId)

      if (error) throw error

      await logDonationTransaction({
        food_item_id: foodId,
        item_title: targetItem?.title || "Food Item",
        actor_id: user?.id,
        actor_name: `${profile?.first_name} ${profile?.last_name}`,
        actor_role: "mswd_representative",
        action_type: "claimed",
        old_status: "available",
        new_status: "waiting_pickup",
        quantity: targetItem?.quantity,
        unit: targetItem?.unit,
        notes: `Food item verified and claimed by MSWD for pickup / dropoff processing`,
      })

      setActionMessage("Food item claimed successfully!")
      await fetchFoodItems()
      await fetchLogs()
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      console.error("💥 Error claiming food:", error)
      setActionMessage(`Failed to claim food: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreFood = async () => {
    if (!selectedItem || !storageLocation) return

    setLoading(true)
    setActionMessage(null)

    try {
      console.log(`🏪 Storing food item ${selectedItem.id}...`)

      const { error } = await supabase
        .from("food_items")
        .update({
          status: "ready_distribution",
          storage_status: "in_storage",
          storage_location: storageLocation,
          storage_notes: storageNotes,
          stored_at: new Date().toISOString(),
        })
        .eq("id", selectedItem.id)

      if (error) throw error

      await logDonationTransaction({
        food_item_id: selectedItem.id,
        item_title: selectedItem.title,
        actor_id: user?.id,
        actor_name: `${profile?.first_name} ${profile?.last_name}`,
        actor_role: "mswd_representative",
        action_type: "stored",
        old_status: selectedItem.status,
        new_status: "ready_distribution",
        quantity: selectedItem.quantity,
        unit: selectedItem.unit,
        notes: `Stored at ${storageLocation}. Notes: ${storageNotes || "None"}`,
      })

      setActionMessage("Food item stored successfully!")
      setShowStoreDialog(false)
      setSelectedItem(null)
      setStorageLocation("")
      setStorageNotes("")
      await fetchFoodItems()
      await fetchLogs()
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      console.error("💥 Error storing food:", error)
      setActionMessage(`Failed to store food: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectFood = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      setActionMessage("Please provide a rejection reason")
      return
    }

    setLoading(true)
    setActionMessage(null)

    try {
      console.log(`❌ Rejecting food item ${selectedItem.id}...`)

      // Update food item with rejection
      const { error: updateError } = await supabase
        .from("food_items")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
          rejected_by: user.id,
        })
        .eq("id", selectedItem.id)

      if (updateError) throw updateError

      // Create notification for donor
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: selectedItem.donor_id,
        type: "rejection",
        title: "Food Donation Rejected",
        message: `Your donation "${selectedItem.title}" has been rejected. Reason: ${rejectionReason}`,
        related_item_id: selectedItem.id,
        related_item_type: "food_item",
        is_read: false,
      })

      if (notificationError) {
        console.error("❌ Error creating notification:", notificationError)
        // Don't throw - rejection still succeeded
      }

      setActionMessage("Food item rejected and donor notified")
      setShowRejectDialog(false)
      setSelectedItem(null)
      setRejectionReason("")
      await fetchFoodItems()
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      console.error("💥 Error rejecting food:", error)
      setActionMessage(`Failed to reject food: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDistributeCategory = async () => {
    if (!selectedCategory || selectedBarangays.length === 0) return

    setLoading(true)
    setActionMessage(null)

    try {
      console.log(`🚚 Distributing ${selectedCategory.category} using MCDA algorithm...`)

      // Get all barangays with their data (database or default)
      const allBarangaysWithData = JANIUAY_BARANGAYS.map((name) => {
        const dbBarangay = barangayData.find((b) => b.name === name)
        return dbBarangay || getDefaultBarangayData(name)
      })

      // Filter to only selected barangays
      const selectedBarangaysWithData = allBarangaysWithData.filter((barangay) =>
        selectedBarangays.includes(barangay.name),
      )

      // Create recommendations for selected barangays
      const recommendations = selectedBarangaysWithData
        .map((barangay) => {
          const mockRequest = {
            id: `mock-${barangay.name}`,
            barangay_name: barangay.name,
            food_category: selectedCategory.category,
            quantity_needed: 10,
            unit: "kg",
            reason: "MCDA distribution",
            special_requirements: "",
            status: "pending",
            created_at: new Date().toISOString(),
          }
          const score = calculateMCDAScore(barangay, mockRequest)
          return {
            barangay,
            request: mockRequest,
            score,
          }
        })
        .sort((a, b) => b.score - a.score)

      console.log(`📊 Selected MCDA Scores for ${selectedCategory.category}:`)
      recommendations.forEach((rec) => {
        console.log(`  ${rec.barangay.name}: ${rec.score}% (Population: ${rec.barangay.population})`)
      })

      // Distribute items based on MCDA scores
      const totalScore = recommendations.reduce((sum, rec) => sum + rec.score, 0)
      let itemIndex = 0
      const distributionPromises = []

      for (const recommendation of recommendations) {
        const barangayName = recommendation.barangay.name
        const scoreRatio = recommendation.score / totalScore

        // Calculate items for this barangay based on MCDA score
        let itemsToDistribute = Math.max(1, Math.floor(selectedCategory.items.length * scoreRatio))

        // Ensure we don't exceed available items
        if (itemIndex + itemsToDistribute > selectedCategory.items.length) {
          itemsToDistribute = selectedCategory.items.length - itemIndex
        }

        console.log(
          `📦 Allocating ${itemsToDistribute} items to ${barangayName} (MCDA Score: ${recommendation.score}%)`,
        )

        for (let j = 0; j < itemsToDistribute && itemIndex < selectedCategory.items.length; j++) {
          const item = selectedCategory.items[itemIndex]

          // Update food item status
          distributionPromises.push(
            supabase
              .from("food_items")
              .update({
                status: "claimed",
                storage_status: "allocated",
                assigned_barangay: barangayName,
                claimed_at: new Date().toISOString(),
              })
              .eq("id", item.id),
          )

          // Create detailed distribution log with MCDA data
          distributionPromises.push(
            supabase.from("distribution_logs").insert({
              food_item_id: item.id,
              barangay_name: barangayName,
              quantity_distributed: item.quantity,
              distribution_method: "mcda_demographic_based",
              mcda_score: recommendation.score,
              requested_quantity: 0,
              category: selectedCategory.category,
              distributed_by: user.id,
              notes: `MCDA Demographic-Based Distribution: ${selectedCategory.category} (Score: ${recommendation.score}%, Pop: ${recommendation.barangay.population})`,
              created_at: new Date().toISOString(),
            }),
          )

          // Create notification for barangay with MCDA details
          distributionPromises.push(
            supabase.from("notifications").insert({
              recipient_barangay: barangayName,
              food_item_id: item.id,
              message: `${selectedCategory.category} allocated based on demographic needs (MCDA Score: ${recommendation.score}%)`,
              type: "mcda_demographic_allocation",
              priority_score: recommendation.score,
              created_at: new Date().toISOString(),
            }),
          )

          itemIndex++
        }

        // Update matching food requests to fulfilled (if any exist)
        const matchingRequest = selectedCategory.requestingBarangays.find((req) => req.barangay_name === barangayName)
        if (matchingRequest) {
          distributionPromises.push(
            supabase
              .from("food_requests")
              .update({
                status: "fulfilled",
                fulfilled_at: new Date().toISOString(),
                mcda_score: recommendation.score,
                items_allocated: itemsToDistribute,
              })
              .eq("id", matchingRequest.id),
          )
        }
      }

      await Promise.all(distributionPromises)

      // Create summary message with MCDA details
      const topBarangays = recommendations
        .slice(0, 3)
        .map((rec) => `${rec.barangay.name} (${rec.score}%)`)
        .join(", ")

      setActionMessage(
        `Successfully distributed ${selectedCategory.items.length} ${selectedCategory.category} items to ${selectedBarangays.length} barangays using MCDA algorithm. Top recipients: ${topBarangays}`,
      )

      setShowDistributeDialog(false)
      setSelectedCategory(null)
      setSelectedBarangays([])
      await fetchAllData()
      setTimeout(() => setActionMessage(null), 8000)
    } catch (error: any) {
      console.error("💥 Error in MCDA distribution:", error)
      setActionMessage(`Failed to distribute: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleManualOverrideDonation = async () => {
    if (!overrideItem || !overrideBarangay) {
      setActionMessage("Please select a target barangay for the manual allocation.")
      return
    }

    setLoading(true)
    setActionMessage(null)

    try {
      console.log(`⚡ Manually overriding donation ${overrideItem.id} to ${overrideBarangay}...`)

      const { error: updateError } = await supabase
        .from("food_items")
        .update({
          status: "claimed",
          storage_status: "allocated",
          assigned_barangay: overrideBarangay,
          claimed_at: new Date().toISOString(),
          is_manual_override: true,
          override_reason: overrideReason || "Manual MSWD administrative allocation",
        })
        .eq("id", overrideItem.id)

      if (updateError) throw updateError

      // Log distribution
      await supabase.from("distribution_logs").insert({
        food_item_id: overrideItem.id,
        barangay_name: overrideBarangay,
        quantity_distributed: overrideItem.quantity,
        distribution_method: "manual_mswd_override",
        mcda_score: 100,
        requested_quantity: overrideItem.quantity,
        category: overrideItem.category,
        distributed_by: user.id,
        notes: `MSWD Manual Override: ${overrideReason || "Administrative Priority Dispatch"}`,
        created_at: new Date().toISOString(),
      })

      // Send Notification to recipient barangay
      await supabase.from("notifications").insert({
        recipient_barangay: overrideBarangay,
        food_item_id: overrideItem.id,
        message: `MSWD has manually allocated "${overrideItem.title}" (${overrideItem.quantity} ${overrideItem.unit}) to your barangay. Reason: ${overrideReason || "Administrative allocation"}`,
        type: "mswd_manual_allocation",
        priority_score: 10,
        created_at: new Date().toISOString(),
      })

      // Record in unified transaction log
      await logDonationTransaction({
        food_item_id: overrideItem.id,
        item_title: overrideItem.title,
        actor_id: user?.id,
        actor_name: `${profile?.first_name} ${profile?.last_name}`,
        actor_role: "mswd_representative",
        action_type: "manual_overridden",
        old_status: overrideItem.status,
        new_status: "allocated",
        target_barangay: overrideBarangay,
        quantity: overrideItem.quantity,
        unit: overrideItem.unit,
        notes: `MSWD Process Override to Brgy. ${overrideBarangay}. Reason: ${overrideReason || "Administrative override"}`,
      })

      setActionMessage(
        `Successfully overridden! "${overrideItem.title}" allocated directly to Brgy. ${overrideBarangay}.`
      )
      setShowOverrideDialog(false)
      setOverrideItem(null)
      setOverrideBarangay("")
      setOverrideReason("")
      await fetchAllData()
      setTimeout(() => setActionMessage(null), 5000)
    } catch (error: any) {
      console.error("💥 Error during manual override:", error)
      setActionMessage(`Failed manual override: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "waiting_pickup":
        return "bg-yellow-100 text-yellow-800"
      case "ready_distribution":
        return "bg-blue-100 text-blue-800"
      case "claimed":
        return "bg-purple-100 text-purple-800"
      case "distributed":
        return "bg-gray-100 text-gray-800"
      case "rejected": // Added for rejection status
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStorageStatusColor = (storageStatus: string) => {
    switch (storageStatus) {
      case "donated":
        return "bg-orange-100 text-orange-800"
      case "claimed":
        return "bg-yellow-100 text-yellow-800"
      case "in_storage":
        return "bg-blue-100 text-blue-800"
      case "allocated":
        return "bg-purple-100 text-purple-800"
      case "distributed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Show loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading municipal dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{fetchError}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    {
      id: "donations",
      label: "All Donations",
      icon: <Package className="h-4 w-4" />,
      onClick: () => setActiveTab("donations"),
      isActive: activeTab === "donations",
    },
    {
      id: "categories",
      label: "MCDA Distribution",
      icon: <Target className="h-4 w-4" />,
      onClick: () => setActiveTab("categories"),
      isActive: activeTab === "categories",
    },
    {
      id: "allocated",
      label: "Allocated Foods",
      icon: <CheckSquare className="h-4 w-4" />,
      onClick: () => setActiveTab("allocated"),
      isActive: activeTab === "allocated",
    },
    {
      id: "requests",
      label: "Barangay Requests",
      icon: <Utensils className="h-4 w-4" />,
      onClick: () => setActiveTab("requests"),
      isActive: activeTab === "requests",
    },
    {
      id: "audit_trail",
      label: "Transaction Audit Trail",
      icon: <History className="h-4 w-4" />,
      onClick: () => setActiveTab("audit_trail"),
      isActive: activeTab === "audit_trail",
    },
  ]

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar items={sidebarItems} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
          subtitle="Municipal Representative"
          onRefresh={fetchAllData}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto">
            {/* Action Message */}
            {actionMessage && (
              <Alert
                className={`mb-6 ${actionMessage.includes("Failed") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
              >
                <Info className={`h-4 w-4 ${actionMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`} />
                <AlertDescription className={actionMessage.includes("Failed") ? "text-red-800" : "text-green-800"}>
                  {actionMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">
                        {foodItems.filter((item) => item.status === "available").length}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Claimed</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {foodItems.filter((item) => item.storage_status === "claimed").length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Storage</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {foodItems.filter((item) => item.storage_status === "in_storage").length}
                      </p>
                    </div>
                    <Warehouse className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Allocated</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {foodItems.filter((item) => item.storage_status === "allocated").length}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Requests</p>
                      <p className="text-2xl font-bold text-orange-600">{foodRequests.length}</p>
                    </div>
                    <Utensils className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

              {/* All Donations Tab */}
              <TabsContent value="donations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      All Donated Foods
                    </CardTitle>
                    <CardDescription>View all donated foods and manage them through claim → store workflow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {foodItems.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No donated foods available</p>
                        <p className="text-sm text-gray-400">Donated foods will appear here when posted by donors</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {foodItems.map((item) => (
                          <div key={item.id} className="border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold">{item.title}</h3>
                                  <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>
                                  <Badge className={getStorageStatusColor(item.storage_status)}>
                                    {item.storage_status.replace("_", " ")}
                                  </Badge>
                                  <Badge variant="outline">{item.category}</Badge>
                                  {item.status === "rejected" && ( // Display rejection reason if rejected
                                    <Badge variant="outline" className="bg-red-100 text-red-700">
                                      Reason: {item.rejection_reason}
                                    </Badge>
                                  )}
                                </div>

                                {item.description && <p className="text-gray-600 mb-3">{item.description}</p>}

                                {/* Item Information */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                  <div>
                                    <span className="font-medium">Donor:</span> {item.profiles?.first_name}{" "}
                                    {item.profiles?.last_name}
                                  </div>
                                  <div>
                                    <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                                  </div>
                                  <div>
                                    <span className="font-medium">Expires:</span>{" "}
                                    {new Date(item.expiry_date).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Method:</span> {item.delivery_method}
                                  </div>
                                </div>

                                {/* Delivery Information */}
                                {item.delivery_method === "pickup" && item.pickup_address && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <Truck className="h-4 w-4 text-blue-600 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium text-blue-800">Pickup Information:</p>
                                        <p className="text-blue-700">{item.pickup_address}</p>
                                        {item.pickup_contact && (
                                          <p className="text-blue-700 flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {item.pickup_contact}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {item.delivery_method === "dropoff" && (
                                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium text-green-800">Drop-off Location:</p>
                                        <p className="text-green-700">Municipal Hall, Janiuay, Iloilo, Philippines</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Storage Information */}
                                {item.storage_location && (
                                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-800">Storage Location:</p>
                                      <p className="text-gray-700">{item.storage_location}</p>
                                      {item.storage_notes && (
                                        <p className="text-gray-600 mt-1">Notes: {item.storage_notes}</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Allocation Information */}
                                {item.assigned_barangay && (
                                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                                    <div className="text-sm">
                                      <p className="font-medium text-purple-800">Allocated to:</p>
                                      <p className="text-purple-700">{item.assigned_barangay}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="ml-6 flex flex-col gap-2 shrink-0">
                                {item.pickup_latitude && item.pickup_longitude && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setViewingMapItem(item)}
                                    className="text-xs bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                                  >
                                    <MapPin className="h-3.5 w-3.5 mr-1 text-blue-600" />
                                    Map Pin
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedItemForLogs(item)
                                    setShowItemLogsDialog(true)
                                  }}
                                  className="text-xs bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                >
                                  <History className="h-3.5 w-3.5 mr-1 text-purple-600" />
                                  Audit Trail
                                </Button>

                                {item.status === "available" && (
                                  <>
                                    <Button
                                      onClick={() => handleClaimFood(item.id)}
                                      disabled={loading}
                                      className="bg-green-600 hover:bg-green-700 text-xs"
                                    >
                                      <Package className="h-3.5 w-3.5 mr-1" />
                                      Claim
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setSelectedItem(item)
                                        setShowRejectDialog(true)
                                      }}
                                      disabled={loading}
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      <X className="h-3.5 w-3.5 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}

                                {item.status === "waiting_pickup" && (
                                  <Button
                                    onClick={() => {
                                      setSelectedItem(item)
                                      setShowStoreDialog(true)
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                                  >
                                    <Warehouse className="h-3.5 w-3.5 mr-1" />
                                    Store
                                  </Button>
                                )}

                                {/* Manual Override Button available for ready in-storage items or re-allocating */}
                                {["in_storage", "allocated"].includes(item.storage_status) && (
                                  <Button
                                    onClick={() => {
                                      setOverrideItem(item)
                                      setOverrideBarangay(item.assigned_barangay || "")
                                      setOverrideReason(item.override_reason || "")
                                      setShowOverrideDialog(true)
                                    }}
                                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    {item.storage_status === "allocated" ? "Override Allocation" : "Manual Donate"}
                                  </Button>
                                )}

                                {item.storage_status === "in_storage" && (
                                  <Badge className="bg-green-100 text-green-800 text-[11px] justify-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    In Storage
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* MCDA Distribution Tab */}
              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      MCDA Demographic-Based Distribution
                    </CardTitle>
                    <CardDescription>
                      Distribute stored food items to any of the 57 official Janiuay barangays using MCDA algorithm
                      recommendations based on demographic vulnerability and need
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryGroups.length === 0 ? (
                      <div className="text-center py-8">
                        <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No stored food categories available</p>
                        <p className="text-sm text-gray-400">Store some claimed items first to enable MCDA distribution</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {categoryGroups.map((categoryGroup) => {
                          const mcdaRecommendations = getMCDARecommendations(
                            categoryGroup.category,
                            categoryGroup.requestingBarangays,
                          )

                          return (
                            <div key={categoryGroup.category} className="border rounded-lg p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-orange-600" />
                                    {categoryGroup.category}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {categoryGroup.items.length} items • Total: {categoryGroup.totalQuantity} units •{" "}
                                    {categoryGroup.requestingBarangays.length} requests
                                  </p>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedCategory(categoryGroup)
                                    setSelectedBarangays([])
                                    setShowDistributeDialog(true)
                                  }}
                                  disabled={loading || categoryGroup.items.length === 0}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  MCDA Distribute
                                </Button>
                              </div>

                              {/* Items in this category */}
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-800 mb-2">Available Items:</h4>
                                <div className="grid md:grid-cols-2 gap-2">
                                  {categoryGroup.items.map((item) => (
                                    <div key={item.id} className="text-sm bg-gray-50 p-3 rounded">
                                      <div className="font-medium">{item.title}</div>
                                      <div className="text-gray-600">
                                        {item.quantity} {item.unit} • Donor: {item.profiles?.first_name}{" "}
                                        {item.profiles?.last_name}
                                      </div>
                                      <div className="text-gray-500 text-xs">Storage: {item.storage_location}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {categoryGroup.requestingBarangays.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Specific requests */}
                                  <div>
                                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-red-600" />
                                      Barangay Requests ({categoryGroup.requestingBarangays.length})
                                    </h4>
                                    <div className="space-y-2">
                                      {categoryGroup.requestingBarangays.map((request) => (
                                        <div key={request.id} className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <span className="font-medium">{request.barangay_name}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                              {request.quantity_needed} {request.unit}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* MCDA recommendations */}
                                  <div>
                                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <Target className="h-4 w-4 text-blue-600" />
                                      MCDA Recommendations
                                    </h4>
                                    <div className="space-y-2">
                                      {mcdaRecommendations.map((rec, index) => (
                                        <div
                                          key={rec.barangay.name}
                                          className="bg-blue-50 p-3 rounded border-l-4 border-blue-400"
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">
                                              #{index + 1} {rec.barangay.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline">
                                                MCDA: {rec.score}%
                                              </Badge>
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">
                                            Requested: {rec.request.quantity_needed} {rec.request.unit} • Pop:{" "}
                                            {rec.barangay.population.toLocaleString()} • Urgency:{" "}
                                            {rec.barangay.urgency_score}
                                            /10 • Food Security: {rec.barangay.food_security_level}/10
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">No Specific Requests</span>
                                  </div>
                                  <p className="text-sm text-yellow-700">
                                    No barangays have specifically requested this food category. You can still distribute to
                                    any of the 57 official Janiuay barangays using MCDA algorithm based on demographic
                                    vulnerability and general need.
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Allocated Foods Tab */}
              <TabsContent value="allocated">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Allocated Foods
                    </CardTitle>
                    <CardDescription>
                      View all food items that have been allocated to barangays through MCDA distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const allocatedItems = foodItems.filter((item) => item.storage_status === "allocated")

                      if (allocatedItems.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No allocated foods</p>
                            <p className="text-sm text-gray-400">
                              Food items will appear here after being distributed through MCDA algorithm
                            </p>
                          </div>
                        )
                      }

                      // Group allocated items by barangay
                      const itemsByBarangay = allocatedItems.reduce(
                        (acc, item) => {
                          const barangay = item.assigned_barangay
                          if (!acc[barangay]) {
                            acc[barangay] = []
                          }
                          acc[barangay].push(item)
                          return acc
                        },
                        {} as Record<string, FoodItem[]>,
                      )

                      return (
                        <div className="space-y-6">
                          {Object.entries(itemsByBarangay)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([barangay, items]) => (
                              <div key={barangay} className="border rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                      <MapPin className="h-5 w-5 text-purple-600" />
                                      {barangay}
                                      {barangay.includes("(Poblacion)") && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                                          Poblacion
                                        </Badge>
                                      )}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {items.length} items allocated • Total quantity:{" "}
                                      {items.reduce((sum, item) => sum + item.quantity, 0)} units
                                    </p>
                                  </div>
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Target className="h-3 w-3 mr-1" />
                                    Allocated
                                  </Badge>
                                </div>

                                <div className="space-y-3">
                                  {items.map((item) => (
                                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="font-medium">{item.title}</h4>
                                            <Badge variant="outline">{item.category}</Badge>
                                            <Badge className={getStatusColor(item.status)}>
                                              {item.status.replace("_", " ")}
                                            </Badge>
                                            {item.is_manual_override && (
                                              <Badge className="bg-rose-100 text-rose-800 text-[10px] border-rose-300">
                                                Manual Override
                                              </Badge>
                                            )}
                                          </div>
                                          {item.override_reason && (
                                            <p className="text-xs text-rose-700 italic mb-1">
                                              Override reason: "{item.override_reason}"
                                            </p>
                                          )}
                                          {item.description && (
                                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                          )}
                                        </div>
                                        <div className="text-right text-sm text-gray-600 flex flex-col items-end gap-1">
                                          <div className="font-medium">
                                            {item.quantity} {item.unit}
                                          </div>
                                          <div className="text-xs">
                                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                                          </div>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => {
                                                setOverrideItem(item)
                                                setOverrideBarangay(item.assigned_barangay || "")
                                                setOverrideReason(item.override_reason || "")
                                                setShowOverrideDialog(true)
                                              }}
                                              className="h-6 text-[10px] px-2 text-rose-700 border-rose-300 hover:bg-rose-50"
                                            >
                                              <RotateCcw className="h-2.5 w-2.5 mr-1" />
                                              Override
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => {
                                                setSelectedItemForLogs(item)
                                                setShowItemLogsDialog(true)
                                              }}
                                              className="h-6 text-[10px] px-2 text-purple-700 border-purple-300 hover:bg-purple-50"
                                            >
                                              <History className="h-2.5 w-2.5 mr-1" />
                                              Audit
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                                        <div>
                                          <span className="font-medium">Donor:</span> {item.profiles?.first_name}{" "}
                                          {item.profiles?.last_name}
                                        </div>
                                        <div>
                                          <span className="font-medium">Storage:</span> {item.storage_location || "N/A"}
                                        </div>
                                        <div>
                                          <span className="font-medium">Allocated:</span>{" "}
                                          {item.claimed_at ? new Date(item.claimed_at).toLocaleDateString() : "N/A"}
                                        </div>
                                        <div>
                                          <span className="font-medium">Status:</span>{" "}
                                          {item.storage_status.replace("_", " ")}
                                        </div>
                                      </div>

                                      {/* Show delivery method information */}
                                      {item.delivery_method === "pickup" && item.pickup_address && (
                                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                                          <div className="flex items-center gap-1">
                                            <Truck className="h-3 w-3 text-blue-600" />
                                            <span className="font-medium text-blue-800">Original Pickup:</span>
                                            <span className="text-blue-700">{item.pickup_address}</span>
                                            {item.pickup_contact && (
                                              <>
                                                <Phone className="h-3 w-3 text-blue-600 ml-2" />
                                                <span className="text-blue-700">{item.pickup_contact}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {item.delivery_method === "dropoff" && (
                                        <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                                          <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-green-600" />
                                            <span className="font-medium text-green-800">Original Drop-off:</span>
                                            <span className="text-green-700">Municipal Hall, Janiuay, Iloilo</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Summary for this barangay */}
                                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                  <div className="text-sm">
                                    <div className="font-medium text-purple-800 mb-1">
                                      Allocation Summary for {barangay}:
                                    </div>
                                    <div className="text-purple-700">
                                      Categories: {[...new Set(items.map((item) => item.category))].join(", ")} • Total
                                      Items: {items.length} • Total Quantity:{" "}
                                      {items.reduce((sum, item) => sum + item.quantity, 0)} units
                                    </div>
                                    <div className="text-xs text-purple-600 mt-1">
                                      Allocated through MCDA demographic-based distribution algorithm
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Overall summary */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Overall Allocation Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-blue-800">Total Barangays</div>
                                <div className="text-blue-700">{Object.keys(itemsByBarangay).length}</div>
                              </div>
                              <div>
                                <div className="font-medium text-blue-800">Total Items</div>
                                <div className="text-blue-700">{allocatedItems.length}</div>
                              </div>
                              <div>
                                <div className="font-medium text-blue-800">Total Quantity</div>
                                <div className="text-blue-700">
                                  {allocatedItems.reduce((sum, item) => sum + item.quantity, 0)} units
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-blue-800">Categories</div>
                                <div className="text-blue-700">
                                  {[...new Set(allocatedItems.map((item) => item.category))].length}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Barangay Requests Tab */}
              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Barangay Food Requests
                    </CardTitle>
                    <CardDescription>
                      View all pending food requests from official Janiuay barangay representatives (no manual priority
                      levels)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {foodRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending food requests</p>
                        <p className="text-sm text-gray-400">Barangay requests will appear here when submitted</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {foodRequests.map((request) => (
                          <div key={request.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{request.barangay_name}</h3>
                                <Badge variant="outline">{request.food_category}</Badge>
                              </div>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">Quantity Needed:</span> {request.quantity_needed}{" "}
                                {request.unit}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                <Badge
                                  className={
                                    request.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : request.status === "fulfilled"
                                      ? "bg-blue-100 text-blue-800"
                                      : request.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {request.status.toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-800">Reason:</span>
                                <p className="text-gray-600 mt-1">{request.reason}</p>
                              </div>
                              {request.special_requirements && (
                                <div>
                                  <span className="font-medium text-gray-800">Special Requirements:</span>
                                  <p className="text-gray-600 mt-1">{request.special_requirements}</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons for Municipal Officer */}
                            <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                              <div className="text-xs text-gray-500">
                                Municipal Decision & Allocation
                              </div>
                              <div className="flex items-center gap-2">
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateRequestStatus(request.id, "approved")}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                      Approve Request
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === "approved" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateRequestStatus(request.id, "fulfilled")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                  >
                                    <Truck className="h-3.5 w-3.5 mr-1" />
                                    Mark as Dispatched / Fulfilled
                                  </Button>
                                )}
                                {request.status === "fulfilled" && (
                                  <Badge variant="outline" className="text-xs text-green-700 bg-green-50">
                                    Fully Dispatched to Barangay
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* MCDA Information */}
                            <div className="mt-3 p-2 bg-green-50 rounded">
                              <div className="text-xs text-green-800">
                                <strong>MCDA Recommendations:</strong> This request will be used to generate MCDA
                                recommendations based on demographic vulnerability, urgency score, food security level, and
                                distance. You have full control over final distribution decisions.
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transaction Audit Trail Tab */}
              <TabsContent value="audit_trail">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-purple-600" />
                      Comprehensive Donation Audit Trail & Transaction Logs
                    </CardTitle>
                    <CardDescription>
                      Full immutable log tracking every donation lifecycle step: Donated &rarr; Claimed &rarr; Stored &rarr; MCDA / Manual Override &rarr; Distributed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionLogTimeline logs={transactionLogs} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Store Food Dialog */}
            <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Store Food Item</DialogTitle>
                  <DialogDescription>Record storage details for {selectedItem?.title}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storage_location">Storage Location</Label>
                    <Select onValueChange={setStorageLocation} value={storageLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage location" />
                      </SelectTrigger>
                      <SelectContent>
                        {storageLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage_notes">Storage Notes</Label>
                    <Textarea
                      id="storage_notes"
                      placeholder="Any special storage requirements or notes"
                      value={storageNotes}
                      onChange={(e) => setStorageNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowStoreDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStoreFood}
                      disabled={!storageLocation || loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? "Storing..." : "Store Item"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Distribute Category Dialog */}
            <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>MCDA Distribution - {selectedCategory?.category}</DialogTitle>
                  <DialogDescription>
                    Select from the 57 official Janiuay barangays to distribute to. MCDA provides recommendations, but you
                    have full control over the final selection.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Quick selection buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if ((selectedCategory?.requestingBarangays?.length || 0) > 0) {
                          const requestingBarangayNames = selectedCategory!.requestingBarangays.map(
                            (req) => req.barangay_name,
                          )
                          setSelectedBarangays(requestingBarangayNames)
                        }
                      }}
                      disabled={!(selectedCategory?.requestingBarangays?.length)}
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Select Requesting ({selectedCategory?.requestingBarangays.length || 0})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedBarangays(JANIUAY_BARANGAYS)}>
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Select All 57 Barangays
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedBarangays([])}>
                      <Square className="h-3 w-3 mr-1" />
                      Clear Selection
                    </Button>
                  </div>

                  {/* MCDA-ranked barangays */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      All 57 Janiuay Barangays (MCDA Recommendations)
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      MCDA scores are recommendations based on demographic vulnerability. You can select any barangays for
                      distribution.{" "}
                      {barangayData.length > 0
                        ? "Using database demographic data."
                        : "Using default demographic estimates."}
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedCategory &&
                        (() => {
                          // Get all barangays with their data (database or default)
                          const allBarangaysWithData = JANIUAY_BARANGAYS.map((name) => {
                            const dbBarangay = barangayData.find((b) => b.name === name)
                            return dbBarangay || getDefaultBarangayData(name)
                          })

                          return allBarangaysWithData
                            .map((barangay) => {
                              // Create a mock request for MCDA calculation
                              const mockRequest = {
                                id: `mock-${barangay.name}`,
                                barangay_name: barangay.name,
                                food_category: selectedCategory?.category || "",
                                quantity_needed: 10,
                                unit: "kg",
                                reason: "General distribution",
                                special_requirements: "",
                                status: "pending",
                                created_at: new Date().toISOString(),
                              }
                              const score = calculateMCDAScore(barangay, mockRequest)
                              const hasRequest = selectedCategory.requestingBarangays.some(
                                (req) => req.barangay_name === barangay.name,
                              )
                              return { barangay, score, mockRequest, hasRequest }
                            })
                            .sort((a, b) => b.score - a.score)
                            .map((item, index) => (
                              <div
                                key={item.barangay.name}
                                className={`flex items-center space-x-2 p-2 rounded border ${item.hasRequest ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                                  }`}
                              >
                                <Checkbox
                                  id={item.barangay.name}
                                  checked={selectedBarangays.includes(item.barangay.name)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedBarangays([...selectedBarangays, item.barangay.name])
                                    } else {
                                      setSelectedBarangays(selectedBarangays.filter((name) => name !== item.barangay.name))
                                    }
                                  }}
                                />
                                <label htmlFor={item.barangay.name} className="flex-1 text-sm cursor-pointer">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium flex items-center gap-2">
                                      #{index + 1} {item.barangay.name}
                                      {item.hasRequest && (
                                        <Badge variant="outline" className="bg-red-100 text-red-700 text-xs">
                                          Requested
                                        </Badge>
                                      )}
                                      {item.barangay.name.includes("(Poblacion)") && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                                          Poblacion
                                        </Badge>
                                      )}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline">
                                        MCDA: {item.score}%
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Pop: {item.barangay.population.toLocaleString()} • Urgency:{" "}
                                    {item.barangay.urgency_score}
                                    /10 • Food Security: {item.barangay.food_security_level}/10 • Distance:{" "}
                                    {item.barangay.distance_km}km
                                  </div>
                                </label>
                              </div>
                            ))
                        })()}
                    </div>
                  </div>

                  {/* Distribution summary */}
                  {selectedBarangays.length > 0 && selectedCategory && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Distribution Summary</h4>
                      <p className="text-sm text-blue-800">
                        Distributing {selectedCategory.items.length} {selectedCategory.category} items to{" "}
                        {selectedBarangays.length} selected barangays based on MCDA scores and your selection.
                      </p>
                      <p className="text-sm text-blue-700">
                        Items will be allocated proportionally based on MCDA scores of selected barangays.
                      </p>
                      <div className="text-xs text-blue-600 mt-2">
                        Selected ({selectedBarangays.length}): {selectedBarangays.slice(0, 5).join(", ")}
                        {selectedBarangays.length > 5 && ` and ${selectedBarangays.length - 5} more...`}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDistributeDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDistributeCategory}
                      disabled={selectedBarangays.length === 0 || loading}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {loading ? "Distributing..." : `Distribute to ${selectedBarangays.length} Barangays`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Food Donation</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this donation. The donor will be notified.
                  </DialogDescription>
                </DialogHeader>
                {selectedItem && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-semibold">{selectedItem.title}</p>
                      <p className="text-sm text-gray-600">
                        Category: {selectedItem.category} | Quantity: {selectedItem.quantity} {selectedItem.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Donor: {selectedItem.profiles?.first_name} {selectedItem.profiles?.last_name}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                      <Textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Food is past expiry date, Packaging is damaged, Not suitable for distribution..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRejectDialog(false)
                          setRejectionReason("")
                          setSelectedItem(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRejectFood}
                        disabled={loading || !rejectionReason.trim()}
                      >
                        {loading ? "Rejecting..." : "Reject Donation"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* MSWD Manual Override / Direct Donation Modal */}
            <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-rose-700">
                    <RotateCcw className="h-5 w-5" />
                    MSWD Manual Process Override
                  </DialogTitle>
                  <DialogDescription>
                    Directly allocate or reassign food aid to any barangay, bypassing algorithmic distribution.
                  </DialogDescription>
                </DialogHeader>

                {overrideItem && (
                  <div className="space-y-4 py-2">
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-gray-900">{overrideItem.title}</p>
                      <p className="text-gray-600">
                        Category: {overrideItem.category} | Qty: {overrideItem.quantity} {overrideItem.unit}
                      </p>
                      {overrideItem.assigned_barangay && (
                        <p className="text-amber-700 font-medium">
                          Currently Assigned To: {overrideItem.assigned_barangay}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-barangay" className="text-xs font-semibold">
                        Target Recipient Barangay *
                      </Label>
                      <Select value={overrideBarangay} onValueChange={setOverrideBarangay}>
                        <SelectTrigger id="target-barangay">
                          <SelectValue placeholder="Select target barangay..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {JANIUAY_BARANGAYS.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="override-reason" className="text-xs font-semibold">
                        Justification / Administrative Reason *
                      </Label>
                      <Textarea
                        id="override-reason"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g., Immediate typhoon flood relief, emergency community feeding, urgent senior citizen request..."
                        rows={3}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowOverrideDialog(false)
                          setOverrideItem(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleManualOverrideDonation}
                        disabled={loading || !overrideBarangay}
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        {loading ? "Processing..." : "Confirm Override & Dispatch"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* View Pinned Pickup Location Modal */}
            <Dialog open={!!viewingMapItem} onOpenChange={() => setViewingMapItem(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Donor Pinned Location: {viewingMapItem?.title}
                  </DialogTitle>
                  <DialogDescription>
                    Exact OpenStreetMap GPS coordinate pin set by donor for driver collection.
                  </DialogDescription>
                </DialogHeader>
                {viewingMapItem && viewingMapItem.pickup_latitude && viewingMapItem.pickup_longitude && (
                  <div className="py-2">
                    <LocationViewerMap
                      latitude={viewingMapItem.pickup_latitude}
                      longitude={viewingMapItem.pickup_longitude}
                      title={viewingMapItem.title}
                      address={viewingMapItem.pickup_address}
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Item Transaction History Audit Modal */}
            <Dialog open={showItemLogsDialog} onOpenChange={setShowItemLogsDialog}>
              <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-600" />
                    Audit Trail: {selectedItemForLogs?.title}
                  </DialogTitle>
                  <DialogDescription>
                    Full chronological audit log of all events for this food donation.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <TransactionLogTimeline
                    logs={transactionLogs.filter((l) => l.food_item_id === selectedItemForLogs?.id)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
