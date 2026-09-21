import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    "https://kbevxuxpsezzoyoekiyq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZXZ4dXhwc2V6em95b2VraXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTAyNDYsImV4cCI6MjA4MDE4NjI0Nn0.cqtboHcHNsJf-V0f4ywTatm_6R2quhwjfcyhYrCLSGk",
  )
}
