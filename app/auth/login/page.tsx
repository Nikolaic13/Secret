"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Mail, Lock } from "lucide-react"

export default function LoginPage() {
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
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error("Login failed - no user data received")
      }

      // Get user profile to determine role
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.warn("Could not fetch profile:", profileError)
          router.push("/dashboard/donor")
          return
        }

        // Redirect based on role
        switch (profile?.role) {
          case "donor":
            router.push("/dashboard/donor")
            break
          case "municipal":
            router.push("/dashboard/municipal")
            break
          case "barangay":
            router.push("/dashboard/barangay")
            break
          default:
            router.push("/dashboard/donor")
        }
      } catch (profileError) {
        console.warn("Profile fetch failed, defaulting to donor dashboard:", profileError)
        router.push("/dashboard/donor")
      }
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "An unexpected error occurred. Please try again."

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials."
      } else if (error.message?.includes("fetch") || error.message?.includes("network")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
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
                Donor Portal
              </p>
            </div>
          </Link>
          <p className="text-xs text-muted-foreground pt-1">
            Sign in to manage surplus donations and food redistribution
          </p>
        </div>

        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-foreground">Food Donor Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access your donor dashboard
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
                <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="donor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 text-xs rounded-xl border-border/60 bg-background"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-10 text-xs rounded-xl border-border/60 bg-background"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-all"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In to Donor Portal"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50 text-center space-y-2 text-xs">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Register as Donor
                </Link>
              </p>
              <p className="text-muted-foreground">
                Barangay or Municipal Official?{" "}
                <Link href="/auth/officials/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Representative Portal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
