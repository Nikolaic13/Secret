"use client"

import { useState } from "react"
import { useBarangay } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  FileText,
  Filter,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const { foodRequests, profile } = useBarangay()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)

  const barangayName = profile?.barangay || "Abangay"

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Under MSWD Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved & Allocated
          </Badge>
        )
      case "dispatched":
      case "ready":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Dispatched / For Claim
          </Badge>
        )
      case "fulfilled":
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-300 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Completed / Received
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      grains: "Grains & Rice",
      canned: "Canned Goods & Proteins",
      dairy: "Dairy & Infant Formula",
      vegetables: "Fresh Vegetables",
      fruits: "Fresh Fruits",
      meat: "Meat & Poultry",
      seafood: "Seafood & Fish",
      bakery: "Bakery Items",
      other: "Other Supplies",
    }
    return categoryMap[category] || category
  }

  const getStepProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return 1
      case "approved":
        return 2
      case "dispatched":
      case "ready":
        return 3
      case "fulfilled":
        return 4
      case "rejected":
        return 0
      default:
        return 1
    }
  }

  const filteredRequests = foodRequests.filter((r) => {
    if (filterStatus === "all") return true
    return r.status.toLowerCase() === filterStatus.toLowerCase()
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Food Supply Request Tracker
            </h1>
            <Badge variant="outline" className="text-xs bg-white text-gray-700">
              Brgy. {barangayName}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Monitor the status, municipal review stages, and fulfillment timelines of your food relief requests.
          </p>
        </div>

        <Link href="/dashboard/barangay/requests">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 text-xs">
            <Package className="h-4 w-4" />
            Submit New Request
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit text-xs">
        <Button
          size="sm"
          variant={filterStatus === "all" ? "default" : "ghost"}
          onClick={() => setFilterStatus("all")}
          className={filterStatus === "all" ? "bg-white text-gray-900 shadow-sm h-7" : "h-7 text-gray-600"}
        >
          All Requests ({foodRequests.length})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === "pending" ? "default" : "ghost"}
          onClick={() => setFilterStatus("pending")}
          className={filterStatus === "pending" ? "bg-amber-500 text-white shadow-sm h-7" : "h-7 text-amber-800"}
        >
          Pending Review
        </Button>
        <Button
          size="sm"
          variant={filterStatus === "approved" ? "default" : "ghost"}
          onClick={() => setFilterStatus("approved")}
          className={filterStatus === "approved" ? "bg-emerald-600 text-white shadow-sm h-7" : "h-7 text-emerald-800"}
        >
          Approved & Allocated
        </Button>
        <Button
          size="sm"
          variant={filterStatus === "fulfilled" ? "default" : "ghost"}
          onClick={() => setFilterStatus("fulfilled")}
          className={filterStatus === "fulfilled" ? "bg-slate-700 text-white shadow-sm h-7" : "h-7 text-gray-700"}
        >
          Completed
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent>
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700">No food requests in this category</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your submitted requests and municipal approvals will be tracked here.
              </p>
              <Link href="/dashboard/barangay/requests" className="inline-block mt-4">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
                  Create a Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((req) => {
            const step = getStepProgress(req.status)
            const isRejected = req.status.toLowerCase() === "rejected"

            return (
              <Card key={req.id} className="shadow-sm border-gray-200 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">
                        {getCategoryDisplayName(req.food_category)}
                      </span>
                      {getStatusBadge(req.status)}
                      {req.priority_level && (
                        <Badge variant="outline" className="text-xs">
                          Priority Score: Level {req.priority_level}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      Filed on {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Lifecycle Tracker Progress Bar */}
                  {!isRejected && (
                    <div className="py-4">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {/* Step 1 */}
                        <div className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              step >= 1 ? "bg-orange-600" : "bg-gray-200"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              step >= 1 ? "text-orange-900" : "text-gray-400"
                            }`}
                          >
                            1. Filed
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              step >= 2 ? "bg-emerald-600" : "bg-gray-200"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              step >= 2 ? "text-emerald-900" : "text-gray-400"
                            }`}
                          >
                            2. MSWD Approved
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              step >= 3 ? "bg-blue-600" : "bg-gray-200"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              step >= 3 ? "text-blue-900" : "text-gray-400"
                            }`}
                          >
                            3. Allocated / Dispatch
                          </span>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              step >= 4 ? "bg-slate-800" : "bg-gray-200"
                            }`}
                          />
                          <span
                            className={`text-[11px] font-semibold ${
                              step >= 4 ? "text-slate-900" : "text-gray-400"
                            }`}
                          >
                            4. Handed Over
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Request Specs and Justification */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-400 block text-[11px]">Requested Volume:</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {req.quantity_needed} {req.unit}
                      </span>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-lg sm:col-span-2">
                      <span className="text-gray-400 block text-[11px]">Justification / Reason:</span>
                      <p className="text-gray-700 line-clamp-2 mt-0.5">{req.reason}</p>
                    </div>
                  </div>

                  {req.special_requirements && (
                    <div className="mt-2 text-xs text-gray-500 bg-amber-50/50 p-2 rounded border border-amber-100">
                      <strong>Special Requirements:</strong> {req.special_requirements}
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
