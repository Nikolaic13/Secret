"use client"

import React from "react"
import Link from "next/link"
import { useDonor } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck, Activity } from "lucide-react"
import { TransactionLogTimeline } from "@/components/transactions/transaction-timeline"

export default function DonorTransactionsPage() {
  const { transactionLogs, fetchLogs, dataLoading } = useDonor()

  const pickupCount = transactionLogs.filter((l) => l.action_type === "pickup_requested").length
  const donatedCount = transactionLogs.filter((l) => l.action_type === "donated").length
  const statusChangesCount = transactionLogs.filter((l) => l.action_type === "status_change").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-purple-600" />
            Donation Transaction Audit Trail
          </h1>
          <p className="text-sm text-gray-500">
            Real-time chronological log of all your surplus contributions and municipal actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={dataLoading}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${dataLoading ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>
          <Link href="/dashboard/donor/donations">
            <Button variant="ghost" size="sm" className="text-xs h-8 text-gray-600">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Donations
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{transactionLogs.length}</p>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">New Donations</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{donatedCount}</p>
              </div>
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pickup Requests</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{pickupCount}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Status Updates</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{statusChangesCount}</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <History className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Trail Card */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold text-gray-900">Full Audit History</CardTitle>
          <CardDescription>
            Chronological audit log tracking each action from initial donation post to final delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {transactionLogs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">No transaction logs recorded yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Any donation posted, edited, or updated by representatives will show its complete audit trail here.
              </p>
            </div>
          ) : (
            <TransactionLogTimeline logs={transactionLogs} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
