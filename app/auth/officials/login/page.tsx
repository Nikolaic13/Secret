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
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Heart className="h-6 w-6 text-white fill-white/20" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight text-foreground">FoodShare</h1>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Official Representative Portal
              </p>
            </div>
          </Link>
          <p className="text-xs text-muted-foreground pt-1">
            Authorized municipal and barangay official login
          </p>
        </div>

        {/* Access Level Information */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col p-3 bg-card border border-blue-500/20 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
              <Building className="h-4 w-4" />
              <span>Municipal</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Storage, allocations, and MCDA distribution
            </p>
          </div>
          <div className="flex flex-col p-3 bg-card border border-emerald-500/20 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Users className="h-4 w-4" />
              <span>Barangay</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Aid requests and beneficiary distribution
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-foreground">Representative Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your official email and credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="rounded-xl py-2.5 text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Official Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="official@janiuay.gov.ph"
                  required
                  className="h-10 text-xs rounded-xl border-border/60 bg-background"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 text-xs rounded-xl border-border/60 bg-background"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-all"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In to Official Portal"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-5 pt-4 border-t border-border/50 text-center space-y-2 text-xs">
              <p className="text-muted-foreground">Don't have an official account?</p>
              <Link href="/auth/officials/register" className="block">
                <Button variant="outline" className="w-full h-9 rounded-xl text-xs border-border/80 hover:bg-accent">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Register as Representative
                </Button>
              </Link>
            </div>

            {/* Access Information note */}
            <div className="mt-4 p-3 bg-muted/50 rounded-xl text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Official Access Requirements</p>
              <p>• Must be an authorized representative of Janiuay municipality or barangay</p>
              <p>• Requires admin approval before access is granted</p>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
