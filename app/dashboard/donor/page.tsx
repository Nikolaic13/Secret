import { redirect } from "next/navigation"

export default function DonorDashboardRedirect() {
  redirect("/dashboard/donor/donations")
}
