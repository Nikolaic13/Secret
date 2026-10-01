"use client"

import { useState, useEffect } from "react"
import { useBarangay } from "../context"
import {
  getBeneficiaries,
  addBeneficiary,
  Beneficiary,
  VulnerabilityCategory,
  getAgeCategory,
  getAgeGroupLabel,
} from "@/lib/distribution-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  AlertTriangle,
  UserPlus,
  Search,
  Flame,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Home,
  Phone,
  Filter,
} from "lucide-react"
import Link from "next/link"

export default function BeneficiariesPage() {
  const { profile } = useBarangay()
  const barangayName = profile?.barangay || "Abangay"

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUrgency, setFilterUrgency] = useState<"all" | "urgent" | "standard">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<{
    full_name: string
    age: number | string
    gender: "male" | "female" | "other"
    household_size: number | string
    address_purok: string
    contact_number: string
    vulnerability_category: VulnerabilityCategory
    is_urgent: boolean
    urgency_reason: string
    notes: string
  }>({
    full_name: "",
    age: "",
    gender: "female",
    household_size: 1,
    address_purok: "Purok 1",
    contact_number: "",
    vulnerability_category: "low_income",
    is_urgent: false,
    urgency_reason: "",
    notes: "",
  })

  useEffect(() => {
    loadBeneficiaries()
  }, [barangayName])

  const loadBeneficiaries = async () => {
    setLoading(true)
    try {
      const data = await getBeneficiaries(barangayName)
      setBeneficiaries(data)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = (forceUrgent: boolean = false) => {
    setFormData({
      full_name: "",
      age: "",
      gender: "female",
      household_size: 1,
      address_purok: "Purok 1",
      contact_number: "",
      vulnerability_category: forceUrgent ? "malnourished_child" : "low_income",
      is_urgent: forceUrgent,
      urgency_reason: forceUrgent ? "Immediate emergency assistance required" : "",
      notes: "",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name.trim() || formData.age === "") {
      alert("Please provide the beneficiary's name and age.")
      return
    }

    if (formData.is_urgent && !formData.urgency_reason.trim()) {
      alert("Please provide the reason for marking this beneficiary as urgent.")
      return
    }

    setIsSubmitting(true)
    try {
      await addBeneficiary({
        barangay_name: barangayName,
        full_name: formData.full_name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        household_size: Number(formData.household_size) || 1,
        address_purok: formData.address_purok,
        contact_number: formData.contact_number || undefined,
        vulnerability_category: formData.vulnerability_category,
        is_urgent: formData.is_urgent,
        urgency_reason: formData.is_urgent ? formData.urgency_reason.trim() : undefined,
        notes: formData.notes.trim() || undefined,
      })

      setSuccessMessage(
        formData.is_urgent
          ? `Urgent Beneficiary "${formData.full_name}" registered and prioritized!`
          : `Beneficiary "${formData.full_name}" added successfully.`
      )
      setIsModalOpen(false)
      await loadBeneficiaries()

      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err: any) {
      alert(`Error saving beneficiary: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch =
      b.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address_purok.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesUrgency =
      filterUrgency === "all"
        ? true
        : filterUrgency === "urgent"
        ? b.is_urgent
        : !b.is_urgent

    const matchesCategory =
      filterCategory === "all" ? true : b.vulnerability_category === filterCategory

    return matchesSearch && matchesUrgency && matchesCategory
  })

  const urgentCount = beneficiaries.filter((b) => b.is_urgent).length

  const getCategoryLabel = (category: VulnerabilityCategory) => {
    switch (category) {
      case "senior":
        return "Senior Citizen (60+)"
      case "pwd":
        return "Person with Disability (PWD)"
      case "pregnant":
        return "Pregnant / Lactating"
      case "solo_parent":
        return "Solo Parent"
      case "malnourished_child":
        return "Malnourished Child"
      case "infant_care":
        return "Infant / Toddler Care"
      case "displaced_family":
        return "Displaced / Calamity Affected"
      case "low_income":
      default:
        return "Low Income Household"
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Barangay Beneficiary Registry
            </h1>
            <Badge variant="outline" className="text-xs bg-white text-gray-700">
              Brgy. {barangayName}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage registered households, prioritize urgent aid recipients, and direct age-based distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick-Add Urgent Beneficiary Button */}
          <Button
            onClick={() => openAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Flame className="h-4 w-4" />
            Add Urgent Beneficiary
          </Button>

          {/* Standard Beneficiary Button */}
          <Button
            onClick={() => openAddModal(false)}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100 flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4 text-gray-600" />
            Add Beneficiary
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="font-medium">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-red-600 tracking-wider">
              Urgent Priority Beneficiaries
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
              {urgentCount}
              <Flame className="h-6 w-6 text-red-500 animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            Immediate aid required (medical, infants, or severe crisis)
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-blue-600 tracking-wider">
              Total Registered Residents
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
              {beneficiaries.length}
              <Users className="h-6 w-6 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            Households on file for regular food and clothing relief
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
              Fast Distribution
            </CardDescription>
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center justify-between">
              Ready to Distribute
              <HeartHandshake className="h-5 w-5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Link href="/dashboard/barangay/distribution">
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                Open Distribution Form
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search beneficiary name or purok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                <Button
                  size="sm"
                  variant={filterUrgency === "all" ? "default" : "ghost"}
                  onClick={() => setFilterUrgency("all")}
                  className={filterUrgency === "all" ? "bg-white text-gray-900 shadow-sm h-7" : "h-7 text-gray-600"}
                >
                  All ({beneficiaries.length})
                </Button>
                <Button
                  size="sm"
                  variant={filterUrgency === "urgent" ? "default" : "ghost"}
                  onClick={() => setFilterUrgency("urgent")}
                  className={
                    filterUrgency === "urgent"
                      ? "bg-red-600 text-white shadow-sm h-7"
                      : "h-7 text-red-700 hover:text-red-800"
                  }
                >
                  <Flame className="h-3 w-3 mr-1" />
                  Urgent Only ({urgentCount})
                </Button>
                <Button
                  size="sm"
                  variant={filterUrgency === "standard" ? "default" : "ghost"}
                  onClick={() => setFilterUrgency("standard")}
                  className={filterUrgency === "standard" ? "bg-white text-gray-900 shadow-sm h-7" : "h-7 text-gray-600"}
                >
                  Standard ({beneficiaries.length - urgentCount})
                </Button>
              </div>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] h-9 text-xs bg-white">
                  <Filter className="h-3 w-3 mr-1 text-gray-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="low_income">Low Income</SelectItem>
                  <SelectItem value="senior">Senior Citizen</SelectItem>
                  <SelectItem value="infant_care">Infant Care</SelectItem>
                  <SelectItem value="pregnant">Pregnant / Lactating</SelectItem>
                  <SelectItem value="malnourished_child">Malnourished</SelectItem>
                  <SelectItem value="pwd">PWD</SelectItem>
                  <SelectItem value="solo_parent">Solo Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries Grid / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading beneficiaries...</div>
        ) : filteredBeneficiaries.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent>
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700">No beneficiaries found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search criteria or register a new beneficiary above.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBeneficiaries.map((b) => {
            const ageGroup = getAgeCategory(b.age)
            const ageGroupLabel = getAgeGroupLabel(ageGroup)

            return (
              <Card
                key={b.id}
                className={`transition-all hover:shadow-md ${
                  b.is_urgent
                    ? "border-red-300 bg-gradient-to-r from-red-50/50 via-white to-white ring-1 ring-red-200"
                    : "border-gray-200 bg-white"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 text-base">{b.full_name}</span>

                        {b.is_urgent && (
                          <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-0.5 flex items-center gap-1 shadow-sm">
                            <Flame className="h-3 w-3 animate-pulse" />
                            URGENT BENEFICIARY
                          </Badge>
                        )}

                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                          {b.age} yrs old ({ageGroupLabel})
                        </Badge>

                        <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50/50">
                          {getCategoryLabel(b.vulnerability_category)}
                        </Badge>
                      </div>

                      {/* Urgency Alert if urgent */}
                      {b.is_urgent && b.urgency_reason && (
                        <div className="mt-1 flex items-start gap-1.5 text-xs text-red-700 bg-red-100/70 p-2 rounded-md font-medium">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                          <span>
                            <strong>Reason for Urgency:</strong> {b.urgency_reason}
                          </span>
                        </div>
                      )}

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Home className="h-3.5 w-3.5 text-gray-400" />
                          {b.address_purok}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {b.household_size} Family Member{b.household_size > 1 ? "s" : ""}
                        </span>
                        {b.contact_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {b.contact_number}
                          </span>
                        )}
                        {b.notes && <span className="italic text-gray-400">Note: {b.notes}</span>}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/dashboard/barangay/distribution?beneficiaryId=${b.id}`}>
                        <Button
                          size="sm"
                          className={
                            b.is_urgent
                              ? "bg-red-600 hover:bg-red-700 text-white font-medium"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          }
                        >
                          <HeartHandshake className="h-4 w-4 mr-1.5" />
                          Distribute Aid
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Modal: Add Beneficiary / Add Urgent Beneficiary */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {formData.is_urgent ? (
                <>
                  <Flame className="h-5 w-5 text-red-600" />
                  Add Urgent Beneficiary
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Register New Beneficiary
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {formData.is_urgent
                ? "Fast-track registration for individuals or families in critical need of immediate assistance."
                : "Register a household to receive ongoing food and clothing assistance."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Urgent Toggle Banner */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                formData.is_urgent
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                    <Flame
                      className={`h-4 w-4 ${
                        formData.is_urgent ? "text-red-600 animate-bounce" : "text-gray-400"
                      }`}
                    />
                    Mark as Urgent Priority Beneficiary
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Flags this person to appear first for immediate food & clothing distributions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="is_urgent"
                  checked={formData.is_urgent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_urgent: e.target.checked,
                      urgency_reason: e.target.checked ? formData.urgency_reason : "",
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>

              {formData.is_urgent && (
                <div className="mt-3 space-y-1">
                  <Label htmlFor="urgency_reason" className="text-xs font-semibold text-red-800">
                    Reason for Urgency * (Required)
                  </Label>
                  <Input
                    id="urgency_reason"
                    placeholder="e.g., Bedridden senior, severely malnourished infant, fire/calamity victim..."
                    value={formData.urgency_reason}
                    onChange={(e) => setFormData({ ...formData, urgency_reason: e.target.value })}
                    className="bg-white border-red-300 focus:border-red-500 text-sm"
                    required={formData.is_urgent}
                  />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="full_name" className="text-xs font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  placeholder="e.g. Juanita Dela Cruz"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="age" className="text-xs font-semibold">
                  Age (Years) *
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="125"
                  placeholder="e.g. 45 or 1 (for infant)"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
                {formData.age !== "" && (
                  <p className="text-[11px] text-gray-500">
                    Age Group:{" "}
                    <span className="font-semibold text-emerald-700">
                      {getAgeGroupLabel(getAgeCategory(Number(formData.age)))}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="gender" className="text-xs font-semibold">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val: any) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vulnerability_category" className="text-xs font-semibold">
                  Vulnerability Category
                </Label>
                <Select
                  value={formData.vulnerability_category}
                  onValueChange={(val: VulnerabilityCategory) =>
                    setFormData({ ...formData, vulnerability_category: val })
                  }
                >
                  <SelectTrigger id="vulnerability_category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low_income">Low Income Household</SelectItem>
                    <SelectItem value="senior">Senior Citizen (60+)</SelectItem>
                    <SelectItem value="infant_care">Infant / Toddler Care</SelectItem>
                    <SelectItem value="pregnant">Pregnant / Lactating Mother</SelectItem>
                    <SelectItem value="malnourished_child">Malnourished Child</SelectItem>
                    <SelectItem value="pwd">Person with Disability (PWD)</SelectItem>
                    <SelectItem value="solo_parent">Solo Parent</SelectItem>
                    <SelectItem value="displaced_family">Displaced Family / Calamity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="household_size" className="text-xs font-semibold">
                  Household Members
                </Label>
                <Input
                  id="household_size"
                  type="number"
                  min="1"
                  value={formData.household_size}
                  onChange={(e) => setFormData({ ...formData, household_size: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="address_purok" className="text-xs font-semibold">
                  Purok / Zone *
                </Label>
                <Input
                  id="address_purok"
                  placeholder="e.g. Purok 3, Centro"
                  value={formData.address_purok}
                  onChange={(e) => setFormData({ ...formData, address_purok: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact_number" className="text-xs font-semibold">
                  Contact Number
                </Label>
                <Input
                  id="contact_number"
                  placeholder="e.g. 09171234567"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Additional Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Dietary constraints, medication needs, clothing preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={
                  formData.is_urgent
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }
              >
                {isSubmitting ? "Saving..." : formData.is_urgent ? "Add Urgent Beneficiary" : "Save Beneficiary"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
