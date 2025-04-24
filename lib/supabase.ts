import { createClient } from "@supabase/supabase-js";

// Create a Supabase client for use in the browser
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Create a Supabase client for use on the server (App Router)
// This version doesn't use cookies, so it won't maintain session state
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// This object mimics the client interface for backward compatibility
export const getSupabaseServerClient = {
  from: (table: string) => {
    return supabaseServer().from(table);
  },
  // Add other methods you might be using
  storage: {
    from: (bucket: string) => supabaseServer().storage.from(bucket),
  },
  auth: {
    getUser: () => supabaseServer().auth.getUser(),
    // Add other auth methods if needed
  },
  rpc: (fn: string, params?: any) => supabaseServer().rpc(fn, params),
};