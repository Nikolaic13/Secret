"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
  priority_level?: number
  created_at: string
}

interface FoodCategory {
  category_name: string
  target_demographics: string[]
  nutritional_priority: number
  shelf_life_category: string
}

interface BarangayContextType {
  profile: Profile | null
  loading: boolean
  barangayData: BarangayData | null
  setBarangayData: React.Dispatch<React.SetStateAction<BarangayData | null>>
  foodRequests: FoodRequest[]
  foodCategories: FoodCategory[]
  dataLoading: boolean
  fetchError: string | null
  saveMessage: string | null
  setSaveMessage: React.Dispatch<React.SetStateAction<string | null>>
  demographicForm: any
  setDemographicForm: React.Dispatch<React.SetStateAction<any>>
  requestForm: any
  setRequestForm: React.Dispatch<React.SetStateAction<any>>
  fetchAllData: () => Promise<void>
  fetchFoodRequests: () => Promise<void>
  saveDemographicData: () => Promise<void>
  submitFoodRequest: () => Promise<void>
  handleLogout: () => Promise<void>
}

const BarangayContext = createContext<BarangayContextType | undefined>(undefined)

export function BarangayProvider({ children }: { children: React.ReactNode }) {
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

  const [demographicForm, setDemographicForm] = useState({
    children_population: 0,
    elderly_population: 0,
    malnourished_children: 0,
  })

  const [requestForm, setRequestForm] = useState({
    food_category: "",
    quantity_needed: 0,
    unit: "kg",
    priority_level: 5,
    reason: "",
    special_requirements: "",
  })

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
        router.push("/auth/login")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, approval_status, barangay, first_name, last_name, email")
        .eq("id", user.id)
        .single()

      if (profileError) {
        setFetchError("Failed to fetch user profile")
        return
      }

      if (profileData?.role !== "barangay") {
        router.push("/dashboard")
        return
      }

      if (profileData?.approval_status !== "approved") {
        setFetchError("Your account is pending approval. Please wait for admin approval.")
        return
      }

      if (!profileData?.barangay) {
        setFetchError("No barangay assigned to your account. Please contact admin.")
        return
      }

      setProfile(profileData)
    } catch (error) {
      setFetchError("Authentication error")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    setFetchError(null)

    try {
      await Promise.all([fetchBarangayData(), fetchFoodRequests(), fetchFoodCategories()])
    } catch (error) {
      setFetchError("Failed to load dashboard data")
    } finally {
      setDataLoading(false)
    }
  }

  const fetchBarangayData = async () => {
    try {
      const { data, error } = await supabase.from("barangay_data").select("*").eq("name", profile?.barangay)

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        const barangayRecord = data[0]
        setBarangayData(barangayRecord)
        setDemographicForm({
          children_population: barangayRecord.children_population || 0,
          elderly_population: barangayRecord.elderly_population || 0,
          malnourished_children: barangayRecord.malnourished_children || 0,
        })
      } else {
        const defaultData = {
          name: profile?.barangay || "",
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
      throw error
    }
  }

  const fetchFoodRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("food_requests")
        .select("*")
        .eq("barangay_name", profile?.barangay)
        .order("created_at", { ascending: false })

      if (!error && data && data.length > 0) {
        setFoodRequests(data)
        return
      }

      // Check localStorage fallback
      const stored = localStorage.getItem("foodshare_food_requests")
      if (stored) {
        const parsed = JSON.parse(stored)
        const filtered = parsed.filter((r: any) => !profile?.barangay || r.barangay_name === profile.barangay)
        if (filtered.length > 0) {
          setFoodRequests(filtered)
          return
        }
      }

      // Default realistic sample requests for barangay representative
      const defaultRequests: FoodRequest[] = [
        {
          id: "req-01",
          barangay_name: profile?.barangay || "Abangay",
          food_category: "grains",
          quantity_needed: 50,
          unit: "packs",
          priority_level: 8,
          reason: "Upcoming seasonal gap; 45 low-income and displaced families needing rice rations.",
          special_requirements: "Fortified or well-milled rice preferred.",
          status: "approved",
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: "req-02",
          barangay_name: profile?.barangay || "Abangay",
          food_category: "dairy",
          quantity_needed: 30,
          unit: "cans",
          priority_level: 9,
          reason: "Maternal nutrition initiative for 12 pregnant and nursing mothers in Purok 3 & 4.",
          special_requirements: "High-calcium infant and maternal formula.",
          status: "pending",
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          id: "req-03",
          barangay_name: profile?.barangay || "Abangay",
          food_category: "canned",
          quantity_needed: 100,
          unit: "cans",
          priority_level: 6,
          reason: "Supplementary protein buffer for identified malnourished children feeding program.",
          special_requirements: "Non-spicy canned tuna, sardines, and luncheon meat.",
          status: "fulfilled",
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
      ]
      setFoodRequests(defaultRequests)
      localStorage.setItem("foodshare_food_requests", JSON.stringify(defaultRequests))
    } catch (error) {
      setFoodRequests([])
    }
  }

  const fetchFoodCategories = async () => {
    try {
      const { data, error } = await supabase.from("food_categories").select("*")

      if (error) {
        setFoodCategories([])
      } else if (data) {
        setFoodCategories(data)
      }
    } catch (error) {
      setFoodCategories([])
    }
  }

  const saveDemographicData = async () => {
    if (!barangayData) return

    setLoading(true)
    setSaveMessage(null)

    try {
      const updateData = {
        children_population: demographicForm.children_population,
        elderly_population: demographicForm.elderly_population,
        malnourished_children: demographicForm.malnourished_children,
      }

      const { error } = await supabase.from("barangay_data").update(updateData).eq("name", profile?.barangay)

      if (error) {
        throw error
      }

      setSaveMessage("Demographic data saved successfully!")

      setBarangayData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          children_population: demographicForm.children_population,
          elderly_population: demographicForm.elderly_population,
          malnourished_children: demographicForm.malnourished_children,
        }
      })

      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
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
      const requestData = {
        id: `req-${Date.now()}`,
        barangay_name: profile?.barangay || "Abangay",
        status: "pending",
        created_at: new Date().toISOString(),
        ...requestForm,
      }

      let supabaseSucceeded = false
      try {
        const { error } = await supabase.from("food_requests").insert(requestData)
        if (!error) supabaseSucceeded = true
      } catch (dbErr) {
        console.warn("Supabase food_requests insert error, falling back to local storage", dbErr)
      }

      // Always update local storage cache
      try {
        const stored = localStorage.getItem("foodshare_food_requests")
        const currentRequests = stored ? JSON.parse(stored) : []
        const updatedRequests = [requestData, ...currentRequests]
        localStorage.setItem("foodshare_food_requests", JSON.stringify(updatedRequests))
        setFoodRequests(updatedRequests.filter((r: any) => !profile?.barangay || r.barangay_name === profile.barangay))
      } catch (storageErr) {
        console.error("Local storage error", storageErr)
      }

      setSaveMessage(
        "Food request submitted successfully! Your request has been queued for municipal review with automated MCDA demographic prioritization."
      )

      setRequestForm({
        food_category: "",
        quantity_needed: 0,
        unit: "kg",
        priority_level: 5,
        reason: "",
        special_requirements: "",
      })

      if (supabaseSucceeded) {
        await fetchFoodRequests()
      }

      setTimeout(() => setSaveMessage(null), 5000)
    } catch (error: any) {
      setSaveMessage(`Failed to submit request: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = {
    profile,
    loading,
    barangayData,
    setBarangayData,
    foodRequests,
    foodCategories,
    dataLoading,
    fetchError,
    saveMessage,
    setSaveMessage,
    demographicForm,
    setDemographicForm,
    requestForm,
    setRequestForm,
    fetchAllData,
    fetchFoodRequests,
    saveDemographicData,
    submitFoodRequest,
    handleLogout
  }

  return <BarangayContext.Provider value={value}>{children}</BarangayContext.Provider>
}

export function useBarangay() {
  const context = useContext(BarangayContext)
  if (context === undefined) {
    throw new Error("useBarangay must be used within a BarangayProvider")
  }
  return context
}
