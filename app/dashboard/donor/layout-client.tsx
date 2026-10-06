"use client"

import React from "react"
import { useDonor } from "./context"
import { Sidebar, SidebarItem } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Package, Plus, History, AlertTriangle, Bell, Trash2, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { MobileNavProvider } from "@/components/layout/sidebar-context"

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
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border shadow-xs max-w-sm w-full mx-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Donor Portal</h3>
          <p className="text-sm text-muted-foreground">Loading your donations and requests...</p>
        </div>
      </div>
    )
  }

  return (
    <MobileNavProvider>
      <div className="h-screen bg-muted/20 flex overflow-hidden">
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

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="container mx-auto max-w-6xl">
            {/* Notifications Dropdown / Card */}
            {showNotifications && (
              <Card className="mb-6 rounded-2xl border-border/80 shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/40">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                      <Bell className="h-4 w-4 text-emerald-600" />
                      Notifications & Updates
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Stay updated on the status and pickup of your food donations
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                        <Bell className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium text-foreground">All caught up!</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        No new notifications at this time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-xl border text-xs transition-colors ${
                            notification.is_read
                              ? "bg-card border-border/50 text-muted-foreground"
                              : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-foreground"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {notification.title}
                                </span>
                                {notification.type === "rejection" && (
                                  <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">
                                    Rejected
                                  </Badge>
                                )}
                                {!notification.is_read && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 h-4 font-bold">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!notification.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="h-7 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg px-2"
                                >
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                title="Delete Notification"
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
    </MobileNavProvider>
  )
}
