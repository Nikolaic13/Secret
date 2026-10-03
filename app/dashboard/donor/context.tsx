"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ExpiryType } from "@/lib/distribution-service"
import { getTransactionLogs, TransactionLogEntry } from "@/lib/transaction-service"

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  barangay: string
}

export interface FoodItem {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  expiry_date: string
  expiry_type?: ExpiryType
  expiry_date_from?: string
  expiry_date_to?: string
  status: string
  delivery_method?: string
  pickup_address?: string
  pickup_contact?: string
  pickup_latitude?: number
  pickup_longitude?: number
  created_at: string
  rejection_reason?: string
  rejected_at?: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  related_item_id: string
  is_read: boolean
  created_at: string
}

interface DonorContextType {
  profile: Profile | null
  foodItems: FoodItem[]
  notifications: Notification[]
  transactionLogs: TransactionLogEntry[]
  loading: boolean
  dataLoading: boolean
  showNotifications: boolean
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>
  fetchFoodItems: () => Promise<void>
  fetchNotifications: () => Promise<void>
  fetchLogs: () => Promise<void>
  fetchAllData: () => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  handleDeleteFoodItem: (itemId: string) => Promise<boolean>
  handleLogout: () => Promise<void>
}

const DonorContext = createContext<DonorContextType | undefined>(undefined)

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [transactionLogs, setTransactionLogs] = useState<TransactionLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const logs = await getTransactionLogs({ actor_id: user.id })
      setTransactionLogs(logs)
    } catch (err) {
      console.error("Error fetching logs:", err)
    }
  }, [supabase])

  const fetchFoodItems = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("food_items")
        .select("*")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setFoodItems(data)
      }
    } catch (err) {
      console.error("Error fetching food items:", err)
    }
  }, [supabase])

  const fetchNotifications = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data)
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
    }
  }, [supabase])

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(profileData)
    } catch (err) {
      console.error("Error checking user:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  const fetchAllData = useCallback(async () => {
    setDataLoading(true)
    await Promise.all([fetchFoodItems(), fetchNotifications(), fetchLogs()])
    setDataLoading(false)
  }, [fetchFoodItems, fetchNotifications, fetchLogs])

  useEffect(() => {
    checkUser()
    fetchAllData()
  }, [checkUser, fetchAllData])

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)
    fetchNotifications()
  }

  const deleteNotification = async (notificationId: string) => {
    await supabase.from("notifications").delete().eq("id", notificationId)
    fetchNotifications()
  }

  const handleDeleteFoodItem = async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("food_items").delete().eq("id", itemId)
      if (error) throw error
      await fetchFoodItems()
      return true
    } catch (error) {
      console.error("Error deleting food item:", error)
      return false
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <DonorContext.Provider
      value={{
        profile,
        foodItems,
        notifications,
        transactionLogs,
        loading,
        dataLoading,
        showNotifications,
        setShowNotifications,
        fetchFoodItems,
        fetchNotifications,
        fetchLogs,
        fetchAllData,
        markNotificationAsRead,
        deleteNotification,
        handleDeleteFoodItem,
        handleLogout,
      }}
    >
      {children}
    </DonorContext.Provider>
  )
}

export function useDonor() {
  const context = useContext(DonorContext)
  if (!context) {
    throw new Error("useDonor must be used within a DonorProvider")
  }
  return context
}
