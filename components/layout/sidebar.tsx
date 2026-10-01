import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  isActive?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  title?: string
  className?: string
}

export function Sidebar({ items, title, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("w-64 border-r border-gray-800 bg-gray-900 text-gray-100 p-4 flex flex-col gap-2 shrink-0", className)}>
      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-gray-800">
        <Heart className="h-5 w-5 text-green-500 shrink-0" />
        <h1 className="text-md font-bold text-white tracking-tight whitespace-nowrap">FoodShare Janiuay</h1>
      </div>
      {title && <h2 className="text-sm font-semibold mb-2 px-2 text-gray-400 uppercase tracking-wider">{title}</h2>}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          // Determine if active via explicitly passed prop, or by matching pathname to href
          const isActive = item.isActive !== undefined 
            ? item.isActive 
            : (item.href ? (pathname === item.href || pathname.startsWith(`${item.href}/`)) : false)
          
          const buttonContent = (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800",
                isActive && "bg-gray-800 text-white font-medium"
              )}
              onClick={item.onClick}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Button>
          )
          
          if (item.href) {
            return (
              <Link key={item.id} href={item.href} passHref>
                {buttonContent}
              </Link>
            )
          }

          return <div key={item.id}>{buttonContent}</div>
        })}
      </nav>
    </div>
  )
}
