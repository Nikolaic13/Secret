"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Package, TrendingUp, LogOut, User, CheckCircle, XCircle, Clock, Users, UserCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  role: string
  barangay: string | null
  approval_status: string
  created_at: string
}

interface AdminProfile {
  id: string
  username: string
  email: string
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAuth()
    fetchProfiles()
  }, [])

  const checkAdminAuth = () => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/auth/admin/login")
      return
    }

    try {
      const parsedSession = JSON.parse(session)
      setProfile(parsedSession)
    } catch (error) {
      console.error("[v0] Error parsing admin session:", error)
      router.push("/auth/admin/login")
    }
  }

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      console.log("[v0] Fetching profiles from database...")

      // Fetch pending profiles
      const { data: pendingData, error: pendingError } = await supabase
        .from("profiles")
        .select("*")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false })

      if (pendingError) {
        console.error("[v0] Error fetching pending profiles:", pendingError)
      } else {
        console.log(`[v0] Fetched ${pendingData?.length || 0} pending profiles`)
        setPendingProfiles(pendingData || [])
      }

      // Fetch all profiles
      const { data: allData, error: allError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (allError) {
        console.error("[v0] Error fetching all profiles:", allError)
      } else {
        console.log(`[v0] Fetched ${allData?.length || 0} total profiles`)
        setAllProfiles(allData || [])
      }
    } catch (error) {
      console.error("[v0] Exception while fetching profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (profileId: string, action: "approved" | "rejected") => {
    try {
      console.log(`[v0] ${action === "approved" ? "Approving" : "Rejecting"} profile ${profileId}`)

      const { error } = await supabase.from("profiles").update({ approval_status: action }).eq("id", profileId)

      if (error) {
        console.error("[v0] Error updating profile:", error)
        alert(`Failed to ${action === "approved" ? "approve" : "reject"} user`)
        return
      }

      console.log(`[v0] Successfully ${action} profile`)
      alert(`User ${action} successfully!`)
      fetchProfiles() // Refresh the list
    } catch (error) {
      console.error("[v0] Exception during approval:", error)
      alert("An error occurred")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "municipal":
        return "bg-blue-100 text-blue-800"
      case "barangay":
        return "bg-purple-100 text-purple-800"
      case "donor":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    pending: pendingProfiles.length,
    approved: allProfiles.filter((p) => p.approval_status === "approved").length,
    rejected: allProfiles.filter((p) => p.approval_status === "rejected").length,
    total: allProfiles.length,
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Checking admin authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-red-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-red-800">FoodShare Janiuay</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfiles}
              disabled={loading}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <TrendingUp className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <span className="text-sm text-gray-600">Super Admin: {profile.username}</span>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h2>
          <p className="text-gray-600">Manage representative account approvals and system oversight</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
            className={activeTab === "pending" ? "bg-red-600" : ""}
          >
            Pending Approvals ({stats.pending})
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className={activeTab === "all" ? "bg-red-600" : ""}
          >
            All Users ({stats.total})
          </Button>
        </div>

        {/* User List */}
        {loading ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "pending" && pendingProfiles.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </CardContent>
              </Card>
            )}

            {activeTab === "all" && allProfiles.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </CardContent>
              </Card>
            )}

            {(activeTab === "pending" ? pendingProfiles : allProfiles).map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(user.approval_status)}>
                          {user.approval_status.charAt(0).toUpperCase() + user.approval_status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {user.email}
                        </div>
                        {user.phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {user.phone}
                          </div>
                        )}
                        {user.barangay && (
                          <div>
                            <span className="font-medium">Barangay:</span> {user.barangay}
                          </div>
                        )}
                        {user.address && (
                          <div>
                            <span className="font-medium">Address:</span> {user.address}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Registered:</span>{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {user.approval_status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(user.id, "approved")}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(user.id, "rejected")}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
