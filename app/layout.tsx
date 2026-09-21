import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FoodShare Janiuay - Surplus Food Redistribution Platform",
  description:
    "A crowdsourcing web application for the redistribution of surplus food in Janiuay, Iloilo. Connect food donors with communities in need.",
  keywords: "food sharing, surplus food, Janiuay, Iloilo, community, donation, redistribution",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
