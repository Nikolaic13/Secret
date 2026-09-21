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
import { Heart, User, Mail, Lock, Phone, MapPin, AlertTriangle } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    barangay: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Complete list of barangays in Janiuay, Iloilo
  const barangays = [
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

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

    if (!formData.barangay) {
      setError("Please select your barangay")
      setLoading(false)
      return
    }

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      // Try registration
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("Registration failed - no user data received")
      }

      // Create profile with donor role
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          role: "donor", // Always set as donor for this registration page
          barangay: formData.barangay,
          created_at: new Date().toISOString(),
        })

        if (profileError) {
          console.warn("Profile creation failed:", profileError)
          // Continue anyway - user was created successfully
        }
      } catch (profileError) {
        console.warn("Profile creation failed, but user registration succeeded:", profileError)
      }

      // Redirect to login with success message
      router.push("/auth/login?message=Registration successful! Please sign in.")
    } catch (error: any) {
      console.error("Registration error:", error)

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">FoodShare Janiuay</h1>
          </div>
          <p className="text-gray-600">Join our community of food sharers</p>
          <p className="text-sm text-gray-500">Food Donor Registration</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              Food Donor Registration
            </CardTitle>
            <CardDescription>Register to start sharing surplus food with the community</CardDescription>
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
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
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
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Your address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Select onValueChange={(value) => handleInputChange("barangay", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your barangay" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {barangays.map((barangay) => (
                      <SelectItem key={barangay} value={barangay}>
                        {barangay}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Register as Food Donor"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 hover:underline">
                  Sign in here
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                Are you a representative?{" "}
                <Link href="/auth/officials/register" className="text-blue-600 hover:underline">
                  Representative registration
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
