"use client"

import React from "react"
import { useBarangay } from "./context"
import { Heart, Bell, LogOut, Users, Package, AlertTriangle, HeartHandshake, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"

import { Header } from "@/components/layout/header"

export function BarangayLayoutClient({ children }: { children: React.ReactNode }) {
  const { profile, loading, fetchError, fetchAllData, handleLogout } = useBarangay()

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

  const sidebarItems = [
    {
      id: "demographics",
      label: "Demographics",
      icon: <Users className="h-4 w-4" />,
      href: "/dashboard/barangay/demographics",
    },
    {
      id: "beneficiaries",
      label: "Beneficiaries & Urgent",
      icon: <Flame className="h-4 w-4 text-red-400" />,
      href: "/dashboard/barangay/beneficiaries",
    },
    {
      id: "distribution",
      label: "Aid Distribution",
      icon: <HeartHandshake className="h-4 w-4 text-emerald-400" />,
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar on absolute left */}
      <Sidebar items={sidebarItems} />
      
      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header 
          userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
          subtitle={profile?.barangay}
          onRefresh={fetchAllData}
          onLogout={handleLogout}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
