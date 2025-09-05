import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // This will shout in your browser console if .env isn't loaded
  console.error("Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Debug helper (remove later)
if (typeof window !== "undefined") window.supabase = supabase;

console.log("ENV CHECK:", {
  url: supabaseUrl || "MISSING",
  anonKey: supabaseKey ? "present" : "MISSING",
});
