import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export function createServerSupabaseClient() {
  return createPagesServerClient({
    req: {} as any,
    res: {} as any,
  });
}
