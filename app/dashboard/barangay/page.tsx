"use client"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Users, Package, Bell, LogOut, User, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  barangay: string
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

interface FoodCategory {
  category_name: string
  target_demographics: string[]
  nutritional_priority: number
  shelf_life_category: string
}

export default function BarangayDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const [barangayData, setBarangayData] = useState<BarangayData | null>(null)
  const [foodRequests, setFoodRequests] = useState<FoodRequest[]>([])
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Form states for demographic data
  const [demographicForm, setDemographicForm] = useState({
    children_population: 0,
    elderly_population: 0,
    malnourished_children: 0,
  })

  // Form states for food requests (removed priority_level)
  const [requestForm, setRequestForm] = useState({
    food_category: "",
    quantity_needed: 0,
    unit: "kg",
    reason: "",
    special_requirements: "",
  })

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

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (profile) {
      fetchAllData()
    }
  }, [profile])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("❌ No user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      console.log("✅ User authenticated:", user.email)

      // Check if user is barangay representative
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, approval_status, barangay, first_name, last_name, email")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("❌ Error fetching user profile:", profileError)
        setFetchError("Failed to fetch user profile")
        return
      }

      console.log("👤 User profile:", profileData)

      if (profileData?.role !== "barangay") {
        console.log("❌ User is not barangay representative, redirecting")
        router.push("/dashboard")
        return
      }

      if (profileData?.approval_status !== "approved") {
        console.log("❌ User not approved yet")
        setFetchError("Your account is pending approval. Please wait for admin approval.")
        return
      }

      if (!profileData?.barangay) {
        console.log("❌ User has no barangay assigned")
        setFetchError("No barangay assigned to your account. Please contact admin.")
        return
      }

      setProfile(profileData)
      console.log("✅ Barangay representative authenticated successfully")
    } catch (error) {
      console.error("💥 Error in checkUser:", error)
      setFetchError("Authentication error")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    setFetchError(null)

    try {
      console.log("🔄 Starting to fetch all data...")

      await Promise.all([fetchBarangayData(), fetchFoodRequests(), fetchFoodCategories()])

      console.log("✅ All data fetched successfully")
    } catch (error) {
      console.error("💥 Error fetching data:", error)
      setFetchError("Failed to load dashboard data")
    } finally {
      setDataLoading(false)
    }
  }

  const fetchBarangayData = async () => {
    try {
      console.log(`🏘️ Fetching barangay data for ${profile?.barangay}...`)

      const { data, error } = await supabase.from("barangay_data").select("*").eq("name", profile?.barangay)

      if (error) {
        console.error("❌ Error fetching barangay data:", error)
        throw error
      }

      if (data && data.length > 0) {
        // Use the first matching record if multiple exist
        const barangayRecord = data[0]
        console.log("✅ Successfully fetched barangay data:", barangayRecord)
        setBarangayData(barangayRecord)
        setDemographicForm({
          children_population: barangayRecord.children_population || 0,
          elderly_population: barangayRecord.elderly_population || 0,
          malnourished_children: barangayRecord.malnourished_children || 0,
        })
      } else {
        console.warn("⚠️ No barangay data found, using default values")
        // Set default barangay data without inserting to database
        const defaultData = {
          name: profile?.barangay,
          population: 1000,
          urgency_score: 5,
          distance_km: 10,
          children_population: 0,
          elderly_population: 0,
          pregnant_women: 0,
          families_with_infants: 0,
          malnourished_children: 0,
          pwd_population: 0,
          senior_citizens: 0,
          solo_parents: 0,
          indigenous_families: 0,
          food_security_level: 5,
        }

        setBarangayData(defaultData)
        setDemographicForm({
          children_population: 0,
          elderly_population: 0,
          malnourished_children: 0,
        })
      }
    } catch (error) {
      console.error("💥 Exception fetching barangay data:", error)
      throw error
    }
  }

  const fetchFoodRequests = async () => {
    try {
      console.log(`🍽️ Fetching food requests for ${profile?.barangay}...`)

      const { data, error } = await supabase
        .from("food_requests")
        .select("*")
        .eq("barangay_name", profile?.barangay)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching food requests:", error)
        // Don't throw error as table might not exist yet
        setFoodRequests([])
        return
      }

      setFoodRequests(data || [])
      console.log(`✅ Fetched ${data?.length || 0} food requests`)
    } catch (error) {
      console.error("💥 Exception fetching food requests:", error)
      setFoodRequests([])
    }
  }

  const fetchFoodCategories = async () => {
    try {
      const { data, error } = await supabase.from("food_categories").select("*")

      if (error) {
        console.error("❌ Error fetching food categories:", error)
        // Use default categories if database fetch fails
        setFoodCategories([])
      } else if (data) {
        console.log(`✅ Successfully fetched ${data.length} food categories`)
        setFoodCategories(data)
      }
    } catch (error) {
      console.error("💥 Exception fetching food categories:", error)
      setFoodCategories([])
    }
  }

  const saveDemographicData = async () => {
    if (!barangayData) return

    setLoading(true)
    setSaveMessage(null)

    try {
      console.log("💾 Saving demographic data...")
      console.log("📊 Form data:", demographicForm)

      const updateData = {
        children_population: demographicForm.children_population,
        elderly_population: demographicForm.elderly_population,
        malnourished_children: demographicForm.malnourished_children,
      }

      console.log("📤 Updating database with:", updateData)

      const { error } = await supabase.from("barangay_data").update(updateData).eq("name", profile?.barangay)

      if (error) {
        console.error("❌ Error saving demographic data:", error)
        throw error
      }

      console.log("✅ Demographic data saved successfully to database")
      setSaveMessage("Demographic data saved successfully!")

      // Update the local barangayData state immediately to reflect changes in overview
      setBarangayData((prev) => {
        if (!prev) return null
        const updated = {
          ...prev,
          children_population: demographicForm.children_population,
          elderly_population: demographicForm.elderly_population,
          malnourished_children: demographicForm.malnourished_children,
        }
        console.log("🔄 Updated local barangay data state:", updated)
        return updated
      })

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      console.error("💥 Error saving demographic data:", error)
      setSaveMessage(`Failed to save: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const submitFoodRequest = async () => {
    if (!requestForm.food_category || !requestForm.reason) {
      setSaveMessage("Please fill in all required fields")
      return
    }

    setLoading(true)
    setSaveMessage(null)

    try {
      console.log("📤 Submitting food request...")

      // Include a default priority_level of 5 since MCDA algorithm handles prioritization
      const requestData = {
        barangay_name: profile?.barangay,
        priority_level: 5, // Default value - MCDA algorithm will handle actual prioritization
        ...requestForm,
      }

      console.log("📋 Request data:", requestData)

      const { error } = await supabase.from("food_requests").insert(requestData)

      if (error) {
        console.error("❌ Error submitting food request:", error)
        throw error
      }

      console.log("✅ Food request submitted successfully")
      setSaveMessage(
        "Food request submitted successfully! The MCDA algorithm will prioritize your request based on your barangay's demographic data and needs.",
      )

      // Reset form
      setRequestForm({
        food_category: "",
        quantity_needed: 0,
        unit: "kg",
        reason: "",
        special_requirements: "",
      })

      // Refresh food requests
      await fetchFoodRequests()

      // Clear message after 5 seconds (longer for the MCDA explanation)
      setTimeout(() => setSaveMessage(null), 5000)
    } catch (error: any) {
      console.error("💥 Error submitting food request:", error)
      setSaveMessage(`Failed to submit request: ${error.message}`)
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
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "fulfilled":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading barangay dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{fetchError}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            <Bell className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">FoodShare Janiuay</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {profile?.first_name} {profile?.last_name} - {profile?.barangay}
            </span>
            <Button variant="outline" onClick={() => fetchAllData()}>
              <Bell className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Save Message */}
        {saveMessage && (
          <Alert
            className={`mb-6 ${saveMessage.includes("Failed") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
          >
            <Package className={`h-4 w-4 ${saveMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`} />
            <AlertDescription className={saveMessage.includes("Failed") ? "text-red-800" : "text-green-800"}>
              {saveMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Barangay Overview */}
        {barangayData && (
          <Card className="mb-8">
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="demographics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="requests">Food Requests</TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
          </TabsList>

          {/* Demographics Tab */}
          <TabsContent value="demographics">
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
          </TabsContent>

          {/* Food Requests Tab */}
          <TabsContent value="requests">
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
          </TabsContent>

          {/* Request History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  Request History
                </CardTitle>
                <CardDescription>
                  View all your submitted food requests and their status. MCDA scores are calculated automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {foodRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No food requests submitted yet</p>
                    <p className="text-sm text-gray-400">
                      Your submitted requests will appear here with MCDA priority scores
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {foodRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{getCategoryDisplayName(request.food_category)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {request.quantity_needed} {request.unit}
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
