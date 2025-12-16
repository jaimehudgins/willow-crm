export type PartnerStatus =
  | "New Lead"
  | "Contacted"
  | "Proposal Sent"
  | "Contract Preparation"
  | "Onboarding"
  | "Active";

export type LeadSource = "Website" | "Warm";
export type OnboardingStep = "Step 1" | "Step 2" | "Step 3";
export type SchoolType = "Public" | "Charter";
export type Priority = "High" | "Medium" | "Low";
export type PartnershipHealth = "Monitoring" | "Poor" | "Fair" | "Strong";

export interface OnboardingTask {
  task: string;
  completed: boolean;
}

export interface Note {
  date: string;
  author: string;
  content: string;
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
  district: string;
  address: string;
  lastContactDate: string;
  nextFollowUp: string | null;
  proposalDeadline: string | null;
  contractValue: number | null;
  contractLink: string;
  willowStaffLead: string;
  leadContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  summary: string;
  painPoints: string[];
  onboardingChecklist: OnboardingTask[];
  notes: Note[];
}

export const partners: Partner[] = [
  {
    id: "1",
    name: "Lincoln High School",
    status: "Onboarding",
    onboardingStep: "Step 2",
    priority: "High",
    schoolType: "Public",
    studentCount: 1850,
    staffCount: 142,
    district: "Riverside Unified School District",
    address: "1250 Oak Street, Riverside, CA 92501",
    lastContactDate: "2024-12-10",
    nextFollowUp: "2024-12-17",
    proposalDeadline: null,
    contractValue: 48000,
    contractLink: "https://contracts.willow.com/lincoln-high",
    willowStaffLead: "Sarah Mitchell",
    leadContact: {
      name: "Dr. Maria Santos",
      title: "Principal",
      email: "m.santos@riversideusd.edu",
      phone: "(951) 555-0123",
    },
    summary:
      "Lincoln High School is implementing Willow Staff to strengthen their college and career counseling program. With only 2 counselors for nearly 2,000 students, they need technology to scale personalized guidance for college applications, career exploration, and post-secondary planning.",
    painPoints: [
      "2 counselors for 1,850 students limits individual attention",
      "No centralized tracking of student college application progress",
      "Career exploration resources are outdated and fragmented",
      "Difficulty connecting students with relevant internship opportunities",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: true },
      { task: "Kickoff Call", completed: true },
      { task: "Scope and Sequence", completed: true },
      { task: "Staff Roster Import", completed: true },
      { task: "Student Roster Import", completed: true },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-10",
        author: "Sarah Mitchell",
        content:
          "Data import complete. Moving to Step 2 - scheduling counselor training for next week. They're excited about the college application tracker.",
      },
      {
        date: "2024-12-05",
        author: "Sarah Mitchell",
        content:
          "Contract signed! Principal emphasized need for better FAFSA completion tracking.",
      },
    ],
  },
  {
    id: "2",
    name: "Westview High School",
    status: "Active",
    partnershipHealth: "Strong",
    priority: "Medium",
    schoolType: "Public",
    studentCount: 2100,
    staffCount: 165,
    district: "San Diego Unified School District",
    address: "4500 Westview Parkway, San Diego, CA 92130",
    lastContactDate: "2024-12-08",
    nextFollowUp: "2025-01-08",
    proposalDeadline: null,
    contractValue: 58000,
    contractLink: "https://contracts.willow.com/westview-high",
    willowStaffLead: "Michael Torres",
    leadContact: {
      name: "Principal James Richardson",
      title: "Principal",
      email: "j.richardson@sdusd.edu",
      phone: "(858) 555-0456",
    },
    summary:
      "Westview High has been using Willow Staff for 6 months to manage their comprehensive college and career readiness program. They've seen a 28% increase in FAFSA completion rates and doubled the number of students participating in career pathway programs.",
    painPoints: [
      "Needed better visibility into student post-secondary plans",
      "Tracking dual enrollment and AP course planning was manual",
      "Career technical education pathways lacked clear student tracking",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: true },
      { task: "Kickoff Call", completed: true },
      { task: "Scope and Sequence", completed: true },
      { task: "Staff Roster Import", completed: true },
      { task: "Student Roster Import", completed: true },
      { task: "Curriculum Upload", completed: true },
      { task: "Initial Training", completed: true },
    ],
    notes: [
      {
        date: "2024-12-08",
        author: "Michael Torres",
        content:
          "Quarterly check-in went well. FAFSA completion up 28% vs last year. They want to expand career pathway tracking features.",
      },
      {
        date: "2024-10-15",
        author: "Michael Torres",
        content:
          "Fully onboarded. Counselors love the college application dashboard.",
      },
    ],
  },
  {
    id: "3",
    name: "Summit Preparatory Charter High",
    status: "Proposal Sent",
    priority: "High",
    schoolType: "Charter",
    studentCount: 980,
    staffCount: 78,
    district: "Independent Charter",
    address: "789 Innovation Blvd, San Jose, CA 95110",
    lastContactDate: "2024-12-12",
    nextFollowUp: "2024-12-18",
    proposalDeadline: "2024-12-20",
    contractValue: 38000,
    contractLink: "https://contracts.willow.com/summit-prep",
    willowStaffLead: "Sarah Mitchell",
    leadContact: {
      name: "James Nakamura",
      title: "Executive Director",
      email: "j.nakamura@summitprep.org",
      phone: "(408) 555-0789",
    },
    summary:
      "Summit Prep is seeking Willow Staff to support their 100% college acceptance mission. They need a platform to track student progress from freshman year college prep through senior year applications, with emphasis on first-generation college student support.",
    painPoints: [
      "65% first-gen college students need extra support tracking",
      "No system to monitor 4-year college readiness progression",
      "Scholarship search and application tracking is disorganized",
      "Alumni mentorship program has no central coordination",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: false },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-12",
        author: "Sarah Mitchell",
        content:
          "Sent proposal emphasizing first-gen student tracking features. Board decision expected Dec 20.",
      },
      {
        date: "2024-12-05",
        author: "Sarah Mitchell",
        content:
          "Demo went very well. ED loves the scholarship tracker and parent communication portal.",
      },
    ],
  },
  {
    id: "4",
    name: "Gateway High School",
    status: "Contacted",
    priority: "Medium",
    schoolType: "Charter",
    studentCount: 720,
    staffCount: 58,
    district: "Independent Charter",
    address: "2100 Gateway Boulevard, Pasadena, CA 91101",
    lastContactDate: "2024-12-05",
    nextFollowUp: "2024-12-16",
    proposalDeadline: "2024-12-22",
    contractValue: null,
    contractLink: "https://contracts.willow.com/gateway-high",
    willowStaffLead: "David Kim",
    leadContact: {
      name: "Dr. Elena Rodriguez",
      title: "Head of School",
      email: "e.rodriguez@gatewayhigh.org",
      phone: "(626) 555-0234",
    },
    summary:
      "Gateway High is interested in Willow Staff to enhance their career-focused curriculum model. Students complete industry certifications alongside academics, and they need better tools to track certification progress, internship placements, and employer partnerships.",
    painPoints: [
      "Industry certification tracking spread across multiple systems",
      "Internship placement coordination is entirely manual",
      "No dashboard for employer partnership management",
      "Career pathway completion rates hard to measure",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: false },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-05",
        author: "David Kim",
        content:
          "Initial call went well. Strong interest in internship tracking and employer portal features. Demo scheduled for next week.",
      },
    ],
  },
  {
    id: "5",
    name: "Oakland Technical High School",
    status: "Contract Preparation",
    priority: "High",
    schoolType: "Public",
    studentCount: 2400,
    staffCount: 185,
    district: "Oakland Unified School District",
    address: "4351 Broadway, Oakland, CA 94611",
    lastContactDate: "2024-12-11",
    nextFollowUp: "2024-12-14",
    proposalDeadline: "2024-12-15",
    contractValue: 68000,
    contractLink: "https://contracts.willow.com/oakland-tech",
    willowStaffLead: "Michael Torres",
    leadContact: {
      name: "Principal Denise Washington",
      title: "Principal",
      email: "d.washington@ousd.org",
      phone: "(510) 555-0567",
    },
    summary:
      "Oakland Tech is piloting Willow Staff for OUSD's district-wide college and career readiness initiative. As a large comprehensive high school, they need to coordinate multiple pathway programs, track A-G completion rates, and increase college enrollment for underrepresented students.",
    painPoints: [
      "A-G requirement tracking is fragmented across systems",
      "Low FAFSA completion rates among eligible students",
      "Career pathway programs lack unified reporting",
      "Need better early warning system for off-track students",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: false },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-11",
        author: "Michael Torres",
        content:
          "Contract in legal review. District wants emphasis on equity metrics for college access.",
      },
      {
        date: "2024-12-08",
        author: "Michael Torres",
        content:
          "Met with OUSD leadership. Success here means potential 15-school district expansion.",
      },
    ],
  },
  {
    id: "6",
    name: "KIPP San Francisco College Prep",
    status: "Active",
    partnershipHealth: "Fair",
    priority: "Medium",
    schoolType: "Charter",
    studentCount: 650,
    staffCount: 52,
    district: "KIPP Bay Area Schools",
    address: "1195 Hudson Avenue, San Francisco, CA 94124",
    lastContactDate: "2024-12-09",
    nextFollowUp: "2024-12-13",
    proposalDeadline: null,
    contractValue: 32000,
    contractLink: "https://contracts.willow.com/kipp-sf",
    willowStaffLead: "Sarah Mitchell",
    leadContact: {
      name: "Dr. Kevin Patel",
      title: "School Leader",
      email: "k.patel@kippbayarea.org",
      phone: "(415) 555-0890",
    },
    summary:
      "KIPP SF College Prep is implementing Willow Staff to support their 'To and Through College' mission. They need comprehensive tracking from high school through college persistence, with particular focus on supporting students during their first year of college.",
    painPoints: [
      "Alumni tracking post-graduation is inconsistent",
      "KIPP Through College advisors need better student data access",
      "College persistence intervention triggers are manual",
      "Scholarship renewal tracking falls through cracks",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: true },
      { task: "Kickoff Call", completed: true },
      { task: "Scope and Sequence", completed: true },
      { task: "Staff Roster Import", completed: true },
      { task: "Student Roster Import", completed: true },
      { task: "Curriculum Upload", completed: true },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-09",
        author: "Sarah Mitchell",
        content:
          "Admin training complete. Moving to Step 3 - counselor app rollout. They're excited about the alumni tracking features.",
      },
      {
        date: "2024-12-02",
        author: "Sarah Mitchell",
        content:
          "Kickoff call done. Strong alignment with KIPP's college persistence goals.",
      },
    ],
  },
  {
    id: "7",
    name: "Fremont High School",
    status: "New Lead",
    leadSource: "Website",
    priority: "Low",
    schoolType: "Public",
    studentCount: 1950,
    staffCount: 148,
    district: "Fremont Unified School District",
    address: "1800 Noble Avenue, Fremont, CA 94538",
    lastContactDate: "2024-12-13",
    nextFollowUp: "2024-12-20",
    proposalDeadline: null,
    contractValue: null,
    contractLink: "https://contracts.willow.com/fremont-high",
    willowStaffLead: "David Kim",
    leadContact: {
      name: "Assistant Principal Robert Chen",
      title: "Assistant Principal, Student Services",
      email: "r.chen@fremont.k12.ca.us",
      phone: "(510) 555-0345",
    },
    summary:
      "Fremont High submitted an inquiry through our website seeking solutions for their college and career center. They're looking to modernize their approach to post-secondary planning and better serve their diverse student population with varied post-graduation goals.",
    painPoints: [
      "College and career center resources are underutilized",
      "No way to track student career interest assessments",
      "Military and trade school pathways often overlooked",
      "Parent engagement in college planning is low",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: false },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-13",
        author: "David Kim",
        content:
          "Website inquiry received. Interested in comprehensive post-secondary planning tools. Intro call scheduled for next week.",
      },
    ],
  },
  {
    id: "8",
    name: "Elk Grove Charter High",
    status: "Active",
    partnershipHealth: "Monitoring",
    priority: "Medium",
    schoolType: "Charter",
    studentCount: 880,
    staffCount: 72,
    district: "Elk Grove Unified School District",
    address: "9400 Elk Grove Blvd, Elk Grove, CA 95624",
    lastContactDate: "2024-12-07",
    nextFollowUp: "2024-12-16",
    proposalDeadline: "2024-12-22",
    contractValue: 36000,
    contractLink: "https://contracts.willow.com/elk-grove-charter",
    willowStaffLead: "Michael Torres",
    leadContact: {
      name: "Jennifer Martinez",
      title: "Executive Director",
      email: "j.martinez@egcharter.org",
      phone: "(916) 555-0678",
    },
    summary:
      "Elk Grove Charter High wants Willow Staff to strengthen their dual enrollment and early college program. With 40% of students taking community college courses, they need better coordination between high school counselors and college advisors.",
    painPoints: [
      "Dual enrollment course tracking is manual and error-prone",
      "Students unclear on how college credits transfer",
      "No visibility into community college advisor interactions",
      "Early college pathway completion rates need improvement",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: false },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-07",
        author: "Michael Torres",
        content:
          "Proposal sent highlighting dual enrollment tracking features. Decision expected before holiday break.",
      },
      {
        date: "2024-11-28",
        author: "Michael Torres",
        content:
          "Great demo with ED. They want seamless integration with community college systems.",
      },
    ],
  },
  {
    id: "9",
    name: "Sacramento Charter High",
    status: "New Lead",
    leadSource: "Warm",
    priority: "High",
    schoolType: "Charter",
    studentCount: 1100,
    staffCount: 88,
    district: "Independent Charter",
    address: "2315 34th Street, Sacramento, CA 95817",
    lastContactDate: "2024-12-12",
    nextFollowUp: "2024-12-15",
    proposalDeadline: null,
    contractValue: null,
    contractLink: "https://contracts.willow.com/sac-charter-high",
    willowStaffLead: "Sarah Mitchell",
    leadContact: {
      name: "Dr. Angela Brooks",
      title: "Founder & CEO",
      email: "a.brooks@saccharterhigh.org",
      phone: "(916) 555-0912",
    },
    summary:
      "Referred by KIPP SF, Sacramento Charter High serves predominantly first-generation college students and needs robust support systems. They're seeking Willow Staff to build a comprehensive college-going culture with family engagement and alumni mentorship components.",
    painPoints: [
      "85% first-gen students need intensive college guidance",
      "Family workshops on college process poorly attended",
      "No system to match students with college student mentors",
      "Scholarship tracking for low-income students is critical",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: false },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-12",
        author: "Sarah Mitchell",
        content:
          "Warm referral from KIPP SF. Dr. Brooks very interested in first-gen student support features. Call scheduled Friday.",
      },
    ],
  },
  {
    id: "10",
    name: "Menlo-Atherton High School",
    status: "Onboarding",
    onboardingStep: "Step 1",
    priority: "High",
    schoolType: "Public",
    studentCount: 2300,
    staffCount: 175,
    district: "Sequoia Union High School District",
    address: "555 Middlefield Road, Atherton, CA 94027",
    lastContactDate: "2024-12-11",
    nextFollowUp: "2024-12-14",
    proposalDeadline: null,
    contractValue: 62000,
    contractLink: "https://contracts.willow.com/menlo-atherton",
    willowStaffLead: "Michael Torres",
    leadContact: {
      name: "Principal Simone Kennel",
      title: "Principal",
      email: "s.kennel@seq.org",
      phone: "(650) 555-0234",
    },
    summary:
      "Menlo-Atherton serves a socioeconomically diverse student body and wants Willow Staff to ensure equitable access to college and career resources. They're focused on closing opportunity gaps between students from different backgrounds while managing high expectations from all families.",
    painPoints: [
      "Significant equity gaps in college enrollment outcomes",
      "Affluent families dominate counselor time for college prep",
      "Under-resourced students miss scholarship deadlines",
      "Career technical education stigmatized vs college prep",
    ],
    onboardingChecklist: [
      { task: "Sign Contract", completed: true },
      { task: "Kickoff Call", completed: false },
      { task: "Scope and Sequence", completed: false },
      { task: "Staff Roster Import", completed: false },
      { task: "Student Roster Import", completed: false },
      { task: "Curriculum Upload", completed: false },
      { task: "Initial Training", completed: false },
    ],
    notes: [
      {
        date: "2024-12-11",
        author: "Michael Torres",
        content:
          "Contract signed yesterday! Scheduling kickoff call. Principal emphasized equity in college access as top priority.",
      },
      {
        date: "2024-12-06",
        author: "Michael Torres",
        content:
          "Final negotiations complete. Excited to support their equity-focused approach.",
      },
    ],
  },
];

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
  Monitoring: "bg-yellow-100 text-yellow-800",
  Poor: "bg-red-100 text-red-800",
  Fair: "bg-blue-100 text-blue-800",
  Strong: "bg-green-100 text-green-800",
};

export const statusOrder: PartnerStatus[] = [
  "New Lead",
  "Contacted",
  "Proposal Sent",
  "Contract Preparation",
  "Onboarding",
  "Active",
];
