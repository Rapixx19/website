import { createClient } from '@supabase/supabase-js'

// Centralized service-role client for server-side operations that bypass RLS.
// Used only in API routes for public writes (contact form, etc.).
// NEVER import this in client components.
let adminClient: ReturnType<typeof createClient> | null = null

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return adminClient
}
