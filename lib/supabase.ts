import { createClient } from "@supabase/supabase-js";

// Server-side client — uses the service role key so API routes can read/write freely.
// Never expose the service role key to the browser.
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}
