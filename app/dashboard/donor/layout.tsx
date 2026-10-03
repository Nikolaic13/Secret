import React from "react"
import { DonorProvider } from "./context"
import { DonorLayoutClient } from "./layout-client"

export const metadata = {
  title: "Donor Portal | FoodShare Janiuay",
  description: "Track surplus food contributions, pin pickup locations, and monitor distribution.",
}

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DonorProvider>
      <DonorLayoutClient>{children}</DonorLayoutClient>
    </DonorProvider>
  )
}
