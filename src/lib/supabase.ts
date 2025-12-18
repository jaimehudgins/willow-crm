import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hianqlrkebrwghkswqcp.supabase.co";
const supabaseAnonKey = "sb_publishable_4apqjClLEcaedUjg4kG0KQ_jyZk7g61";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on expected table structures
export interface DbPartner {
  id: string;
  name: string;
  status: string;
  lead_source?: string;
  onboarding_step?: string;
  relationship_health?: string;
  priority: string;
  school_type: string;
  student_count: number;
  staff_count: number;
  school_count?: number;
  district: string;
  address: string;
  city_state?: string;
  time_zone?: string;
  last_contact_date: string;
  next_follow_up?: string;
  proposal_deadline?: string;
  contract_value?: number;
  contract_link: string;
  willow_staff_lead: string;
  summary: string;
  pain_points: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DbSchool {
  id: string;
  partner_id: string;
  name: string;
  school_type: string;
  student_count: number;
  staff_count: number;
  district: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbContact {
  id: string;
  partner_id: string;
  name: string;
  title: string;
  role?: string;
  email: string;
  phone: string;
  is_primary_contact: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbTouchpoint {
  id: string;
  partner_id: string;
  date: string;
  author: string;
  content: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbOnboardingTask {
  id: string;
  partner_id: string;
  task: string;
  completed: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}
