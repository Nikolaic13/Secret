import { BarangayProvider } from "./context"
import { BarangayLayoutClient } from "./layout-client"

export default function BarangayLayout({ children }: { children: React.ReactNode }) {
  return (
    <BarangayProvider>
      <BarangayLayoutClient>{children}</BarangayLayoutClient>
    </BarangayProvider>
  )
}
