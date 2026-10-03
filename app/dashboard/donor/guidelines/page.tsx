"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Truck, User, Plus, ArrowLeft, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react"

export default function DonorGuidelinesPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Food Safety & Donation Guidelines
          </h1>
          <p className="text-sm text-gray-500">
            Follow these standards to ensure safe, hygienic, and effective food donations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/donor/donations">
            <Button variant="ghost" size="sm" className="text-xs h-8 text-gray-600">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Donations
            </Button>
          </Link>
          <Link href="/dashboard/donor/new">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Post Surplus Food
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Guidelines Card */}
      <Card className="border-green-200 bg-green-50/40 shadow-sm">
        <CardHeader className="border-b border-green-100 pb-4">
          <CardTitle className="text-lg text-green-900 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-green-600" />
            Food Safety Standards
          </CardTitle>
          <CardDescription className="text-green-700">
            Key requirements ensuring all contributions protect beneficiary health and dignity
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Safety Requirements */}
            <div className="bg-white p-5 rounded-xl border border-green-100 shadow-2xs space-y-3">
              <h3 className="font-semibold text-green-900 flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Food Safety Requirements
              </h3>
              <ul className="text-xs text-gray-700 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Safe to Consume:</strong> Only donate food that is fresh, undamaged, and safe to eat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Expiration Margins:</strong> Food items should have at least 1-2 days before expiration upon pickup.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Proper Storage:</strong> Ensure refrigerated items remain cold until pickup to maintain cold chain.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Sealed Packaging:</strong> Do not donate opened, partially consumed, or punctured packaging.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Homemade Foods:</strong> Avoid homemade cooked meals unless authorized and properly packaged with preparation timestamps.</span>
                </li>
              </ul>
            </div>

            {/* Donation Process & Delivery */}
            <div className="bg-white p-5 rounded-xl border border-green-100 shadow-2xs space-y-3">
              <h3 className="font-semibold text-green-900 flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-blue-600" />
                Donation Process & Delivery Options
              </h3>
              <ul className="text-xs text-gray-700 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Flexible Delivery:</strong> Choose between pickup (driver arrives at your pinned location) or drop-off at Municipal Hall.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Municipal Verification:</strong> Municipal representatives will review and assign dispatch for your items.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Editable Status:</strong> You can edit quantities or cancel donations until they are claimed by municipal staff.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Precise GPS Pin:</strong> For pickup, accurately place the pin on the map to assist dispatch drivers in finding your location promptly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Direct Community Impact:</strong> Items are delivered straight to families in need through barangay coordination.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tips and Notices */}
          <Alert className="bg-green-100/70 border-green-300 text-xs">
            <User className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-900">
              <strong>Best Practices:</strong> Include clear descriptions, accurate quantities, and realistic expiry
              dates. The more detailed your listing, the faster municipal staff can route and distribute the food to matching families.
            </AlertDescription>
          </Alert>

          <Alert className="bg-amber-50 border-amber-300 text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Important Notice:</strong> By donating food, you confirm that items meet basic safety standards and
              are suitable for consumption. FoodShare Janiuay and its municipal partners review each donation to ensure safe distribution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
