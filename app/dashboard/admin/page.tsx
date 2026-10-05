"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  UserCheck,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  UserX,
  Filter,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Sidebar, SidebarItem } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

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
      console.error("[FoodShare] Error parsing admin session:", error)
      router.push("/auth/admin/login")
    }
  }

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      // Fetch pending profiles
      const { data: pendingData, error: pendingError } = await supabase
        .from("profiles")
        .select("*")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false })

      if (pendingError) {
        console.error("[FoodShare] Error fetching pending profiles:", pendingError)
        toast.error("Failed to fetch pending profiles")
      } else {
        setPendingProfiles(pendingData || [])
      }

      // Fetch all profiles
      const { data: allData, error: allError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (allError) {
        console.error("[FoodShare] Error fetching all profiles:", allError)
        toast.error("Failed to fetch all profiles")
      } else {
        setAllProfiles(allData || [])
      }
    } catch (error) {
      console.error("[FoodShare] Exception while fetching profiles:", error)
      toast.error("An unexpected error occurred while loading data")
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (profileId: string, action: "approved" | "rejected") => {
    setActionLoadingId(profileId)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: action })
        .eq("id", profileId)

      if (error) {
        console.error("[FoodShare] Error updating profile:", error)
        toast.error(`Failed to ${action === "approved" ? "approve" : "reject"} user account`)
        return
      }

      toast.success(
        `User account ${action === "approved" ? "approved" : "rejected"} successfully!`
      )
      fetchProfiles()
    } catch (error) {
      console.error("[FoodShare] Exception during approval:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    toast.info("Logged out successfully")
    router.push("/")
  }

  const stats = useMemo(
    () => ({
      pending: pendingProfiles.length,
      approved: allProfiles.filter((p) => p.approval_status === "approved").length,
      rejected: allProfiles.filter((p) => p.approval_status === "rejected").length,
      total: allProfiles.length,
    }),
    [pendingProfiles, allProfiles]
  )

  const adminSidebarItems: SidebarItem[] = [
    {
      id: "pending",
      label: "Pending Approvals",
      icon: <Clock className="h-4 w-4" />,
      onClick: () => setActiveTab("pending"),
      isActive: activeTab === "pending",
      badge: stats.pending > 0 ? stats.pending : undefined,
    },
    {
      id: "all",
      label: "All User Accounts",
      icon: <Users className="h-4 w-4" />,
      onClick: () => setActiveTab("all"),
      isActive: activeTab === "all",
      badge: stats.total,
    },
  ]

  // Filter profiles
  const displayedProfiles = useMemo(() => {
    const list = activeTab === "pending" ? pendingProfiles : allProfiles
    return list.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.barangay && user.barangay.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesRole = roleFilter === "all" || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [activeTab, pendingProfiles, allProfiles, searchQuery, roleFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5" />
            Rejected
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Pending Review
          </Badge>
        )
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "municipal":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium">
            Municipal MSWDO
          </Badge>
        )
      case "barangay":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-medium">
            Barangay Official
          </Badge>
        )
      case "donor":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
            Food Donor
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-medium">
            Super Admin
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-medium">
            {role}
          </Badge>
        )
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border shadow-sm max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Authenticating</h3>
          <p className="text-sm text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-muted/20 flex overflow-hidden">
      {/* Shared Unified Sidebar */}
      <Sidebar items={adminSidebarItems} title="Admin Portal" collapsible={true} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Shared Unified Header */}
        <Header
          userName={profile.username}
          subtitle="Super Admin"
          onRefresh={fetchProfiles}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Super Admin Oversight
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage representative registrations, verify community accounts, and audit platform security.
                </p>
              </div>

              {stats.pending > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold self-start md:self-auto">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  <span>{stats.pending} approval requests require attention</span>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pending Card */}
              <Card className="rounded-2xl border-border/60 shadow-xs hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {loading ? <Skeleton className="h-8 w-12" /> : stats.pending}
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Approved Card */}
              <Card className="rounded-2xl border-border/60 shadow-xs hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Approved Accounts</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {loading ? <Skeleton className="h-8 w-12" /> : stats.approved}
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Rejected Card */}
              <Card className="rounded-2xl border-border/60 shadow-xs hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Rejected Accounts</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      {loading ? <Skeleton className="h-8 w-12" /> : stats.rejected}
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <UserX className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Card */}
              <Card className="rounded-2xl border-border/60 shadow-xs hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total Registered</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter and Tab Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-2xl border border-border/60 shadow-xs">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("pending")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "pending"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pending Review ({stats.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "all"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Users ({stats.total})
                </button>
              </div>

              {/* Search & Role Filter */}
              <div className="flex flex-1 sm:max-w-md items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, barangay..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-background border-border/60"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-background border border-border/60 px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Roles</option>
                  <option value="donor">Donor</option>
                  <option value="barangay">Barangay</option>
                  <option value="municipal">Municipal</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* User List Content */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="rounded-2xl border-border/60 p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : displayedProfiles.length === 0 ? (
              <Card className="rounded-2xl border-border/60 border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    {activeTab === "pending" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {activeTab === "pending"
                      ? "All caught up!"
                      : "No user accounts match your search"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {activeTab === "pending"
                      ? "There are currently no representative or user accounts awaiting approval."
                      : "Try adjusting your search criteria or resetting filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {displayedProfiles.map((user) => {
                  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
                  const isActing = actionLoadingId === user.id

                  return (
                    <Card
                      key={user.id}
                      className="rounded-2xl border-border/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* User info */}
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 rounded-2xl border border-border shadow-xs shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold text-foreground">
                                  {user.first_name} {user.last_name}
                                </h3>
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.approval_status)}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                  <span className="truncate">{user.email}</span>
                                </div>

                                {user.phone && (
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}

                                {user.barangay && (
                                  <div className="flex items-center gap-1.5">
                                    <Building className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                    <span>Brgy. {user.barangay}</span>
                                  </div>
                                )}

                                {user.address && (
                                  <div className="flex items-center gap-1.5 sm:col-span-2">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                    <span className="truncate">{user.address}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                  <span>
                                    Registered: {new Date(user.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0">
                            {user.approval_status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(user.id, "approved")}
                                  disabled={isActing}
                                  className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproval(user.id, "rejected")}
                                  disabled={isActing}
                                  className="h-9 px-3 rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Reject
                                </Button>
                              </>
                            ) : user.approval_status === "rejected" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproval(user.id, "approved")}
                                disabled={isActing}
                                className="h-8 px-2.5 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Re-approve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproval(user.id, "rejected")}
                                disabled={isActing}
                                className="h-8 px-2.5 rounded-xl text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              >
                                Revoke Access
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
