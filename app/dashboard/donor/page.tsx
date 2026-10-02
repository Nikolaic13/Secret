"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Heart,
  Plus,
  Package,
  LogOut,
  User,
  Timer,
  AlertTriangle,
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Trash2,
  Bell,
  XIcon,
  Flame,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import {
  getFoodItemUrgency,
  formatExpiryDisplay,
  ExpiryType,
} from "@/lib/distribution-service"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  barangay: string
}

interface FoodItem {
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
  created_at: string
  rejection_reason?: string
  rejected_at?: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  related_item_id: string
  is_read: boolean
  created_at: string
}

export default function DonorDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(true)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [showPostConfirmation, setShowPostConfirmation] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null)
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
  })
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false) // Declare loading variable

  // Municipal Hall address (can be made configurable)
  const MUNICIPAL_HALL_ADDRESS = "Municipal Hall, Janiuay, Iloilo, Philippines"

  useEffect(() => {
    checkUser()
    fetchFoodItems()
    fetchNotifications()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    setProfile(profileData)
    setLoading(false)
  }

  const fetchFoodItems = async () => {
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
  }

  const fetchNotifications = async () => {
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
  }

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)
    fetchNotifications()
  }

  const deleteNotification = async (notificationId: string) => {
    await supabase.from("notifications").delete().eq("id", notificationId)
    fetchNotifications()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      quantity: "",
      unit: "",
      expiry_type: "exact",
      expiry_date: "",
      expiry_date_from: "",
      expiry_date_to: "",
      delivery_method: "pickup",
      pickup_address: "",
      pickup_contact: "",
    })
    setEditingItem(null)
  }

  const handleEdit = (item: FoodItem) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      expiry_type: item.expiry_type || "exact",
      expiry_date: item.expiry_date || "",
      expiry_date_from: item.expiry_date_from || "",
      expiry_date_to: item.expiry_date_to || "",
      delivery_method: item.delivery_method || "pickup",
      pickup_address: item.pickup_address || "",
      pickup_contact: item.pickup_contact || "",
    })
    setEditingItem(item)
    setShowDonationForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowPostConfirmation(true)
  }

  const confirmSubmit = async () => {
    setLoading(true)
    setShowPostConfirmation(false)

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

      // Try adding range fields if supported
      try {
        itemData.expiry_type = formData.expiry_type
        if (formData.expiry_type === "range") {
          itemData.expiry_date_from = formData.expiry_date_from
          itemData.expiry_date_to = formData.expiry_date_to
        }
      } catch (e) {
        // ignore
      }

      // Only add delivery-related fields if they're supported (to handle older database schemas)
      try {
        // Test if the delivery_method column exists by doing a simple query
        await supabase.from("food_items").select("delivery_method").limit(1)

        // If no error, add the delivery fields
        itemData.delivery_method = formData.delivery_method
        if (formData.delivery_method === "pickup") {
          itemData.pickup_address = formData.pickup_address
          itemData.pickup_contact = formData.pickup_contact
        } else {
          itemData.pickup_address = null
          itemData.pickup_contact = null
        }
      } catch (columnError) {
        console.warn("Delivery method columns not available, skipping:", columnError)
        // Continue without delivery method fields for backward compatibility
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase.from("food_items").update(itemData).eq("id", editingItem.id)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase.from("food_items").insert({
          donor_id: profile?.id,
          ...itemData,
          status: "available", // Initial status is available, waiting to be claimed
        })

        if (error) throw error
      }

      resetForm()
      setShowDonationForm(false)
      fetchFoodItems()
    } catch (error: any) {
      console.error("Error saving food item:", error)
      alert(`Failed to save food item: ${error.message}. Please make sure the database is properly set up.`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    setDeleteLoading(itemId)
    try {
      const { error } = await supabase.from("food_items").delete().eq("id", itemId)

      if (error) throw error

      fetchFoodItems()
      setShowDeleteConfirmation(null)
    } catch (error) {
      console.error("Error deleting food item:", error)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCancel = () => {
    resetForm()
    setShowDonationForm(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const canEditOrDelete = (status: string) => {
    return status === "available"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "waiting_pickup":
        return "bg-yellow-100 text-yellow-800"
      case "ready_distribution":
        return "bg-blue-100 text-blue-800"
      case "distributed":
        return "bg-purple-100 text-purple-800"
      case "claimed": // Legacy status
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Package className="h-4 w-4" />
      case "waiting_pickup":
        return <Timer className="h-4 w-4" />
      case "ready_distribution":
        return <Truck className="h-4 w-4" />
      case "distributed":
        return <CheckCircle2 className="h-4 w-4" />
      case "claimed": // Legacy status
        return <Timer className="h-4 w-4" />
      case "rejected":
        return <XIcon className="h-4 w-4" />
      case "expired":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "available":
        return "Your donation is available and waiting to be claimed by municipal representatives."
      case "waiting_pickup":
        return "Your donation has been claimed and is waiting for pickup/drop-off."
      case "ready_distribution":
        return "Your donation has been collected and is ready for distribution to families."
      case "distributed":
        return "Your donation has been successfully distributed to families in need."
      case "claimed": // Legacy status
        return "Your donation has been claimed and is being processed."
      case "rejected":
        return "Your donation was rejected by municipal representatives. Please review the reason below."
      case "expired":
        return "This donation has expired and is no longer available."
      default:
        return ""
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

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
            <Button variant="outline" onClick={() => setShowNotifications(!showNotifications)} className="relative">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            {profile && (
              <span className="text-sm text-gray-600">
                Welcome, {profile.first_name} {profile.last_name}!
              </span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showNotifications && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Stay updated on your food donations</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{notification.title}</p>
                            {notification.type === "rejection" && (
                              <Badge variant="destructive" className="text-xs">
                                Rejected
                              </Badge>
                            )}
                            {!notification.is_read && <Badge className="bg-blue-500 text-xs">New</Badge>}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <Button size="sm" variant="ghost" onClick={() => markNotificationAsRead(notification.id)}>
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Guidelines Section */}
        {showGuidelines && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-800">Food Donation Guidelines</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGuidelines(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </Button>
              </div>
              <CardDescription className="text-green-700">
                Follow these guidelines to ensure safe and effective food donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Food Safety Requirements
                  </h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Only donate food that is still safe to consume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Check expiry dates - food should have at least 1-2 days before expiration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Ensure proper storage conditions (refrigerated items must remain cold)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Do not donate opened or partially consumed items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Avoid donating homemade food unless properly packaged</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Donation Process & Delivery Options
                  </h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Choose between pickup (we collect from you) or drop-off (you bring to Municipal Hall)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Municipal representatives will review and claim your donation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>You can edit or cancel donations until they are claimed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>For pickup: Provide accurate address and contact information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Food will be distributed to families in need through barangay representatives</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Alert className="bg-green-100 border-green-300">
                <User className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Best Practices:</strong> Include clear descriptions (optional), accurate quantities, and
                  realistic expiry dates. The more detailed your listing, the better we can match it with families in
                  need.
                </AlertDescription>
              </Alert>

              <Alert className="bg-yellow-50 border-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Important:</strong> By donating food, you confirm that it meets safety standards and is
                  suitable for consumption. FoodShare Janiuay and its representatives are not liable for food quality
                  issues.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posted</p>
                  <p className="text-2xl font-bold">{foodItems.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {foodItems.filter((item) => item.status === "available").length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Process</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      foodItems.filter((item) =>
                        ["waiting_pickup", "ready_distribution", "claimed"].includes(item.status),
                      ).length
                    }
                  </p>
                </div>
                <Timer className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Distributed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {foodItems.filter((item) => item.status === "distributed").length}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-between items-center">
          <Button onClick={() => setShowDonationForm(!showDonationForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {editingItem ? "Cancel Edit" : "Post Surplus Food"}
          </Button>
          {!showGuidelines && (
            <Button
              variant="outline"
              onClick={() => setShowGuidelines(true)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <User className="h-4 w-4 mr-2" />
              Show Guidelines
            </Button>
          )}
        </div>

        {/* Food Posting Form */}
        {showDonationForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingItem ? "Edit Food Donation" : "Post Surplus Food"}</CardTitle>
              <CardDescription>
                {editingItem
                  ? "Update the details of your food donation"
                  : "Share details about your surplus food to help the community"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Food Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Fresh Vegetables, Canned Goods"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      value={formData.category}
                      required
                    >
                      <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the food items, condition, storage requirements, and any special notes (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      value={formData.unit}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="pcs">Pieces</SelectItem>
                        <SelectItem value="packs">Packs</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Expiration Type & Details */}
                  <div className="space-y-2 col-span-2 p-3 bg-gray-50 border rounded-lg">
                    <Label className="text-xs font-semibold text-gray-800 flex items-center justify-between">
                      <span>Expiration Date Details *</span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        Supports exact dates or mixed batch ranges
                      </span>
                    </Label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, expiry_type: "exact" })}
                        className={`text-xs py-1.5 px-2 rounded border font-medium ${
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
                        className={`text-xs py-1.5 px-2 rounded border font-medium ${
                          formData.expiry_type === "range"
                            ? "bg-white border-green-600 text-green-800 shadow-sm font-bold"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        Date Range (Batch)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, expiry_type: "non_perishable" })}
                        className={`text-xs py-1.5 px-2 rounded border font-medium ${
                          formData.expiry_type === "non_perishable"
                            ? "bg-white border-green-600 text-green-800 shadow-sm font-bold"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        Non-Perishable
                      </button>
                    </div>

                    {formData.expiry_type === "exact" && (
                      <div className="pt-2">
                        <Label htmlFor="expiry_date" className="text-xs text-gray-700">
                          Expiry Date *
                        </Label>
                        <Input
                          id="expiry_date"
                          type="date"
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                          required
                          className="bg-white mt-1"
                        />
                      </div>
                    )}

                    {formData.expiry_type === "range" && (
                      <div className="pt-2 space-y-1">
                        <p className="text-[11px] text-gray-500">
                          For donations with mixed expiration dates (e.g. assorted canned goods or biscuits):
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="range_from" className="text-[11px] text-gray-600">
                              Earliest Expiry (From) *
                            </Label>
                            <Input
                              id="range_from"
                              type="date"
                              value={formData.expiry_date_from}
                              onChange={(e) => setFormData({ ...formData, expiry_date_from: e.target.value })}
                              required
                              className="bg-white mt-1 text-xs"
                            />
                          </div>
                          <div>
                            <Label htmlFor="range_to" className="text-[11px] text-gray-600">
                              Latest Expiry (To) *
                            </Label>
                            <Input
                              id="range_to"
                              type="date"
                              value={formData.expiry_date_to}
                              onChange={(e) => setFormData({ ...formData, expiry_date_to: e.target.value })}
                              required
                              className="bg-white mt-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.expiry_type === "non_perishable" && (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded mt-2">
                        Items like salt, sugar, vinegar, or honey do not spoil quickly. They will be marked as non-perishable.
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Method Selection */}
                <div className="space-y-4">
                  <Label>Delivery Method *</Label>
                  <RadioGroup
                    value={formData.delivery_method}
                    onValueChange={(value) => setFormData({ ...formData, delivery_method: value })}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Pickup - We will collect the food from your location
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dropoff" id="dropoff" />
                      <Label htmlFor="dropoff" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Drop-off - You will bring the food to Municipal Hall
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.delivery_method === "pickup" && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="space-y-2">
                        <Label htmlFor="pickup_address">Pickup Address *</Label>
                        <Textarea
                          id="pickup_address"
                          placeholder="Enter your complete address for pickup"
                          value={formData.pickup_address}
                          onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                          required={formData.delivery_method === "pickup"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_contact">Contact Number *</Label>
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
                  )}

                  {formData.delivery_method === "dropoff" && (
                    <Alert className="bg-green-50 border-green-200">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Drop-off Location:</strong> {MUNICIPAL_HALL_ADDRESS}
                        <br />
                        <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <User className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Tip:</strong> Be as detailed as possible in your description (optional). Include information
                    about storage conditions, packaging, and any special handling requirements.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {editingItem ? "Update Food Item" : "Post Food Item"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog for Posting */}
        <Dialog open={showPostConfirmation} onOpenChange={setShowPostConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Food Donation</DialogTitle>
              <DialogDescription>
                Are you sure you want to {editingItem ? "update" : "post"} this food donation?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">{formData.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Category:</strong> {formData.category} | <strong>Quantity:</strong> {formData.quantity}{" "}
                  {formData.unit}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Expiration:</strong>{" "}
                  {formatExpiryDisplay({
                    expiry_type: formData.expiry_type,
                    expiry_date: formData.expiry_date,
                    expiry_date_from: formData.expiry_date_from,
                    expiry_date_to: formData.expiry_date_to,
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Delivery:</strong> {formData.delivery_method === "pickup" ? "Pickup" : "Drop-off"}
                  {formData.delivery_method === "pickup" && formData.pickup_address && (
                    <span> from {formData.pickup_address}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPostConfirmation(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSubmit} disabled={loading}>
                  {loading ? "Processing..." : editingItem ? "Update Donation" : "Post Donation"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Food Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Food Donations</CardTitle>
            <CardDescription>Track the status of your posted food items</CardDescription>
          </CardHeader>
          <CardContent>
            {foodItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No food items posted yet</p>
                <p className="text-sm text-gray-400">Start sharing your surplus food with the community</p>
              </div>
            ) : (
              <div className="space-y-4">
                {foodItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {item.status.replace("_", " ")}
                            </div>
                          </Badge>
                          {item.delivery_method && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {item.delivery_method === "pickup" ? (
                                <Truck className="h-3 w-3" />
                              ) : (
                                <MapPin className="h-3 w-3" />
                              )}
                              {item.delivery_method}
                            </Badge>
                          )}
                        </div>
                        {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                        <p className="text-xs text-gray-500 mb-2">{getStatusDescription(item.status)}</p>
                      </div>

                      {/* Action Buttons */}
                      {canEditOrDelete(item.status) && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <User className="h-4 w-4 mr-1" />
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirmation(item.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Category:</span> {item.category}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium">Expiration:</span>
                        <span>
                          {formatExpiryDisplay({
                            expiry_type: item.expiry_type || "exact",
                            expiry_date: item.expiry_date,
                            expiry_date_from: item.expiry_date_from,
                            expiry_date_to: item.expiry_date_to,
                          })}
                        </span>
                        {(() => {
                          const urgency = getFoodItemUrgency({
                            expiry_type: item.expiry_type || "exact",
                            expiry_date: item.expiry_date,
                            expiry_date_from: item.expiry_date_from,
                            expiry_date_to: item.expiry_date_to,
                          })
                          return (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${urgency.badgeClass}`}
                            >
                              {urgency.level === "critical" && <Flame className="h-3 w-3 inline mr-0.5" />}
                              {urgency.label}
                            </span>
                          )
                        })()}
                      </div>
                      <div>
                        <span className="font-medium">Posted:</span> {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    {item.delivery_method === "pickup" && item.pickup_address && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
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
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-green-800">Drop-off Location:</p>
                            <p className="text-green-700">{MUNICIPAL_HALL_ADDRESS}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.status === "rejected" && item.rejection_reason && (
                      <Alert className="mt-3 bg-red-50 border-red-300">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Rejection Reason:</strong> {item.rejection_reason}
                          <br />
                          <span className="text-sm text-red-600">
                            Rejected on {new Date(item.rejected_at || "").toLocaleString()}
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}

                    {!canEditOrDelete(item.status) && item.status !== "rejected" && (
                      <Alert className="mt-3 bg-gray-50 border-gray-200">
                        <User className="h-4 w-4 text-gray-600" />
                        <AlertDescription className="text-gray-700">
                          This donation cannot be edited or deleted because it has been{" "}
                          {item.status === "waiting_pickup"
                            ? "claimed and is waiting for pickup/drop-off"
                            : item.status === "ready_distribution"
                              ? "collected and is ready for distribution"
                              : item.status === "distributed"
                                ? "distributed to families"
                                : item.status === "claimed"
                                  ? "claimed by municipal representatives"
                                  : "processed"}
                          .
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteConfirmation} onOpenChange={() => setShowDeleteConfirmation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Food Donation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this food donation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirmation(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => showDeleteConfirmation && handleDelete(showDeleteConfirmation)}
                disabled={!!deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
