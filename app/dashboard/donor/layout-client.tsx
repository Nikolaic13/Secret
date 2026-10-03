"use client"

import React from "react"
import { useDonor } from "./context"
import { Sidebar, SidebarItem } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Package, Plus, History, AlertTriangle, Bell, Trash2, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function DonorLayoutClient({ children }: { children: React.ReactNode }) {
  const {
    profile,
    loading,
    notifications,
    showNotifications,
    setShowNotifications,
    markNotificationAsRead,
    deleteNotification,
    fetchAllData,
    handleLogout,
  } = useDonor()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const donorSidebarItems: SidebarItem[] = [
    {
      id: "donations",
      label: "My Donations",
      icon: <Package className="h-4 w-4" />,
      href: "/dashboard/donor/donations",
    },
    {
      id: "new_post",
      label: "Post Donation",
      icon: <Plus className="h-4 w-4" />,
      href: "/dashboard/donor/new",
    },
    {
      id: "transactions",
      label: "Transaction Audit",
      icon: <History className="h-4 w-4" />,
      href: "/dashboard/donor/transactions",
    },
    {
      id: "guidelines",
      label: "Safety Guidelines",
      icon: <AlertTriangle className="h-4 w-4" />,
      href: "/dashboard/donor/guidelines",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading donor portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar items={donorSidebarItems} title="Donor Portal" collapsible={true} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
          subtitle="Food Donor"
          notificationsCount={unreadCount}
          onToggleNotifications={() => setShowNotifications((prev) => !prev)}
          onRefresh={fetchAllData}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-6xl">
            {/* Notifications Dropdown / Card */}
            {showNotifications && (
              <Card className="mb-6 border-blue-200 shadow-md">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Stay updated on the status of your food donations</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3.5 rounded-lg border text-sm transition-colors ${
                            notification.is_read ? "bg-gray-50 border-gray-200" : "bg-blue-50/80 border-blue-200"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{notification.title}</span>
                                {notification.type === "rejection" && (
                                  <Badge variant="destructive" className="text-[10px] py-0">
                                    Rejected
                                  </Badge>
                                )}
                                {!notification.is_read && (
                                  <Badge className="bg-blue-600 text-[10px] py-0">New</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 mb-1.5">{notification.message}</p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!notification.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="h-7 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
