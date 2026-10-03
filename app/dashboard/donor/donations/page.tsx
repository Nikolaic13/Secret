"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDonor, FoodItem } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Package,
  Plus,
  CheckCircle2,
  Timer,
  Heart,
  Truck,
  MapPin,
  Phone,
  AlertTriangle,
  Flame,
  User,
  Trash2,
  History,
  X as XIcon,
} from "lucide-react"
import { getFoodItemUrgency, formatExpiryDisplay } from "@/lib/distribution-service"
import { LocationViewerMap } from "@/components/maps/location-picker-map"
import { TransactionLogTimeline } from "@/components/transactions/transaction-timeline"

const MUNICIPAL_HALL_ADDRESS = "Municipal Hall, Janiuay, Iloilo, Philippines"

export default function DonorDonationsPage() {
  const router = useRouter()
  const { foodItems, transactionLogs, handleDeleteFoodItem } = useDonor()

  const [viewingMapItem, setViewingMapItem] = useState<FoodItem | null>(null)
  const [selectedItemForLogs, setSelectedItemForLogs] = useState<FoodItem | null>(null)
  const [showItemLogsDialog, setShowItemLogsDialog] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const canEditOrDelete = (status: string) => {
    return status === "available"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "waiting_pickup":
        return "bg-yellow-100 text-yellow-800"
      case "ready_distribution":
        return "bg-blue-100 text-blue-800"
      case "distributed":
        return "bg-purple-100 text-purple-800"
      case "claimed":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Package className="h-4 w-4" />
      case "waiting_pickup":
        return <Timer className="h-4 w-4" />
      case "ready_distribution":
        return <Truck className="h-4 w-4" />
      case "distributed":
        return <CheckCircle2 className="h-4 w-4" />
      case "claimed":
        return <Timer className="h-4 w-4" />
      case "rejected":
        return <XIcon className="h-4 w-4" />
      case "expired":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "available":
        return "Your donation is available and waiting to be claimed by municipal representatives."
      case "waiting_pickup":
        return "Your donation has been claimed and is waiting for pickup/drop-off."
      case "ready_distribution":
        return "Your donation has been collected and is ready for distribution to families."
      case "distributed":
        return "Your donation has been successfully distributed to families in need."
      case "claimed":
        return "Your donation has been claimed and is being processed."
      case "rejected":
        return "Your donation was rejected by municipal representatives. Please review the reason below."
      case "expired":
        return "This donation has expired and is no longer available."
      default:
        return ""
    }
  }

  const confirmDelete = async () => {
    if (!showDeleteConfirmation) return
    setDeleteLoading(true)
    await handleDeleteFoodItem(showDeleteConfirmation)
    setDeleteLoading(false)
    setShowDeleteConfirmation(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Donor Surplus Management</h1>
          <p className="text-sm text-gray-500">
            Track surplus food contributions, pin pickup locations, and monitor distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/donor/guidelines">
            <Button variant="outline" size="sm" className="text-xs text-green-700 border-green-300 hover:bg-green-50">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Safety Guidelines
            </Button>
          </Link>
          <Link href="/dashboard/donor/new">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
              <Plus className="h-4 w-4 mr-1.5" />
              Post Surplus Food
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Posted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{foodItems.length}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Available</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {foodItems.filter((item) => item.status === "available").length}
                </p>
              </div>
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Process</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {
                    foodItems.filter((item) =>
                      ["waiting_pickup", "ready_distribution", "claimed"].includes(item.status),
                    ).length
                  }
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <Timer className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distributed</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {foodItems.filter((item) => item.status === "distributed").length}
                </p>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food Items List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg font-semibold text-gray-900">Your Food Donations</CardTitle>
          <CardDescription>Track status, modify pending items, and review verification audit trails</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {foodItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">No food items posted yet</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                Share your surplus food with the community to minimize waste and aid families in need.
              </p>
              <Link href="/dashboard/donor/new">
                <Button className="bg-green-600 hover:bg-green-700 text-white text-xs">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Post Your First Donation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {foodItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors bg-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                        <Badge className={`${getStatusColor(item.status)} font-medium text-xs px-2.5 py-0.5`}>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status.replace("_", " ")}</span>
                          </div>
                        </Badge>
                        {item.delivery_method && (
                          <Badge variant="outline" className="flex items-center gap-1 text-xs text-gray-600">
                            {item.delivery_method === "pickup" ? (
                              <Truck className="h-3 w-3 text-blue-500" />
                            ) : (
                              <MapPin className="h-3 w-3 text-emerald-500" />
                            )}
                            <span className="capitalize">{item.delivery_method}</span>
                          </Badge>
                        )}
                      </div>
                      {item.description && <p className="text-sm text-gray-600 mb-2 leading-relaxed">{item.description}</p>}
                      <p className="text-xs text-gray-500">{getStatusDescription(item.status)}</p>
                    </div>

                    {/* Action Buttons */}
                    {canEditOrDelete(item.status) && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/donor/new?edit=${item.id}`)}
                          className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                        >
                          <User className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirmation(item.id)}
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-8"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 px-4 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-700">Category:</span>{" "}
                      <span className="capitalize">{item.category}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Quantity:</span> {item.quantity} {item.unit}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-700">Expiry:</span>
                      <span>
                        {formatExpiryDisplay({
                          expiry_type: item.expiry_type || "exact",
                          expiry_date: item.expiry_date,
                          expiry_date_from: item.expiry_date_from,
                          expiry_date_to: item.expiry_date_to,
                        })}
                      </span>
                      {(() => {
                        const urgency = getFoodItemUrgency({
                          expiry_type: item.expiry_type || "exact",
                          expiry_date: item.expiry_date,
                          expiry_date_from: item.expiry_date_from,
                          expiry_date_to: item.expiry_date_to,
                        })
                        return (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${urgency.badgeClass}`}>
                            {urgency.level === "critical" && <Flame className="h-3 w-3 inline mr-0.5" />}
                            {urgency.label}
                          </span>
                        )
                      })()}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Posted:</span>{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Delivery Details Section */}
                  {item.delivery_method === "pickup" && item.pickup_address && (
                    <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-lg flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Truck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium text-blue-900">Pickup Location:</p>
                          <p className="text-blue-800">{item.pickup_address}</p>
                          {item.pickup_contact && (
                            <p className="text-blue-700 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {item.pickup_contact}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.pickup_latitude && item.pickup_longitude && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingMapItem(item)}
                            className="text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-100 h-7 flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3 text-blue-600" />
                            View Pinned Location
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItemForLogs(item)
                            setShowItemLogsDialog(true)
                          }}
                          className="text-xs bg-white text-gray-700 border-gray-300 hover:bg-gray-100 h-7 flex items-center gap-1"
                        >
                          <History className="h-3 w-3 text-purple-600" />
                          Audit Trail
                        </Button>
                      </div>
                    </div>
                  )}

                  {item.delivery_method === "dropoff" && (
                    <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium text-emerald-900">Drop-off Destination:</p>
                          <p className="text-emerald-800">{MUNICIPAL_HALL_ADDRESS}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItemForLogs(item)
                          setShowItemLogsDialog(true)
                        }}
                        className="text-xs bg-white text-gray-700 border-gray-300 hover:bg-gray-100 h-7 flex items-center gap-1"
                      >
                        <History className="h-3 w-3 text-purple-600" />
                        Audit Trail
                      </Button>
                    </div>
                  )}

                  {/* Rejection Alert */}
                  {item.status === "rejected" && item.rejection_reason && (
                    <Alert className="mt-3 bg-red-50 border-red-200 text-xs">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Rejection Reason:</strong> {item.rejection_reason}
                        <br />
                        <span className="text-red-600">
                          Rejected on {new Date(item.rejected_at || "").toLocaleString()}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Processing Notice */}
                  {!canEditOrDelete(item.status) && item.status !== "rejected" && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>
                        This donation is currently locked from edits because it is{" "}
                        {item.status === "waiting_pickup"
                          ? "claimed and waiting for pickup/drop-off"
                          : item.status === "ready_distribution"
                          ? "collected and ready for distribution"
                          : item.status === "distributed"
                          ? "distributed to families"
                          : item.status === "claimed"
                          ? "claimed by municipal representatives"
                          : "processed"}
                        .
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirmation} onOpenChange={() => setShowDeleteConfirmation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Food Donation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this food donation? This action will permanently remove it from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Pinned Pickup Location Modal */}
      <Dialog open={!!viewingMapItem} onOpenChange={() => setViewingMapItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Pickup Location: {viewingMapItem?.title}
            </DialogTitle>
            <DialogDescription>
              Specific geographical coordinates pinned for driver pickup.
            </DialogDescription>
          </DialogHeader>
          {viewingMapItem && viewingMapItem.pickup_latitude && viewingMapItem.pickup_longitude && (
            <div className="py-2">
              <LocationViewerMap
                latitude={viewingMapItem.pickup_latitude}
                longitude={viewingMapItem.pickup_longitude}
                title={viewingMapItem.title}
                address={viewingMapItem.pickup_address}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Item Transaction History Audit Modal */}
      <Dialog open={showItemLogsDialog} onOpenChange={setShowItemLogsDialog}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Audit Trail: {selectedItemForLogs?.title}
            </DialogTitle>
            <DialogDescription>
              Complete lifecycle verification of this food donation from posting to beneficiary receipt.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <TransactionLogTimeline
              logs={transactionLogs.filter((l) => l.food_item_id === selectedItemForLogs?.id)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
