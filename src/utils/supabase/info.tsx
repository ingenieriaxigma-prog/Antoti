/**
 * Supabase Configuration - Loaded from Environment Variables
 * 
 * ⚠️  SECURITY: This file derives values from environment variables.
 *     Never hardcode credentials here.
 * 
 * projectId is extracted from VITE_SUPABASE_URL (e.g., bqfdinybjflhorauvfoo from https://bqfdinybjflhorauvfoo.supabase.co)
 * publicAnonKey is read from VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Extract projectId from URL (e.g., "bqfdinybjflhorauvfoo" from "https://bqfdinybjflhorauvfoo.supabase.co")
export const projectId = supabaseUrl
  ? supabaseUrl.split('//')[1]?.split('.')[0] || ''
  : '';

export const publicAnonKey = anonKey;