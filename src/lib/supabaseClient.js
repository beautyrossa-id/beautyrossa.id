import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Sengaja tidak throw error keras supaya build tetap jalan meski env var
  // belum diatur (mis. saat preview) - tapi tampil jelas di console.
  console.error(
    "Supabase belum terkonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diatur di Environment Variables Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
