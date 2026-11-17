"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Utensils,
  Leaf,
  MapPin,
  Users,
  Share2,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { DonorImpactMetrics } from "@/lib/impact-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImpactStatsBannerProps {
  metrics: DonorImpactMetrics
  donorName?: string
}

export function ImpactStatsBanner({ metrics, donorName = "Generous Donor" }: ImpactStatsBannerProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyShare = () => {
    const text = `I've helped provide ${metrics.estimatedMeals} meals and divert ${metrics.divertedWasteKg}kg of food waste across ${metrics.barangaysReachedCount} barangays with FoodShare Janiuay! 🍲💚 Join the movement.`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 p-6 text-white shadow-xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Header & Motivational Callout */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Verified Community Impact
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Where Your Surplus Creates Hope
            </h2>
            <p className="text-sm text-zinc-300/90 leading-relaxed">
              Every box and bag you donate is directly routed by MSWDO and Barangay Nutrition Scholars
              to families facing food vulnerability in Janiuay.
            </p>

            {/* Reached Barangays Pill Cloud */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-zinc-400 font-medium mr-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" />
                Impacted Barangays:
              </span>
              {metrics.barangaysReached.map((b) => (
                <Badge
                  key={b}
                  variant="outline"
                  className="bg-zinc-800/80 border-emerald-500/30 text-emerald-300 text-[11px] font-medium py-0.5 px-2 hover:bg-emerald-500/10 transition-colors"
                >
                  Brgy. {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Button: Share Card */}
          <div className="shrink-0 flex items-center gap-3">
            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 rounded-xl px-4 py-2.5 h-auto text-xs font-semibold gap-2 border border-emerald-400/30 transition-all hover:scale-[1.02]"
            >
              <Award className="h-4 w-4" />
              View Impact Certificate
            </Button>
          </div>
        </div>

        {/* 4 Key Stat Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-zinc-800/80">
          {/* Stat 1: Estimated Meals */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1 font-medium">
              <span>Meals Served</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Utensils className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {metrics.estimatedMeals}
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Nutritious servings
            </p>
          </div>

          {/* Stat 2: Diverted Food Waste */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-teal-500/30 transition-all group">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1 font-medium">
              <span>Waste Diverted</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                <Leaf className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {metrics.divertedWasteKg} <span className="text-sm font-normal text-zinc-400">kg</span>
            </div>
            <p className="text-[11px] text-teal-400/90 mt-1">Prevented landfill emissions</p>
          </div>

          {/* Stat 3: Families Reached */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/30 transition-all group">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1 font-medium">
              <span>Families Helped</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {metrics.familiesSupported}
            </div>
            <p className="text-[11px] text-amber-400/90 mt-1">Across vulnerable puroks</p>
          </div>

          {/* Stat 4: Total Donations Tracked */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1 font-medium">
              <span>Verified Deliveries</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {metrics.totalDonations}
            </div>
            <p className="text-[11px] text-indigo-400/90 mt-1">100% auditable trail</p>
          </div>
        </div>
      </div>

      {/* Shareable Impact Certificate Dialog */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md bg-zinc-950 border-emerald-500/30 text-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-emerald-400">
              <Award className="h-5 w-5" />
              Community Donor Certificate
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Thank you for championing zero food waste and zero hunger in Janiuay, Iloilo.
            </DialogDescription>
          </DialogHeader>

          {/* Certificate Graphic Card */}
          <div className="my-3 p-5 rounded-xl bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-950 border border-emerald-500/40 relative overflow-hidden text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-300">
              <Heart className="h-6 w-6 fill-emerald-500/40 text-emerald-400" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                FoodShare Community Champion
              </p>
              <h3 className="text-xl font-bold text-white mt-0.5">{donorName}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Has successfully redistributed surplus food to vulnerable families in Janiuay.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-2 rounded-lg bg-zinc-900/90 border border-zinc-800">
              <div>
                <p className="text-lg font-bold text-emerald-400">{metrics.estimatedMeals}</p>
                <p className="text-[10px] text-zinc-400 uppercase">Meals Served</p>
              </div>
              <div>
                <p className="text-lg font-bold text-teal-400">{metrics.divertedWasteKg}kg</p>
                <p className="text-[10px] text-zinc-400 uppercase">Waste Diverted</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{metrics.barangaysReachedCount}</p>
                <p className="text-[10px] text-zinc-400 uppercase">Barangays</p>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500">
              Verified by MSWDO & Barangay Nutrition Scholars • FoodShare Janiuay
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareModal(false)}
              className="text-xs border-zinc-300 bg-white text-black hover:bg-gray-200 hover:text-black"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleCopyShare}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  Copied Text!
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  Share Impact Story
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
