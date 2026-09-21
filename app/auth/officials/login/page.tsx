"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Shield, Users, Building, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function OfficialLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🔐 Attempting official login for:", email)

      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("❌ Auth error:", authError)

        // Check if it's an invalid credentials error and suggest sign up
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.message.includes("Email not confirmed")
        ) {
          setError("Account not found. If you don't have an account yet, please register as a representative first.")
          return
        }

        throw authError
      }

      if (!authData.user) {
        throw new Error("No user data returned")
      }

      console.log("✅ Authentication successful, checking profile...")

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, barangay, first_name, last_name")
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.error("❌ Profile error:", profileError)
        throw new Error("Profile not found. Please contact administrator.")
      }

      if (!profile) {
        throw new Error("No profile found. Please contact administrator.")
      }

      console.log("👤 Profile found:", { role: profile.role, barangay: profile.barangay })

      // Check if user is municipal or barangay representative
      if (profile.role === "municipal") {
        console.log("🏛️ Municipal representative login successful")
        router.push("/dashboard/municipal")
      } else if (profile.role === "barangay") {
        console.log("🏘️ Barangay representative login successful")
        router.push("/dashboard/barangay")
      } else {
        throw new Error("Access denied. This portal is for municipal and barangay representatives only.")
      }
    } catch (error: any) {
      console.error("💥 Login error:", error)
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-10 w-10 text-green-600" />
            <h1 className="text-3xl font-bold text-green-800">FoodShare Janiuay</h1>
          </div>
          <p className="text-gray-600">Official Representative Portal</p>
        </div>

        {/* Access Level Information */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Building className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Municipal Representatives</p>
              <p className="text-sm text-blue-600">Manage food storage, allocation, and MCDA recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Barangay Representatives</p>
              <p className="text-sm text-green-600">View allocations and manage food distribution</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Official Access Login
            </CardTitle>
            <CardDescription>Enter your official representative credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Official Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@janiuay.gov.ph"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Don't have an account yet?</p>
              <Link href="/auth/officials/register">
                <Button variant="outline" className="w-full bg-transparent">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register as Representative
                </Button>
              </Link>
            </div>

            {/* Access Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Registration Requirements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Must be an official representative of Janiuay municipality or barangay</li>
                <li>• Valid government email address required</li>
                <li>• Account approval may be required by administrators</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">FoodShare Janiuay - Official Representative Portal</p>
          <p className="text-xs text-gray-400 mt-1">Authorized personnel only</p>
        </div>
      </div>
    </div>
  )
}
