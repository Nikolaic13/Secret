"use client"

import { useState } from "react"
import { Bell, LogOut, RotateCw, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMobileNav } from "./sidebar-context"

interface HeaderProps {
  userName?: string
  subtitle?: string
  onRefresh?: () => void | Promise<void>
  onLogout?: () => void
  notificationsCount?: number
  onToggleNotifications?: () => void
  onMenuClick?: () => void
}

export function Header({
  userName,
  subtitle,
  onRefresh,
  onLogout,
  notificationsCount,
  onToggleNotifications,
  onMenuClick,
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toggleMobile } = useMobileNav()

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick()
    } else {
      toggleMobile()
    }
  }

  // Generate initials from user name
  const initials = userName
    ? userName
        .trim()
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-all">
      {/* Left side: Mobile Hamburger + Context badge */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial mr-2 sm:mr-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMenuClick}
          className="md:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {subtitle && (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 whitespace-nowrap sm:whitespace-normal"
          >
            {subtitle}
          </Badge>
        )}
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RotateCw
              className={`h-4 w-4 sm:mr-1.5 transition-transform ${
                isRefreshing ? "animate-spin text-emerald-600" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        {onToggleNotifications && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleNotifications}
            className="relative h-8 sm:h-9 px-2 sm:px-3 text-xs rounded-lg border-border/80 hover:bg-accent/60 transition-colors"
          >
            <Bell className="h-4 w-4 sm:mr-1.5 text-muted-foreground" />
            <span className="hidden sm:inline">Notifications</span>
            {notificationsCount !== undefined && notificationsCount > 0 && (
              <span className="ml-1 sm:ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {notificationsCount}
              </span>
            )}
          </Button>
        )}

        <div className="h-4 w-px bg-border/80 mx-0.5 sm:mx-1 hidden xs:block" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-0.5 sm:pl-1">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-border shadow-xs bg-muted">
            <AvatarFallback className="text-[11px] sm:text-xs font-bold bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          {userName && (
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[140px]">
                {userName}
              </span>
            </div>
          )}
        </div>

        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="h-8 sm:h-9 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-0.5"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}
      </div>
    </header>
  )
}
