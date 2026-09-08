import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase URL is invalid, missing, or pointing to expired dummy project
export const isLocalMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('rlynlpagopoqpwgdnfdv') ||
  supabaseUrl.includes('placeholder');

export const supabase: SupabaseClient = isLocalMode
  ? (mockSupabase as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
