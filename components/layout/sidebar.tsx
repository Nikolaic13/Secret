"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, ChevronLeft, ChevronRight, Menu } from "lucide-react"

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
  collapsible?: boolean
}

export function Sidebar({ items, title, className, collapsible = true }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "border-r border-gray-800 bg-gray-900 text-gray-100 flex flex-col gap-2 shrink-0 transition-all duration-300 relative",
        collapsed ? "w-18 p-2" : "w-64 p-4",
        className
      )}
    >
      {/* Header and Toggle */}
      <div className="flex items-center justify-between px-1 py-3 mb-2 border-b border-gray-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <Heart className="h-5 w-5 text-green-500 shrink-0" />
          {!collapsed && (
            <h1 className="text-sm font-bold text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              FoodShare Janiuay
            </h1>
          )}
        </div>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800 shrink-0"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {title && !collapsed && (
        <h2 className="text-[11px] font-semibold mb-1 px-2 text-gray-400 uppercase tracking-wider">
          {title}
        </h2>
      )}

      {/* Navigation items */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            item.isActive !== undefined
              ? item.isActive
              : item.href
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : false

          const buttonContent = (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full text-gray-300 hover:text-white hover:bg-gray-800 transition-colors",
                collapsed ? "justify-center px-0 h-10" : "justify-start text-xs",
                isActive && "bg-gray-800 text-white font-medium"
              )}
              onClick={item.onClick}
              title={collapsed ? item.label : undefined}
            >
              {item.icon && <span className={cn(collapsed ? "" : "mr-2")}>{item.icon}</span>}
              {!collapsed && <span>{item.label}</span>}
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
