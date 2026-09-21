import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://kbevxuxpsezzoyoekiyq.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZXZ4dXhwc2V6em95b2VraXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTAyNDYsImV4cCI6MjA4MDE4NjI0Nn0.cqtboHcHNsJf-V0f4ywTatm_6R2quhwjfcyhYrCLSGk"

/**
 * Create a Supabase client for server-side operations
 * Always create a new client within each function - do not use global variables
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
