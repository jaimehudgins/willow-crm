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
  renewal_status?: string;
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
  school_id?: string;
  contact_id?: string;
  date: string;
  author: string;
  title?: string;
  notes: string;
  next_steps?: string;
  next_steps_due_date?: string;
  type: string;
  created_at?: string;
}

export interface DbFollowUpTask {
  id: string;
  touchpoint_id: string | null;
  partner_id: string | null;
  task: string;
  due_date: string | null;
  completed: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbOnboardingTask {
  id: string;
  partner_id: string;
  title: string;
  status: string;
  order_index: number;
  is_custom?: boolean;
  due_date?: string;
  created_at?: string;
}
