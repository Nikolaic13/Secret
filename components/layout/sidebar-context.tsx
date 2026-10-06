"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface MobileNavContextType {
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  toggleMobile: () => void
}

const MobileNavContext = createContext<MobileNavContextType | null>(null)

const MOBILE_NAV_EVENT = "foodshare:toggle-mobile-nav"

export function toggleMobileNav(forceState?: boolean) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(MOBILE_NAV_EVENT, { detail: { forceState } })
    )
  }
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = useState(false)

  const toggleMobile = () => setOpenMobile((prev) => !prev)

  return (
    <MobileNavContext.Provider
      value={{
        openMobile,
        setOpenMobile,
        toggleMobile,
      }}
    >
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav(): MobileNavContextType {
  const context = useContext(MobileNavContext)
  const [fallbackOpen, setFallbackOpen] = useState(false)

  useEffect(() => {
    // If context is not provided, synchronize via window custom events
    if (context) return

    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ forceState?: boolean }>
      if (customEvent.detail && typeof customEvent.detail.forceState === "boolean") {
        setFallbackOpen(customEvent.detail.forceState)
      } else {
        setFallbackOpen((prev) => !prev)
      }
    }

    window.addEventListener(MOBILE_NAV_EVENT, handleToggle)
    return () => window.removeEventListener(MOBILE_NAV_EVENT, handleToggle)
  }, [context])

  if (context) {
    return context
  }

  return {
    openMobile: fallbackOpen,
    setOpenMobile: (open: boolean) => {
      setFallbackOpen(open)
      toggleMobileNav(open)
    },
    toggleMobile: () => toggleMobileNav(),
  }
}
