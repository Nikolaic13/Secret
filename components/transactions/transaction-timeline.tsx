"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CheckCircle2,
  Share2,
  Package,
  Truck,
  Building,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import { TransactionLogEntry } from "@/lib/transaction-service"

interface TransactionLogTimelineProps {
  logs: TransactionLogEntry[]
  compact?: boolean
}

export function TransactionLogTimeline({ logs, compact = false }: TransactionLogTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-xs bg-gray-50 rounded-lg border border-dashed">
        <Clock className="h-6 w-6 text-gray-400 mx-auto mb-1 opacity-70" />
        No audit transactions recorded yet.
      </div>
    )
  }

  const getActionBadge = (action: TransactionLogEntry["action_type"]) => {
    switch (action) {
      case "donated":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Donated</Badge>
      case "pickup_requested":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Pickup Queued</Badge>
      case "driver_assigned":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Driver Dispatched</Badge>
      case "claimed":
        return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">Claimed by MSWD</Badge>
      case "stored":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Placed in Storage</Badge>
      case "algo_allocated":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Algorithm Match</Badge>
      case "manual_allocated":
        return <Badge className="bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300">MSWD Manual Allocate</Badge>
      case "manual_overridden":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-300">Process Overridden</Badge>
      case "distributed":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-300">Aid Distributed</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const getActionIcon = (action: TransactionLogEntry["action_type"]) => {
    switch (action) {
      case "donated":
        return <Package className="h-4 w-4 text-emerald-600" />
      case "pickup_requested":
      case "driver_assigned":
        return <Truck className="h-4 w-4 text-blue-600" />
      case "stored":
        return <Building className="h-4 w-4 text-indigo-600" />
      case "manual_overridden":
      case "manual_allocated":
        return <RotateCcw className="h-4 w-4 text-rose-600" />
      case "rejected":
        return <ShieldAlert className="h-4 w-4 text-red-600" />
      case "distributed":
        return <CheckCircle2 className="h-4 w-4 text-teal-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-4 pl-4 space-y-4 my-2">
      {logs.map((log) => (
        <div key={log.id} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[25px] top-1 bg-white p-1 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 transition-colors shadow-xs">
            {getActionIcon(log.action_type)}
          </div>

          <div className="bg-white border rounded-lg p-3 text-xs shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-2">
                {getActionBadge(log.action_type)}
                <span className="font-semibold text-gray-900">{log.item_title}</span>
              </div>
              <span className="text-[11px] text-gray-400">
                {new Date(log.created_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {log.target_barangay && (
              <div className="flex items-center gap-1.5 text-gray-700 font-medium my-1 bg-gray-50 p-1.5 rounded">
                <ArrowRight className="h-3 w-3 text-emerald-600" />
                <span>Barangay Destination: <strong className="text-gray-900">{log.target_barangay}</strong></span>
              </div>
            )}

            {log.notes && (
              <p className="text-gray-600 mt-1 italic text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
                "{log.notes}"
              </p>
            )}

            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1 border-t">
              <span>
                Actor: {log.actor_name || "System"} {log.actor_role ? `(${log.actor_role})` : ""}
              </span>
              {log.old_status && log.new_status && (
                <span>
                  Status: <span className="font-mono text-gray-600">{log.old_status}</span> &rarr;{" "}
                  <span className="font-mono font-bold text-gray-800">{log.new_status}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
