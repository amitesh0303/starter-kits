/**
 * Supabase client for remote data access.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "../adapters/config";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Gets or creates a Supabase client instance.
 * Returns null if config indicates fake mode.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getConfig();

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  return supabaseInstance;
}

/**
 * Resets the cached client instance (useful for testing).
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
