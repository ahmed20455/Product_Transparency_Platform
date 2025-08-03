// frontend/src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not set correctly.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);