"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMobileNav } from "./sidebar-context"

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  isActive?: boolean
  badge?: string | number
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
  const { openMobile, setOpenMobile } = useMobileNav()

  const renderNavItems = (isMobileView = false) => {
    return items.map((item) => {
      const isActive =
        item.isActive !== undefined
          ? item.isActive
          : item.href
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : false

      const handleClick = () => {
        if (isMobileView) {
          setOpenMobile(false)
        }
        item.onClick?.()
      }

      const content = (
        <Button
          variant="ghost"
          className={cn(
            "w-full transition-all duration-200 text-sm font-medium rounded-xl",
            !isMobileView && collapsed
              ? "justify-center px-0 h-11"
              : "justify-start px-3 h-10",
            isActive
              ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
          )}
          onClick={handleClick}
        >
          {item.icon && (
            <span
              className={cn(
                "shrink-0 transition-transform duration-200",
                isActive ? "text-emerald-400" : "text-zinc-400",
                !isMobileView && collapsed ? "" : "mr-2.5"
              )}
            >
              {item.icon}
            </span>
          )}
          {(isMobileView || !collapsed) && (
            <span className="truncate flex-1 text-left">{item.label}</span>
          )}
          {(isMobileView || !collapsed) && item.badge !== undefined && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {item.badge}
            </span>
          )}
        </Button>
      )

      const wrappedLink = item.href ? (
        <Link
          key={item.id}
          href={item.href}
          className="w-full"
          onClick={() => {
            if (isMobileView) setOpenMobile(false)
          }}
        >
          {content}
        </Link>
      ) : (
        <div key={item.id} className="w-full">
          {content}
        </div>
      )

      if (!isMobileView && collapsed) {
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>{wrappedLink}</TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-zinc-900 text-zinc-100 border border-zinc-800 text-xs font-medium px-2.5 py-1.5 shadow-xl"
            >
              {item.label}
            </TooltipContent>
          </Tooltip>
        )
      }

      return wrappedLink
    })
  }

  return (
    <>
      {/* Mobile Drawer (Sheet) */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="bg-zinc-950 text-zinc-100 border-zinc-800/80 p-4 w-72 sm:w-80 flex flex-col gap-2 z-50 md:hidden [&>button]:text-zinc-400 [&>button]:hover:text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{title || "Navigation Menu"}</SheetTitle>
          </SheetHeader>

          {/* Mobile Header Branding */}
          <div className="flex items-center pb-4 mb-2 border-b border-zinc-800/80 justify-start">
            <Link
              href="/"
              onClick={() => setOpenMobile(false)}
              className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
              title="FoodShare"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Heart className="h-5 w-5 text-white fill-white/20" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                  FoodShare
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
                  Portal
                </span>
              </div>
            </Link>
          </div>

          {title && (
            <div className="px-2 py-1">
              <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {title}
              </h2>
            </div>
          )}

          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden pt-1">
            {renderNavItems(true)}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Persistent Sidebar */}
      <TooltipProvider delayDuration={150}>
        <aside
          className={cn(
            "hidden md:flex border-r border-zinc-800/80 bg-zinc-950 text-zinc-100 flex-col gap-2 shrink-0 transition-all duration-300 relative select-none",
            collapsed ? "w-20 p-3" : "w-64 p-4",
            className
          )}
        >
          {/* Header Branding */}
          <div
            className={cn(
              "flex items-center pb-4 mb-2 border-b border-zinc-800/80",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 overflow-hidden group focus:outline-none",
                collapsed ? "justify-center" : ""
              )}
              title="FoodShare"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Heart className="h-5 w-5 text-white fill-white/20" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                    FoodShare
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
                    Portal
                  </span>
                </div>
              )}
            </Link>
          </div>

          {title && !collapsed && (
            <div className="px-2 py-1">
              <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {title}
              </h2>
            </div>
          )}

          {/* Navigation items */}
          <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden pt-1">
            {renderNavItems(false)}
          </nav>

          {/* Bottom Collapse Toggle */}
          {collapsible && (
            <div className="pt-2 mt-auto border-t border-zinc-800/80">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollapsed(false)}
                      className="w-full h-10 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-zinc-900 text-zinc-100 border border-zinc-800 text-xs font-medium px-2.5 py-1.5 shadow-xl"
                  >
                    Expand Sidebar
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsed(true)}
                  className="w-full justify-start text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl h-10 px-3 gap-2.5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span>Collapse Sidebar</span>
                </Button>
              )}
            </div>
          )}
        </aside>
      </TooltipProvider>
    </>
  )
}
