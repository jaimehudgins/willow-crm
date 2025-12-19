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
  Loader2,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { usePartners } from "@/hooks/usePartners";

export default function DashboardPage() {
  const { partners, loading, error } = usePartners();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

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

  const goodPartners = activePartners
    .filter((p) => p.partnershipHealth === "Good")
    .map((p) => ({ id: p.id, name: p.name }));

  const fairPartners = activePartners
    .filter((p) => p.partnershipHealth === "Fair")
    .map((p) => ({ id: p.id, name: p.name }));

  const atRiskPartners = activePartners
    .filter((p) => p.partnershipHealth === "At Risk")
    .map((p) => ({ id: p.id, name: p.name }));

  const monitoringPartners = activePartners
    .filter((p) => p.partnershipHealth === "Monitoring (New)")
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Overview of your partnerships and pipeline
        </p>
      </div>

      {/* Active Partners Section */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Active Partners ({activePartners.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Strong"
            value={strongPartners.length}
            icon={ThumbsUp}
            description="Excellent health"
            schools={strongPartners}
          />
          <MetricCard
            title="Good"
            value={goodPartners.length}
            icon={Activity}
            description="Healthy partnerships"
            schools={goodPartners}
          />
          <MetricCard
            title="Fair"
            value={fairPartners.length}
            icon={Eye}
            description="Stable partnerships"
            schools={fairPartners}
          />
          <MetricCard
            title="At Risk"
            value={atRiskPartners.length}
            icon={AlertTriangle}
            description="Needs attention"
            schools={atRiskPartners}
          />
          <MetricCard
            title="Monitoring (New)"
            value={monitoringPartners.length}
            icon={School}
            description="New active partners"
            schools={monitoringPartners}
          />
        </div>
      </div>

      {/* Potential Partners Section */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Potential Partners ({pipelineSchools.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total in Pipeline"
            value={pipelineSchools.length}
            icon={School}
            description="Partners in pipeline"
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
        <UpcomingTasks partners={partners} />
        <RecentActivity partners={partners} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <PipelineChart partners={partners} />
      </div>
    </div>
  );
}
