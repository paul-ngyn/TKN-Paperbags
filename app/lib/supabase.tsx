import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your database tables
export interface User {
  id: string
  email: string
  name: string
  business_name: string
  phone_number: string
  created_at: string
  updated_at: string
}

export interface Design {
  id: string
  user_id: string
  name: string
  design_data: any // This will store your design JSON
  created_at: string
  updated_at: string
}