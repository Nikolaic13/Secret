import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Recycle, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">FoodShare Janiuay</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Donor Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/officials/login">Representative Login</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/admin/login" className="text-red-600 border-red-300 hover:bg-red-50">
                Admin
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Food Waste into
            <span className="text-green-600"> Community Care</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join Janiuay's innovative crowdsourcing platform that connects surplus food donors with communities in need.
            Together, we can reduce waste and fight hunger.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/auth/register">Start Donating</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/officials/register">Representative Registration</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Join as</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Food Donor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Share your surplus food with families in need. Restaurants, stores, and individuals can make a
                  difference.
                </CardDescription>
                <Button asChild className="w-full">
                  <Link href="/auth/register">Register as Donor</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>Municipal Representative</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Review and allocate food donations using our MCDA algorithm to ensure fair distribution across
                  barangays.
                </CardDescription>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/officials/register">Representative Registration</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <CardTitle>Barangay Representative</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  Coordinate the distribution of allocated food donations to families in need within your barangay.
                </CardDescription>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/officials/register">Representative Registration</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Donate Your Surplus Food?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle>Help Your Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your surplus food directly supports families and individuals in need across Janiuay's barangays,
                  creating a stronger, more caring community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Recycle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Reduce Food Waste</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Instead of throwing away near-expiry food, give it a second life. Every donation prevents waste and
                  supports environmental sustainability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle>Build Social Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Be part of a movement that addresses food insecurity while promoting responsible consumption and
                  community solidarity.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">How FoodShare Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Register & Post</h4>
              <p className="text-sm text-gray-600">Create an account and post details about your surplus food items</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Municipal Review</h4>
              <p className="text-sm text-gray-600">Municipal representatives review and claim your donation</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Smart Allocation</h4>
              <p className="text-sm text-gray-600">
                Our MCDA algorithm determines the best barangay based on need and proximity
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold mb-2">Community Impact</h4>
              <p className="text-sm text-gray-600">
                Barangay representatives coordinate distribution to families in need
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Making a Difference in Janiuay</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">13.5M</div>
              <p className="text-green-100">Filipinos experience food insecurity annually</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50kg</div>
              <p className="text-green-100">Average food waste per Filipino household yearly</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-green-100">Of donations reach families in need</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the FoodShare Janiuay community today and help transform surplus food into hope for families in need.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/auth/register">Start Your Impact Journey</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/officials/register">Join as Representative</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold">FoodShare Janiuay</span>
              </div>
              <p className="text-gray-400">
                A crowdsourcing platform for surplus food redistribution in Janiuay, Iloilo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Donors</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/register" className="hover:text-white">
                    Register as Donor
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white">
                    Donor Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Representatives</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/officials/register" className="hover:text-white">
                    Representative Registration
                  </Link>
                </li>
                <li>
                  <Link href="/auth/officials/login" className="hover:text-white">
                    Representative Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Research Project</h4>
              <p className="text-gray-400 text-sm">
                West Visayas State University
                <br />
                College of Information and Communications Technology
                <br />
                Bachelor of Science in Information Technology
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FoodShare Janiuay. A research project for community impact.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
