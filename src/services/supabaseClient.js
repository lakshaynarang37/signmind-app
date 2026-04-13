import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://rvkzqxgdkuhslcafwpgy.supabase.co";
const fallbackSupabaseAnonKey =
  "sb_publishable_VhDQ04wHwbuh_FWI0rBQuA_pYlDkH3O";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const requireSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase client initialization failed.");
  }
  return supabase;
};
