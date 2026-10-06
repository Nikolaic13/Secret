"use client"

import React from "react"
import { useBarangay } from "./context"
import { Users, Package, AlertTriangle, HeartHandshake, Flame, Boxes, RotateCw, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarItem } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

import { MobileNavProvider } from "@/components/layout/sidebar-context"

export function BarangayLayoutClient({ children }: { children: React.ReactNode }) {
  const { profile, loading, fetchError, fetchAllData, handleLogout } = useBarangay()

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border shadow-xs max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Landmark className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Barangay Portal</h3>
          <p className="text-sm text-muted-foreground">Loading barangay records and aid requests...</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 rounded-2xl bg-card border border-destructive/20 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Dashboard Error</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{fetchError}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 px-4 font-medium"
          >
            <RotateCw className="h-3.5 w-3.5 mr-2" />
            Reload Portal
          </Button>
        </div>
      </div>
    )
  }

  const sidebarItems: SidebarItem[] = [
    {
      id: "demographics",
      label: "Demographics",
      icon: <Users className="h-4 w-4" />,
      href: "/dashboard/barangay/demographics",
    },
    {
      id: "beneficiaries",
      label: "Beneficiaries & Urgent",
      icon: <Flame className="h-4 w-4" />,
      href: "/dashboard/barangay/beneficiaries",
    },
    {
      id: "inventory",
      label: "Food & Pack Inventory",
      icon: <Boxes className="h-4 w-4" />,
      href: "/dashboard/barangay/inventory",
    },
    {
      id: "distribution",
      label: "Aid Distribution",
      icon: <HeartHandshake className="h-4 w-4" />,
      href: "/dashboard/barangay/distribution",
    },
    {
      id: "requests",
      label: "Food Requests",
      icon: <Package className="h-4 w-4" />,
      href: "/dashboard/barangay/requests",
    },
    {
      id: "history",
      label: "Request Tracker",
      icon: <AlertTriangle className="h-4 w-4" />,
      href: "/dashboard/barangay/history",
    },
  ]

  return (
    <MobileNavProvider>
      <div className="h-screen bg-muted/20 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar items={sidebarItems} title="Barangay Portal" collapsible={true} />

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky Header */}
          <Header
            userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            subtitle={profile?.barangay ? `Brgy. ${profile.barangay}` : "Barangay Official"}
            onRefresh={fetchAllData}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="container mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </MobileNavProvider>
  )
}
