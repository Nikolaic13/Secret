"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Recycle,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
  Menu,
  X,
  LogIn,
  Layers,
  Award
} from "lucide-react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs sm:text-sm py-2 px-4 font-medium">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Community Food Sharing & Surplus Redistribution Platform • Municipality of Janiuay</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-emerald-100">
            <Link href="/auth/admin/login" className="hover:text-white transition-colors flex items-center gap-1 text-xs">
              <Shield className="w-3.5 h-3.5" />
              LGU Administration Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Sticky Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 transition-all shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Heart className="h-6 w-6 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">FoodShare</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800">Janiuay</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Surplus Food Redistribution Initiative</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How It Works</a>
            <a href="#portals" className="hover:text-emerald-700 transition-colors">Portals & Roles</a>
            <a href="#impact" className="hover:text-emerald-700 transition-colors">Community Impact</a>
            <a href="#about" className="hover:text-emerald-700 transition-colors">About Project</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
              <Button variant="ghost" size="sm" asChild className="text-slate-700 hover:text-emerald-700 font-medium">
                <Link href="/auth/login">Donor Log In</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-slate-700 hover:text-emerald-700 font-medium">
                <Link href="/auth/officials/login">Representative</Link>
              </Button>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 rounded-xl px-5 font-semibold transition-all hover:shadow-lg hover:shadow-emerald-600/30">
              <Link href="/auth/register" className="flex items-center gap-1.5">
                Get Started
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-slate-800" /> : <Menu className="h-6 w-6 text-slate-800" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 font-medium text-slate-600 border-b border-slate-100 pb-4">
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1 hover:text-emerald-600"
              >
                How It Works
              </a>
              <a 
                href="#portals" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1 hover:text-emerald-600"
              >
                Portals & Roles
              </a>
              <a 
                href="#impact" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1 hover:text-emerald-600"
              >
                Community Impact
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1 hover:text-emerald-600"
              >
                About Project
              </a>
            </nav>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Donor Login
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/auth/officials/login">
                  <Shield className="w-4 h-4 mr-2 text-teal-600" />
                  Representative Login
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                <Link href="/auth/admin/login">
                  <Building2 className="w-4 h-4 mr-2" />
                  LGU Admin Login
                </Link>
              </Button>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-1">
                <Link href="/auth/register">Get Started (Register)</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 lg:py-28">
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[350px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Empowering Janiuay Communities</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-normal text-emerald-700">MCDA-Optimized Redistribution</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Turn Surplus Food into{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">
                  Community Hope
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join Janiuay's municipal food crowdsourcing platform connecting donors, 
                local government units, and barangays to deliver edible surplus safely to families in need.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button size="lg" asChild className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-7 py-6 text-base font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transition-all">
                  <Link href="/auth/register" className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5 fill-white/20" />
                    Start Donating Today
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>

                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 rounded-xl px-7 py-6 text-base font-semibold transition-all">
                  <Link href="/auth/officials/register" className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Representative Portal
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-3 text-left">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Verified Donors</h4>
                    <p className="text-[11px] text-slate-500">Safe handling & log tracking</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Pinpoint Pickup</h4>
                    <p className="text-[11px] text-slate-500">Barangay direct coordination</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Expiry Tracking</h4>
                    <p className="text-[11px] text-slate-500">Urgency-based redistribution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image with Gentle Floating Animation & Balanced Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Soft circular backdrop */}
              <div className="absolute inset-0 m-auto w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-emerald-300/30 to-teal-200/25 blur-2xl -z-10" />

              {/* Main Image with refined size and gentle float */}
              <div className="relative w-full max-w-[310px] sm:max-w-[350px] mx-auto group">
                <div className="animate-float">
                  <Image
                    src="/images/3d-render-courier-hands-give-carton-box-client.png"
                    alt="Courier delivering food donation package"
                    width={400}
                    height={340}
                    priority
                    className="w-full h-auto object-contain drop-shadow-xl"
                  />
                </div>

                {/* Floating Micro-Badge Top Left */}
                <div className="absolute -top-2 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Zero Food Waste</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Priority Routing</p>
                  </div>
                </div>

                {/* Floating Micro-Badge Bottom Right */}
                <div className="absolute -bottom-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">60 Barangays</p>
                    <p className="text-[10px] text-teal-700 font-medium">Janiuay Community Care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Impact Statistics Bar */}
      <section id="impact" className="py-12 bg-white border-y border-slate-200/70 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-12 min-w-[4.25rem] px-3 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <span className="text-xl font-extrabold tracking-tight">13.5M</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Filipinos In Need</h4>
                <p className="text-xs text-slate-500 mt-0.5">Experience food insecurity annually; we help close this gap locally.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-12 min-w-[4.25rem] px-3 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <span className="text-xl font-extrabold tracking-tight">50kg</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Average Annual Waste</h4>
                <p className="text-xs text-slate-500 mt-0.5">Estimated food waste per household that can be salvaged and redirected.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-12 min-w-[4.25rem] px-3 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                <span className="text-xl font-extrabold tracking-tight">100%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Targeted Community Reach</h4>
                <p className="text-xs text-slate-500 mt-0.5">Direct handoff through verified Barangay leaders & MSWD officials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types & Portals Section */}
      <section id="portals" className="py-20 px-4 sm:px-6 scroll-mt-24">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 px-3 py-1 font-semibold">
              Tailored Portals
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Join as an Essential Pillar
            </h2>
            <p className="text-slate-600 text-base">
              Choose your role in Janiuay's food redistribution network. Each stakeholder gets dedicated tools tailored to their responsibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Food Donor Card */}
            <Card className="relative flex flex-col justify-between border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
              <div className="h-2 w-full bg-emerald-500" />
              <CardHeader className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 stroke-[2.2]" />
                </div>
                <Badge className="w-fit bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-semibold mb-2">
                  For Donors
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900">Food Donor</CardTitle>
                <CardDescription className="text-slate-600 text-sm mt-2">
                  Restaurants, bakeries, grocery stores, and compassionate individuals with surplus consumable food.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quick donation post with expiry details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pin accurate pickup location on the map</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Live status tracking & transaction history</span>
                  </li>
                </ul>

                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm">
                    <Link href="/auth/register">Register as Donor</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full text-slate-600 hover:text-emerald-700">
                    <Link href="/auth/login">Existing Donor Login →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Municipal Representative Card */}
            <Card className="relative flex flex-col justify-between border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
              <div className="h-2 w-full bg-teal-600" />
              <CardHeader className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 stroke-[2.2]" />
                </div>
                <Badge className="w-fit bg-teal-100 text-teal-800 hover:bg-teal-100 font-semibold mb-2">
                  LGU & MSWD
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900">Municipal Official</CardTitle>
                <CardDescription className="text-slate-600 text-sm mt-2">
                  Municipal Social Welfare and Development (MSWD) officers managing allocation and logistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>MCDA algorithmic allocation & priority matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Override allocations or initiate direct relief</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Centralized inventory & food pack creation</span>
                  </li>
                </ul>

                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm">
                    <Link href="/auth/officials/register">Register as Official</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full text-slate-600 hover:text-teal-700">
                    <Link href="/auth/officials/login">Representative Sign In →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Barangay Representative Card */}
            <Card className="relative flex flex-col justify-between border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
              <div className="h-2 w-full bg-blue-600" />
              <CardHeader className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 stroke-[2.2]" />
                </div>
                <Badge className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-100 font-semibold mb-2">
                  Barangay Level
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900">Barangay Rep</CardTitle>
                <CardDescription className="text-slate-600 text-sm mt-2">
                  Barangay officials representing community zones, requesting batches, and distributing to families.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Log urgent local beneficiaries by zone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Submit food batch requests with need scores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Handover distribution verification forms</span>
                  </li>
                </ul>

                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm">
                    <Link href="/auth/officials/register">Barangay Registration</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="w-full text-slate-600 hover:text-blue-700">
                    <Link href="/auth/officials/login">Barangay Portal Login →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-slate-100/60 border-t border-slate-200/80 scroll-mt-24">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-teal-700 border-teal-300 bg-teal-50 px-3 py-1 font-semibold">
              Transparent Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              How FoodShare Works
            </h2>
            <p className="text-slate-600 text-base">
              A structured, real-world redistribution process engineered to ensure dignity, speed, and fairness.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post Surplus Food</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Donors list food items with photos, expiry date ranges, food packaging types, and precise pickup coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-teal-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 font-black text-xl flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">LGU Inspection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                MSWD representatives review safety standards, verify donor coordinates, and catalog items into inventory.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">MCDA Allocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-Criteria Decision Analysis prioritizes recipient barangays based on urgency, distance, and population need.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-amber-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 font-black text-xl flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Barangay Handover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Barangay coordinators distribute food packs directly to validated households and log distribution forms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 px-3 py-1 font-semibold">
              Why Donate Surplus?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Transforming Food Waste into Real Relief
            </h2>
            <p className="text-slate-600 text-base">
              Every package redistributed preserves resources, reduces methane emissions from landfills, and nourishes families.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Uplift Janiuay Families</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Surplus food reaches families experiencing immediate hardship across all 60 barangays with verified, dignified delivery.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-teal-50/50 border border-teal-100 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <Recycle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Environmental Protection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Food waste in landfills generates potent greenhouse gases. Diverting quality surplus saves water, labor, and clean air.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Auditable Transparency</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time donation tracking, photo confirmations, and municipal logs protect both donor goodwill and community integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready To Make a Difference CTA Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-10 sm:p-14 lg:p-16 overflow-hidden shadow-2xl">
            {/* Subtle glow circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
                Together for Janiuay
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Ready to Turn Extra Food into Meaningful Support?
              </h2>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Whether you have 5 surplus packed meals or regular business excess, your contribution helps build a hunger-free municipality.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" asChild className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl px-8 py-6 text-base font-bold shadow-xl transition-all hover:scale-[1.02]">
                  <Link href="/auth/register" className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
                    Create Donor Account
                  </Link>
                </Button>
                <Button size="lg" asChild className="w-full sm:w-auto bg-emerald-950/75 hover:bg-emerald-950 text-white border-2 border-emerald-400/60 hover:border-emerald-300 rounded-xl px-8 py-6 text-base font-semibold shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02]">
                  <Link href="/auth/officials/register" className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-300" />
                    Official Registration
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer id="about" className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            {/* Column 1: Brand Info */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <Heart className="h-5 w-5 fill-white/20" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">FoodShare Janiuay</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pr-4">
                A crowdsourcing platform for surplus food redistribution and community relief across Janiuay, Iloilo. Built to facilitate municipal collaboration and zero food waste.
              </p>
              <div className="pt-2">
                <Badge variant="outline" className="text-emerald-400 border-emerald-800 bg-emerald-950/50 text-[11px]">
                  LGU-Assisted Initiative
                </Badge>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Donors</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/auth/register" className="hover:text-emerald-400 transition-colors">
                    Register as Donor
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-emerald-400 transition-colors">
                    Donor Dashboard Login
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                    Donation Guidelines
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Officials */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Officials & LGU</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/auth/officials/register" className="hover:text-emerald-400 transition-colors">
                    Representative Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/officials/login" className="hover:text-emerald-400 transition-colors">
                    MSWD & Barangay Portal
                  </Link>
                </li>
                <li>
                  <Link href="/auth/admin/login" className="hover:text-red-400 transition-colors flex items-center gap-1">
                    <Shield className="w-3 h-3 text-red-500" />
                    Administrator Console
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Academic & Research Project Attribution */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Academic Research</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">West Visayas State University</p>
                <p>College of Information and Communications Technology</p>
                <p className="text-slate-500">Bachelor of Science in Information Technology</p>
                <p className="text-[11px] text-emerald-400/90 pt-1">Janiuay, Iloilo, Philippines</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} FoodShare Janiuay. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Developed for community empowerment & food security
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
