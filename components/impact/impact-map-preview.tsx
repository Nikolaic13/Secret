"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Compass, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BarangayImpactInfo {
  name: string
  zone: "Urban / Center" | "Semi-urban" | "Rural" | "Remote / Upland"
  distanceKm: number
  povertyRate: number
  mealsDelivered: number
  familiesServed: number
  highlight?: boolean
}

const JANIUAY_IMPACT_BARANGAYS: BarangayImpactInfo[] = [
  {
    name: "Damires",
    zone: "Semi-urban",
    distanceKm: 3.2,
    povertyRate: 24.5,
    mealsDelivered: 125,
    familiesServed: 32,
    highlight: true,
  },
  {
    name: "Aquino",
    zone: "Semi-urban",
    distanceKm: 2.8,
    povertyRate: 22.0,
    mealsDelivered: 85,
    familiesServed: 24,
    highlight: true,
  },
  {
    name: "Poblacion Ilawod",
    zone: "Urban / Center",
    distanceKm: 0.0,
    povertyRate: 15.2,
    mealsDelivered: 60,
    familiesServed: 18,
    highlight: true,
  },
  {
    name: "Lanag",
    zone: "Rural",
    distanceKm: 5.9,
    povertyRate: 28.5,
    mealsDelivered: 45,
    familiesServed: 14,
  },
  {
    name: "Lonoy",
    zone: "Remote / Upland",
    distanceKm: 15.8,
    povertyRate: 42.3,
    mealsDelivered: 50,
    familiesServed: 16,
  },
  {
    name: "Cabugao Norte",
    zone: "Rural",
    distanceKm: 8.5,
    povertyRate: 32.5,
    mealsDelivered: 40,
    familiesServed: 12,
  },
]

export function ImpactMapPreview() {
  const [selectedBarangay, setSelectedBarangay] = useState<BarangayImpactInfo>(JANIUAY_IMPACT_BARANGAYS[0])

  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 bg-gradient-to-r from-emerald-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-600" />
              Municipality of Janiuay — Aid Reach Map
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Interactive distribution coverage by distance from the Municipal Hall
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300 w-fit">
            6 Targeted Barangays
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Selected Barangay Quick Spotlight */}
        <div className="p-4 rounded-xl bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-400">Brgy. {selectedBarangay.name}</span>
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                {selectedBarangay.zone}
              </Badge>
            </div>
            <p className="text-xs text-zinc-300 flex items-center gap-2">
              <Navigation className="h-3 w-3 text-emerald-400" />
              <span>{selectedBarangay.distanceKm === 0 ? "Town Center (MSWD Central Hub)" : `${selectedBarangay.distanceKm} km from Municipal Hall`}</span>
              <span>•</span>
              <span>Poverty Index: {selectedBarangay.povertyRate}%</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-800/80 px-3.5 py-2 rounded-lg border border-zinc-700/60 text-xs">
            <div>
              <p className="text-base font-bold text-white">{selectedBarangay.mealsDelivered}</p>
              <p className="text-[10px] text-zinc-400 uppercase">Meals Delivered</p>
            </div>
            <div className="h-6 w-px bg-zinc-700" />
            <div>
              <p className="text-base font-bold text-emerald-400">{selectedBarangay.familiesServed}</p>
              <p className="text-[10px] text-zinc-400 uppercase">Families Fed</p>
            </div>
          </div>
        </div>

        {/* Barangay Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {JANIUAY_IMPACT_BARANGAYS.map((brgy) => {
            const isSelected = selectedBarangay.name === brgy.name
            return (
              <button
                key={brgy.name}
                onClick={() => setSelectedBarangay(brgy)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all relative text-xs flex flex-col justify-between h-20",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500/20"
                    : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn("font-bold truncate", isSelected ? "text-emerald-900" : "text-zinc-800")}>
                    {brgy.name}
                  </span>
                  {brgy.highlight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Direct Donation Recipient" />
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                  <span>{brgy.distanceKm} km</span>
                  <span className={cn("font-semibold", isSelected ? "text-emerald-700" : "text-zinc-600")}>
                    {brgy.mealsDelivered} meals
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
          <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          MCDA prioritization routes perishable foods to nearer urban centers and fortified/dry staples to remote upland communities.
        </p>
      </CardContent>
    </Card>
  )
}
