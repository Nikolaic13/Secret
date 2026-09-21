"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, Phone, MapPin, AlertTriangle, Shield, CheckCircle } from "lucide-react"

export default function OfficialsRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "",
    barangay: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  // Complete list of barangays in Janiuay, Iloilo - Official Municipality Data
  const barangays = [
    // Rural Barangays
    "Abangay",
    "Agcarope",
    "Aglobong",
    "Aguingay",
    "Anhawan",
    "Atimonan",
    "Balanac",
    "Barasalon",
    "Bongol",
    "Cabantog",
    "Calmay",
    "Canawili",
    "Canawillian",
    "Caranas",
    "Caraudan",
    "Carigangan",
    "Cunsad",
    "Dabong",
    "Damires",
    "Damo-ong",
    "Danao",
    "Gines",
    "Guadalupe",
    "Jibolo",
    "Kuyot",
    "Madong",
    "Manacabac",
    "Mangil",
    "Matag-ub",
    "Monte-Magapa",
    "Pangilihan",
    "Panuran",
    "Pararinga",
    "Patong-patong",
    "Quipot",
    "Santo Tomas",
    "Sarawag",
    "Tambal",
    "Tamu-an",
    "Tiringanan",
    "Tolarucan",
    "Tuburan",
    "Ubian",
    "Yabon",
    // Poblacion Barangays (Urban Center)
    "Aquino Nobleza East (Poblacion)",
    "Aquino Nobleza West (Poblacion)",
    "R. Armada (Poblacion)",
    "Concepcion Poblacion (D.G. Abordo)",
    "Golgota (Poblacion)",
    "Locsin (Poblacion)",
    "Don T. Lutero Center (Poblacion)",
    "Don T. Lutero East (Poblacion)",
    "Don T. Lutero West (Poblacion)",
    "Crispin Salazar North (Poblacion)",
    "Crispin Salazar South (Poblacion)",
    "San Julian (Poblacion)",
    "San Pedro (Poblacion)",
    "Santa Rita (Poblacion)",
    "Capt. A. Tirador (Poblacion)",
    "S. M. Villa (Poblacion)",
  ]

  // Address options based on role
  const municipalAddresses = [
    "Janiuay Municipal Hall, Poblacion, Janiuay, Iloilo",
    "Janiuay Municipal Building, Don T. Lutero Center, Janiuay, Iloilo",
    "Municipal Agriculture Office, Janiuay, Iloilo",
    "Municipal Social Welfare Office, Janiuay, Iloilo",
    "Municipal Health Office, Janiuay, Iloilo",
    "Municipal Engineering Office, Janiuay, Iloilo",
    "Municipal Planning Office, Janiuay, Iloilo",
  ]

  const getBarangayAddresses = (barangay: string) => {
    if (!barangay) return []

    return [
      `Barangay Hall, ${barangay}, Janiuay, Iloilo`,
      `Barangay Captain's Office, ${barangay}, Janiuay, Iloilo`,
      `Barangay Health Station, ${barangay}, Janiuay, Iloilo`,
      `Barangay Outpost, ${barangay}, Janiuay, Iloilo`,
      `Community Center, ${barangay}, Janiuay, Iloilo`,
    ]
  }

  const getAddressOptions = () => {
    if (formData.role === "municipal") {
      return municipalAddresses
    } else if (formData.role === "barangay" && formData.barangay) {
      return getBarangayAddresses(formData.barangay)
    }
    return []
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Reset address when role or barangay changes
      if (field === "role" || field === "barangay") {
        newData.address = ""
      }

      return newData
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebugInfo(null)

    console.log("🚀 Starting representative registration...")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (!formData.role) {
      setError("Please select your role")
      setLoading(false)
      return
    }

    if (formData.role === "barangay" && !formData.barangay) {
      setError("Please select your barangay")
      setLoading(false)
      return
    }

    if (!formData.address) {
      setError("Please select your office address")
      setLoading(false)
      return
    }

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      console.log("📧 Attempting auth signup...")

      // Try registration
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      console.log("📧 Auth signup result:", { data: !!data, error })

      if (error) {
        console.error("❌ Auth signup error:", error)
        throw error
      }

      if (!data.user) {
        throw new Error("Registration failed - no user data received")
      }

      console.log("✅ User created successfully:", data.user.id)

      // Create profile with pending approval status
      const profileData = {
        id: data.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        barangay: formData.role === "barangay" ? formData.barangay : null,
        approval_status: "pending", // Set as pending for admin approval
        created_at: new Date().toISOString(),
      }

      console.log("👤 Creating profile with data:", profileData)

      try {
        const { data: profileResult, error: profileError } = await supabase
          .from("profiles")
          .insert(profileData)
          .select()

        console.log("👤 Profile creation result:", {
          success: !!profileResult,
          error: profileError,
          result: profileResult,
        })

        if (profileError) {
          console.error("❌ Profile creation error:", profileError)
          setDebugInfo({
            step: "profile_creation",
            error: profileError,
            userData: data.user.id,
            profileData: profileData,
          })
          // Don't throw here - user was created successfully
        } else {
          console.log("✅ Profile created successfully")
        }
      } catch (profileError) {
        console.error("💥 Profile creation exception:", profileError)
        setDebugInfo({
          step: "profile_creation_exception",
          error: profileError,
          userData: data.user.id,
          profileData: profileData,
        })
        // Continue anyway - user was created successfully
      }

      // Show success message
      setSuccess(true)
      console.log("🎉 Registration completed successfully")
    } catch (error: any) {
      console.error("💥 Registration error:", error)

      // Handle different types of errors
      let errorMessage = "An unexpected error occurred. Please try again."

      if (error.message?.includes("Invalid API key") || error.name === "AuthApiError") {
        errorMessage = "Invalid Supabase API key. Please check your credentials in the Supabase dashboard."
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Please try signing in instead."
      } else if (error.message?.includes("Missing Supabase credentials")) {
        errorMessage = "Supabase not configured. Please set up your environment variables."
      } else if (error.message?.includes("placeholder")) {
        errorMessage = "Please replace placeholder credentials with actual Supabase values."
      } else if (error.message?.includes("fetch") || error.message?.includes("network")) {
        errorMessage = "Network error. Please check your internet connection."
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setDebugInfo({
        step: "registration_error",
        error: error,
        message: errorMessage,
        formData: { ...formData, password: "[HIDDEN]", confirmPassword: "[HIDDEN]" },
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if we have basic environment setup
  const hasEnvVars = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-anon-key"
  )

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Registration Submitted
              </CardTitle>
              <CardDescription>Your representative account is pending approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Registration Successful!</strong> Your representative account has been submitted for review. A
                  system administrator will review your application and approve or reject it within 24-48 hours.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>What happens next:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your application will be reviewed by a system administrator</li>
                  <li>You'll receive an email notification once your account is approved</li>
                  <li>After approval, you can sign in using the representative login</li>
                </ul>
              </div>

              {debugInfo && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Debug Info:</strong> Registration completed but there may have been a profile creation
                    issue. Check the admin dashboard or browser console for details.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/">Back to Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/officials/login">Try Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-800">FoodShare Janiuay</h1>
          </div>
          <p className="text-gray-600">Representative Registration Portal</p>
          <p className="text-sm text-gray-500">For Municipal & Barangay Representatives</p>
        </div>

        {/* Configuration Warning */}
        {!hasEnvVars && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> Please configure your Supabase credentials in the .env.local file.
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Debug Information:</strong>
              <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Representative Registration
            </CardTitle>
            <CardDescription>Register as a Municipal or Barangay Representative</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Representative Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your representative email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="09XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Representative Role</Label>
                <Select onValueChange={(value) => handleInputChange("role", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your representative role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="municipal">Municipal Representative</SelectItem>
                    <SelectItem value="barangay">Barangay Representative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "barangay" && (
                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay Assignment (Janiuay, Iloilo)</Label>
                  <Select onValueChange={(value) => handleInputChange("barangay", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your barangay in Janiuay" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {barangays.map((barangay) => (
                        <SelectItem key={barangay} value={barangay}>
                          {barangay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Select the specific barangay in Janiuay municipality where you serve as representative
                  </p>
                </div>
              )}

              {formData.role && (formData.role === "municipal" || formData.barangay) && (
                <div className="space-y-2">
                  <Label htmlFor="address">Office Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select onValueChange={(value) => handleInputChange("address", value)} required>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your office address" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getAddressOptions().map((address) => (
                          <SelectItem key={address} value={address}>
                            {address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.role === "municipal"
                      ? "Select your municipal office location"
                      : "Select your barangay office location"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Approval Required:</strong> Representative accounts require admin approval before activation.
                  You'll be notified once your account is reviewed and approved.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Submitting Application..." : "Submit Representative Application"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have a representative account?{" "}
                <Link href="/auth/officials/login" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                Are you a food donor?{" "}
                <Link href="/auth/register" className="text-green-600 hover:underline">
                  Register as donor
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
