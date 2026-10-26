"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  User,
  HeartHandshake,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { DonationJourney, JourneyStep } from "@/lib/impact-service"
import { cn } from "@/lib/utils"

interface DonationJourneyCardProps {
  journey: DonationJourney
  onViewStory?: (storyId?: string) => void
}

export function DonationJourneyCard({ journey, onViewStory }: DonationJourneyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStepIcon = (step: JourneyStep["step"], isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      switch (step) {
        case "donated":
          return <Package className="h-4 w-4 text-emerald-600" />
        case "collected":
          return <Building className="h-4 w-4 text-teal-600" />
        case "allocated":
          return <Truck className="h-4 w-4 text-blue-600" />
        case "distributed":
          return <CheckCircle2 className="h-4 w-4 text-purple-600" />
      }
    }
    return <Clock className="h-4 w-4 text-zinc-400" />
  }

  const getStepBadgeColor = (step: JourneyStep["step"], isCompleted: boolean, isCurrent: boolean) => {
    if (isCurrent) {
      return "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
    }
    if (isCompleted) {
      switch (step) {
        case "donated":
          return "bg-emerald-50 text-emerald-700 border-emerald-300"
        case "collected":
          return "bg-teal-50 text-teal-700 border-teal-300"
        case "allocated":
          return "bg-blue-50 text-blue-700 border-blue-300"
        case "distributed":
          return "bg-purple-50 text-purple-700 border-purple-300"
      }
    }
    return "bg-zinc-100 text-zinc-500 border-zinc-200"
  }

  const isFullyDistributed = journey.currentStepIndex === 3

  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden bg-white">
      {/* Top Banner & Title Bar */}
      <CardHeader className="p-4 sm:p-5 bg-gradient-to-r from-zinc-50 to-white border-b border-zinc-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "font-medium text-xs px-2.5 py-0.5 rounded-full",
                  isFullyDistributed
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : journey.currentStepIndex >= 2
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                )}
              >
                {isFullyDistributed
                  ? "✅ Distributed to Families"
                  : journey.currentStepIndex === 2
                  ? "🚚 Allocated to Barangay"
                  : journey.currentStepIndex === 1
                  ? "🏛️ In MSWD Storage"
                  : "📦 Donation Queued"}
              </Badge>

              {journey.targetBarangay && (
                <Badge variant="outline" className="text-zinc-600 bg-zinc-50 border-zinc-300 text-xs gap-1">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  Brgy. {journey.targetBarangay}
                </Badge>
              )}

              <span className="text-[11px] text-zinc-400">
                Donated on {new Date(journey.donatedDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <CardTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2 pt-1">
              {journey.title}
            </CardTitle>

            <CardDescription className="text-xs text-zinc-500 flex items-center gap-3">
              <span>Category: <strong className="text-zinc-700">{journey.category}</strong></span>
              <span>•</span>
              <span>Quantity: <strong className="text-zinc-700">{journey.quantity} {journey.unit}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Approx. {journey.estimatedMeals} meals created</span>
            </CardDescription>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 h-8 gap-1.5"
            >
              {isExpanded ? (
                <>
                  Less Details
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Trace Timeline
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Highlight Banner if Distributed */}
        {journey.beneficiariesSummary && (
          <div className="mt-3 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-purple-600 shrink-0" />
              <span className="font-medium">{journey.beneficiariesSummary}</span>
            </div>
            {onViewStory && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onViewStory(journey.impactStoryId)}
                className="text-xs text-purple-700 hover:text-purple-900 p-0 h-auto font-semibold"
              >
                View Community Story ➔
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* Horizontal Progress Stepper Bar */}
        <div className="relative mb-5">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-zinc-100 border border-zinc-200">
            <div
              style={{ width: `${((journey.currentStepIndex + 1) / 4) * 100}%` }}
              className={cn(
                "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500",
                isFullyDistributed ? "bg-purple-600" : "bg-emerald-600"
              )}
            />
          </div>

          <div className="grid grid-cols-4 text-center text-xs">
            {journey.steps.map((st, idx) => {
              const isPast = idx < journey.currentStepIndex
              const isCurrent = idx === journey.currentStepIndex
              return (
                <div key={st.step} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center border-2 mb-1 text-xs transition-colors shadow-xs",
                      st.isCompleted
                        ? "bg-white border-emerald-500 text-emerald-700"
                        : "bg-zinc-50 border-zinc-300 text-zinc-400"
                    )}
                  >
                    {st.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="text-[11px] font-bold text-zinc-400">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-semibold tracking-tight truncate max-w-[80px] sm:max-w-none",
                      isCurrent
                        ? "text-emerald-700 font-bold"
                        : st.isCompleted
                        ? "text-zinc-800"
                        : "text-zinc-400"
                    )}
                  >
                    {idx === 0
                      ? "1. Donated"
                      : idx === 1
                      ? "2. Municipal Hub"
                      : idx === 2
                      ? "3. Brgy. Allocated"
                      : "4. Delivered"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Timeline Steps (Shown if expanded or summary) */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-zinc-100 mt-2 animate-in fade-in-50 duration-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Audit & Tracking Details
            </h4>

            <div className="relative pl-6 space-y-4 border-l-2 border-zinc-200 ml-3">
              {journey.steps.map((step, idx) => (
                <div key={step.step} className="relative group">
                  {/* Step Dot */}
                  <div
                    className={cn(
                      "absolute -left-[31px] top-0.5 p-1 rounded-full border-2 bg-white shadow-xs transition-transform group-hover:scale-110",
                      step.isCompleted ? "border-emerald-500" : "border-zinc-300"
                    )}
                  >
                    {getStepIcon(step.step, step.isCompleted, step.isCurrent)}
                  </div>

                  {/* Step Box */}
                  <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900">{step.title}</span>
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.2", getStepBadgeColor(step.step, step.isCompleted, step.isCurrent))}>
                          {step.badgeText}
                        </Badge>
                      </div>
                      {step.date && (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(step.date).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{step.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-zinc-200/60 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {step.location}
                      </span>
                      {step.actorName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-zinc-400" />
                          Handled by: <strong className="text-zinc-700">{step.actorName}</strong> ({step.actorRole || "Official"})
                        </span>
                      )}
                    </div>

                    {step.notes && (
                      <p className="mt-1.5 text-[11px] text-zinc-500 italic bg-white p-1.5 rounded border border-zinc-100">
                        "{step.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
