import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  userName?: string
  subtitle?: string
  onRefresh?: () => void
  onLogout?: () => void
  notificationsCount?: number
  onToggleNotifications?: () => void
}

export function Header({
  userName,
  subtitle,
  onRefresh,
  onLogout,
  notificationsCount,
  onToggleNotifications,
}: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10 shrink-0 h-[73px] flex items-center px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {userName} {subtitle && `- ${subtitle}`}
        </span>
        {onToggleNotifications && (
          <Button variant="outline" size="sm" onClick={onToggleNotifications} className="relative text-xs">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
            {notificationsCount !== undefined && notificationsCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {notificationsCount}
              </span>
            )}
          </Button>
        )}
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <Bell className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        {onLogout && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </header>
  )
}
