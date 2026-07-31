"use client";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export function createClientSupabaseClient() {
  return createPagesBrowserClient();
}
