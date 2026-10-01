import { redirect } from "next/navigation"

export default function BarangayDashboardRedirect() {
  redirect("/dashboard/barangay/demographics")
}
