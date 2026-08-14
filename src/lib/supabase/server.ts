import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface SupabaseServerConfig {
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
}

export function readSupabaseServerConfig(): SupabaseServerConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && publishableKey && serviceRoleKey
    ? { url, publishableKey, serviceRoleKey }
    : null;
}

export function createSupabaseAdminClient(): SupabaseClient | null {
  const config = readSupabaseServerConfig();
  if (!config) return null;
  return createClient(config.url, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createSupabasePublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createSupabaseUserClient(accessToken: string): SupabaseClient | null {
  const config = readSupabaseServerConfig();
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
