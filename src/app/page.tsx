"use client";

import {
  School,
  UserPlus,
  FileText,
  CheckCircle,
  Activity,
  AlertTriangle,
  ThumbsUp,
  Eye,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { partners } from "@/data/partners";

export default function DashboardPage() {
  // Pipeline schools (non-active)
  const pipelineSchools = partners.filter((p) => p.status !== "Active");

  const onboardingSchoolsList = pipelineSchools
    .filter((p) => p.status === "Onboarding")
    .map((p) => ({ id: p.id, name: p.name }));

  const pendingDealsList = pipelineSchools
    .filter(
      (p) =>
        p.status === "Proposal Sent" || p.status === "Contract Preparation",
    )
    .map((p) => ({ id: p.id, name: p.name }));

  const newLeadsList = pipelineSchools
    .filter((p) => p.status === "New Lead" || p.status === "Contacted")
    .map((p) => ({ id: p.id, name: p.name }));

  // Active partners by health status
  const activePartners = partners.filter((p) => p.status === "Active");

  const strongPartners = activePartners
    .filter((p) => p.partnershipHealth === "Strong")
    .map((p) => ({ id: p.id, name: p.name }));

  const fairPartners = activePartners
    .filter((p) => p.partnershipHealth === "Fair")
    .map((p) => ({ id: p.id, name: p.name }));

  const monitoringPartners = activePartners
    .filter((p) => p.partnershipHealth === "Monitoring")
    .map((p) => ({ id: p.id, name: p.name }));

  const poorPartners = activePartners
    .filter((p) => p.partnershipHealth === "Poor")
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Overview of your school partnerships and pipeline
        </p>
      </div>

      {/* Active Partners Section */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Active Partners ({activePartners.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Strong"
            value={strongPartners.length}
            icon={ThumbsUp}
            description="Healthy partnerships"
            schools={strongPartners}
          />
          <MetricCard
            title="Fair"
            value={fairPartners.length}
            icon={Activity}
            description="Stable partnerships"
            schools={fairPartners}
          />
          <MetricCard
            title="Monitoring"
            value={monitoringPartners.length}
            icon={Eye}
            description="Needs attention"
            schools={monitoringPartners}
          />
          <MetricCard
            title="Poor"
            value={poorPartners.length}
            icon={AlertTriangle}
            description="At risk"
            schools={poorPartners}
          />
        </div>
      </div>

      {/* Pipeline Section */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Pipeline ({pipelineSchools.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total in Pipeline"
            value={pipelineSchools.length}
            icon={School}
            description="Schools in pipeline"
            schools={pipelineSchools.map((p) => ({ id: p.id, name: p.name }))}
          />
          <MetricCard
            title="New Leads"
            value={newLeadsList.length}
            icon={UserPlus}
            description="New & contacted"
            schools={newLeadsList}
          />
          <MetricCard
            title="Pending Deals"
            value={pendingDealsList.length}
            icon={FileText}
            description="Proposals & contracts"
            schools={pendingDealsList}
          />
          <MetricCard
            title="Onboarding"
            value={onboardingSchoolsList.length}
            icon={CheckCircle}
            description="In progress"
            schools={onboardingSchoolsList}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <PipelineChart />
        <RecentActivity />
      </div>
    </div>
  );
}
