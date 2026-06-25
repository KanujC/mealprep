// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let clientInstance: SupabaseClient<AnyDB> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseClient(): SupabaseClient<AnyDB> {
  if (!clientInstance) {
    clientInstance = createClient<AnyDB>(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return clientInstance;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<AnyDB> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<AnyDB>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
