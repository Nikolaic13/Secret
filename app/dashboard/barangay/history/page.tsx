"use client"

import { useBarangay } from "../context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle } from "lucide-react"

export default function HistoryPage() {
  const { foodRequests } = useBarangay()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "fulfilled":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      vegetables: "Vegetables",
      fruits: "Fruits",
      grains: "Grains & Cereals",
      dairy: "Dairy Products",
      meat: "Meat & Poultry",
      seafood: "Seafood",
      canned: "Canned Goods",
      bakery: "Bakery Items",
      other: "Other",
    }
    return categoryMap[category] || category
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Request History
          </CardTitle>
          <CardDescription>
            View all your submitted food requests and their status. MCDA scores are calculated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {foodRequests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No food requests submitted yet</p>
              <p className="text-sm text-gray-400">
                Your submitted requests will appear here with MCDA priority scores
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{getCategoryDisplayName(request.food_category)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {request.quantity_needed} {request.unit}
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
