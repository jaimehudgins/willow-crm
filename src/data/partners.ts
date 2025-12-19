export type PartnerStatus =
  | "New Lead"
  | "Contacted"
  | "Proposal Sent"
  | "Contract Preparation"
  | "Onboarding"
  | "Active";

export type LeadSource = "Website" | "Warm";
export type OnboardingStep = "Step 1" | "Step 2" | "Step 3";
export type SchoolType = "Public" | "Charter" | "Non-Profit";
export type Priority = "High" | "Medium" | "Low";
export type PartnershipHealth =
  | "Strong"
  | "Good"
  | "Fair"
  | "At Risk"
  | "Monitoring (New)";

export type NoteType =
  | "Call"
  | "Email"
  | "Meeting"
  | "Site Visit"
  | "Internal Note";

export const noteTypeIcons: Record<NoteType, string> = {
  Call: "Phone",
  Email: "Mail",
  Meeting: "Calendar",
  "Site Visit": "MapPin",
  "Internal Note": "FileText",
};

export const noteTypeColors: Record<NoteType, string> = {
  Call: "bg-blue-100 text-blue-800",
  Email: "bg-purple-100 text-purple-800",
  Meeting: "bg-green-100 text-green-800",
  "Site Visit": "bg-orange-100 text-orange-800",
  "Internal Note": "bg-gray-100 text-gray-800",
};

export interface OnboardingTask {
  task: string;
  completed: boolean;
  isCustom?: boolean;
  dueDate?: string;
}

// Core onboarding tasks that are auto-populated for every partner
export const CORE_ONBOARDING_TASKS = [
  "Sign Contract",
  "Kickoff Call",
  "Scope and Sequence",
  "Add to Platform",
  "Staff Roster Import",
  "Student Roster Import",
  "Curriculum Upload",
  "Initial Training",
];

export interface FollowUpTask {
  id: string;
  task: string;
  dueDate: string | null;
  completed: boolean;
  notes?: string;
}

export interface Note {
  id: string;
  date: string;
  author: string;
  content: string;
  type: NoteType;
  followUpTasks?: FollowUpTask[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface School {
  id: string;
  name: string;
  schoolType: string;
  studentCount: number;
  staffCount: number;
  district: string;
  address: string;
}

export interface Partner {
  id: string;
  name: string;
  status: PartnerStatus;
  leadSource?: LeadSource;
  onboardingStep?: OnboardingStep;
  partnershipHealth?: PartnershipHealth;
  priority: Priority;
  schoolType: SchoolType;
  studentCount: number;
  staffCount: number;
  schoolCount?: number;
  district: string;
  address: string;
  cityState?: string;
  timeZone?: string;
  lastContactDate: string;
  nextFollowUp: string | null;
  proposalDeadline: string | null;
  contractValue: number | null;
  contractLink: string;
  willowStaffLead: string;
  leadContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  contacts?: Contact[];
  summary: string;
  painPoints: string[];
  onboardingChecklist: OnboardingTask[];
  notes: Note[];
}


export const partners: Partner[] = [];

export const statusColors: Record<PartnerStatus, string> = {
  "New Lead": "bg-blue-100 text-blue-800",
  Contacted: "bg-yellow-100 text-yellow-800",
  "Proposal Sent": "bg-purple-100 text-purple-800",
  "Contract Preparation": "bg-orange-100 text-orange-800",
  Onboarding: "bg-indigo-100 text-indigo-800",
  Active: "bg-green-100 text-green-800",
};

export const priorityColors: Record<Priority, string> = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-gray-100 text-gray-800",
};

export const leadSourceColors: Record<LeadSource, string> = {
  Website: "bg-sky-100 text-sky-800",
  Warm: "bg-pink-100 text-pink-800",
};

export const onboardingStepColors: Record<OnboardingStep, string> = {
  "Step 1": "bg-violet-100 text-violet-800",
  "Step 2": "bg-fuchsia-100 text-fuchsia-800",
  "Step 3": "bg-rose-100 text-rose-800",
};

export const partnershipHealthColors: Record<PartnershipHealth, string> = {
  Strong: "bg-green-100 text-green-800",
  Good: "bg-emerald-100 text-emerald-800",
  Fair: "bg-yellow-100 text-yellow-800",
  "At Risk": "bg-red-100 text-red-800",
  "Monitoring (New)": "bg-blue-100 text-blue-800",
};

export const statusOrder: PartnerStatus[] = [
  "New Lead",
  "Contacted",
  "Proposal Sent",
  "Contract Preparation",
  "Onboarding",
  "Active",
];
