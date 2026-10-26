"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useDonor } from "../context"
import {
  getDonorJourneys,
  getCommunityImpactStories,
  getDonorImpactMetrics,
  DonationJourney,
  CommunityImpactStory,
  DonorImpactMetrics,
} from "@/lib/impact-service"
import { ImpactStatsBanner } from "@/components/impact/impact-stats-banner"
import { DonationJourneyCard } from "@/components/impact/donation-journey-card"
import { CommunityStoryCard } from "@/components/impact/community-story-card"
import { ImpactMapPreview } from "@/components/impact/impact-map-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HeartHandshake,
  Sparkles,
  MapPin,
  RefreshCw,
  Search,
  Plus,
  Package,
  Layers,
  Compass,
  Filter,
  CheckCircle2,
  Share2,
} from "lucide-react"

export default function DonorImpactPage() {
  const { profile } = useDonor()
  const donorId = profile?.id || "demo-donor"
  const donorName = profile ? `${profile.first_name} ${profile.last_name}` : "Valued FoodShare Donor"

  const [activeTab, setActiveTab] = useState<string>("stories")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<DonorImpactMetrics | null>(null)
  const [journeys, setJourneys] = useState<DonationJourney[]>([])
  const [stories, setStories] = useState<CommunityImpactStory[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("all")

  const loadData = useCallback(async () => {
    try {
      const [metricsData, journeysData, storiesData] = await Promise.all([
        getDonorImpactMetrics(donorId),
        getDonorJourneys(donorId),
        getCommunityImpactStories(),
      ])

      setMetrics(metricsData)
      setJourneys(journeysData)
      setStories(storiesData)
    } catch (err) {
      console.error("Error loading impact feed data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [donorId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
  }

  // Filtered Stories
  const filteredStories = stories.filter((s) => {
    const matchesSearch =
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.barangayName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBarangay =
      selectedBarangay === "all" ||
      s.barangayName.toLowerCase() === selectedBarangay.toLowerCase()

    return matchesSearch && matchesBarangay
  })

  // Filtered Journeys
  const filteredJourneys = journeys.filter((j) => {
    const matchesSearch =
      searchQuery === "" ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.targetBarangay && j.targetBarangay.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesBarangay =
      selectedBarangay === "all" ||
      (j.targetBarangay && j.targetBarangay.toLowerCase() === selectedBarangay.toLowerCase())

    return matchesSearch && matchesBarangay
  })

  // Distinct barangays for dropdown filter
  const distinctBarangays = Array.from(
    new Set([
      ...stories.map((s) => s.barangayName),
      ...journeys.map((j) => j.targetBarangay).filter(Boolean) as string[],
    ])
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Title & Navigation Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold mb-1 border border-emerald-500/20">
            <HeartHandshake className="h-3.5 w-3.5" />
            Transparent Giving
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            Where Your Donation Goes
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Follow the journey of your surplus food from doorstep collection to community dining tables in Janiuay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs h-9 border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Feed
          </Button>

          <Link href="/dashboard/donor/new">
            <Button size="sm" className="text-xs h-9 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              Post New Donation
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Impact Metrics Banner */}
      {metrics && <ImpactStatsBanner metrics={metrics} donorName={donorName} />}

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-3">
          <TabsList className="bg-zinc-100 p-1 rounded-xl">
            <TabsTrigger
              value="stories"
              className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs font-semibold gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Community Stories ({stories.length})
            </TabsTrigger>

            <TabsTrigger
              value="journeys"
              className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs font-semibold gap-2"
            >
              <Package className="h-4 w-4" />
              My Donation Journeys ({journeys.length})
            </TabsTrigger>

            <TabsTrigger
              value="map"
              className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs font-semibold gap-2"
            >
              <Compass className="h-4 w-4" />
              Barangay Reach Map
            </TabsTrigger>
          </TabsList>

          {/* Search & Barangay Filter Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search food or barangay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl border-zinc-200"
              />
            </div>

            <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
              <SelectTrigger className="w-36 text-xs h-9 rounded-xl border-zinc-200">
                <SelectValue placeholder="All Barangays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Barangays</SelectItem>
                {distinctBarangays.map((b) => (
                  <SelectItem key={b} value={b}>
                    Brgy. {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab 1: Community Stories Feed */}
        <TabsContent value="stories" className="space-y-6 outline-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing <strong>{filteredStories.length}</strong> photo dispatches & field updates
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified by MSWDO Janiuay
            </span>
          </div>

          {filteredStories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-300 p-8">
              <Sparkles className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <h3 className="font-bold text-zinc-800 text-sm">No stories match your filter</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Try selecting "All Barangays" or clearing your search term to see all verified community distribution dispatches.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedBarangay("all")
                }}
                className="mt-4 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <CommunityStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Donation Journeys */}
        <TabsContent value="journeys" className="space-y-4 outline-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing <strong>{filteredJourneys.length}</strong> donation tracking timelines
            </span>
            <span className="text-[11px] text-zinc-400">
              Updates in real-time as MSWD and Barangay teams log handovers
            </span>
          </div>

          {filteredJourneys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-300 p-8">
              <Package className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              <h3 className="font-bold text-zinc-800 text-sm">No donation journeys found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Ready to make your first community impact? Post a surplus food donation to start tracking where it goes!
              </p>
              <Link href="/dashboard/donor/new">
                <Button size="sm" className="mt-4 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                  Post a Donation Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJourneys.map((journey) => (
                <DonationJourneyCard
                  key={journey.foodItemId}
                  journey={journey}
                  onViewStory={() => setActiveTab("stories")}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Interactive Barangay Reach Map */}
        <TabsContent value="map" className="outline-hidden">
          <ImpactMapPreview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
