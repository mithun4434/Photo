import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  // If user pasted just the project ID/reference, format it as a URL
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Please set them in your environment variables.");
}

// Fallback to a dummy URL if completely empty to prevent Vite crashing on load, 
// though calls will fail
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
