import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  userName?: string
  subtitle?: string
  onRefresh?: () => void
  onLogout?: () => void
}

export function Header({ userName, subtitle, onRefresh, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10 shrink-0 h-[73px] flex items-center px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {userName} {subtitle && `- ${subtitle}`}
        </span>
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
