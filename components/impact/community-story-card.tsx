"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MapPin,
  Users,
  Calendar,
  Share2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react"
import { CommunityImpactStory, toggleStoryCheer } from "@/lib/impact-service"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CommunityStoryCardProps {
  story: CommunityImpactStory
  onCheerChange?: (storyId: string, count: number, hasCheered: boolean) => void
}

export function CommunityStoryCard({ story, onCheerChange }: CommunityStoryCardProps) {
  const [hasCheered, setHasCheered] = useState(story.userHasCheered || false)
  const [cheerCount, setCheerCount] = useState(story.cheerCount || 0)
  const [isCheering, setIsCheering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  const handleCheer = async () => {
    if (isCheering) return
    setIsCheering(true)

    // Optimistic UI update
    const nextCheered = !hasCheered
    const nextCount = nextCheered ? cheerCount + 1 : Math.max(0, cheerCount - 1)
    setHasCheered(nextCheered)
    setCheerCount(nextCount)

    try {
      const res = await toggleStoryCheer(story.id)
      setCheerCount(res.cheerCount)
      setHasCheered(res.userHasCheered)
      onCheerChange?.(story.id, res.cheerCount, res.userHasCheered)
    } catch (e) {
      console.error("Failed to cheer:", e)
    } finally {
      setIsCheering(false)
    }
  }

  const handleShare = () => {
    const text = `See the community impact in Brgy. ${story.barangayName} on FoodShare: "${story.title}" ❤️`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const primaryPhoto = story.photos?.[0] || "/images/impact/brgy_feeding_drive.jpg"

  return (
    <>
      <Card className="rounded-2xl border-zinc-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden bg-white flex flex-col">
        {/* Story Photo Banner with Overlays */}
        <div className="relative w-full h-56 sm:h-64 bg-zinc-900 overflow-hidden group">
          <Image
            src={primaryPhoto}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <Badge className="bg-emerald-600/95 text-white border-none shadow-sm text-xs font-semibold px-2.5 py-0.5 backdrop-blur-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Brgy. {story.barangayName}
            </Badge>

            <Badge variant="outline" className="bg-zinc-900/80 text-zinc-100 border-zinc-700/60 text-xs backdrop-blur-xs">
              {story.targetGroup}
            </Badge>
          </div>

          {/* Fullscreen Photo Trigger */}
          <button
            onClick={() => setPreviewPhoto(primaryPhoto)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-900/60 text-white/90 hover:bg-zinc-900/90 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="View Full Photo"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Bottom Photo Overlay Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1.5 font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              {story.familiesCount} Families Reached ({story.beneficiariesServed} Individuals)
            </span>
            <span className="text-[11px] text-zinc-300 bg-black/40 px-2 py-1 rounded-full">
              {new Date(story.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Story Body */}
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {story.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                >
                  #{t}
                </span>
              ))}
              {story.purok && (
                <span className="text-[11px] text-zinc-500 ml-auto">
                  📍 {story.purok}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug">
              {story.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {story.description}
            </p>

            {/* Distributed Items Pill Box */}
            {story.itemsIncluded && story.itemsIncluded.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3 text-zinc-400" />
                  Food Items Distributed:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {story.itemsIncluded.map((it, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/70 font-medium"
                    >
                      {it.quantity} {it.unit} {it.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Footer: Officials & Cheer Action */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
            <div className="text-[11px] text-zinc-500 truncate">
              {story.officialsInvolved && story.officialsInvolved.length > 0 ? (
                <span>Field Team: <strong className="text-zinc-700">{story.officialsInvolved.join(", ")}</strong></span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified MSWD Distribution
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 px-2.5 text-xs text-zinc-500 hover:text-zinc-900"
                title="Share Story"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
              </Button>

              {/* Cheer / Heart Button */}
              <Button
                variant={hasCheered ? "default" : "outline"}
                size="sm"
                onClick={handleCheer}
                disabled={isCheering}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-semibold transition-all gap-1.5 shadow-xs",
                  hasCheered
                    ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600"
                    : "border-zinc-200 text-zinc-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50"
                )}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    hasCheered ? "fill-white text-white scale-110" : "text-rose-500"
                  )}
                />
                <span>{cheerCount}</span>
                <span className="hidden sm:inline font-normal text-[11px]">Cheers</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Modal for Photo */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl p-2 bg-zinc-950 border-zinc-800 text-white overflow-hidden rounded-2xl [&>button]:text-zinc-200 [&>button]:bg-zinc-800/80 [&>button]:hover:bg-zinc-700 [&>button]:hover:text-white [&>button]:opacity-100 [&>button]:p-1.5 [&>button]:rounded-full [&>button]:top-3 [&>button]:right-3">
          <DialogHeader className="p-2 pb-0">
            <DialogTitle className="text-sm font-semibold text-zinc-300">
              Distribution Proof • Brgy. {story.barangayName}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[60vh] max-h-[500px] mt-2 rounded-xl overflow-hidden bg-black">
            {previewPhoto && (
              <Image
                src={previewPhoto}
                alt={story.title}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 800px"
              />
            )}
          </div>
          <p className="text-xs text-zinc-400 p-2 italic text-center">
            "{story.title}" — {story.summary}
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
