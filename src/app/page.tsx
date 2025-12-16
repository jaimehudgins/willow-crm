import { School, UserPlus, FileText, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { partners } from "@/data/partners";

export default function DashboardPage() {
  const allSchools = partners.map((p) => ({ id: p.id, name: p.name }));

  const activeSchoolsList = partners
    .filter((p) => p.status === "Active")
    .map((p) => ({ id: p.id, name: p.name }));

  const onboardingSchoolsList = partners
    .filter((p) => p.status === "Onboarding")
    .map((p) => ({ id: p.id, name: p.name }));

  const pendingDealsList = partners
    .filter(
      (p) =>
        p.status === "Proposal Sent" || p.status === "Contract Preparation",
    )
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Schools"
          value={allSchools.length}
          icon={School}
          description="All schools in pipeline"
          schools={allSchools}
        />
        <MetricCard
          title="Active Schools"
          value={activeSchoolsList.length}
          icon={CheckCircle}
          description="Fully onboarded"
          schools={activeSchoolsList}
        />
        <MetricCard
          title="Onboarding"
          value={onboardingSchoolsList.length}
          icon={UserPlus}
          description="In progress"
          schools={onboardingSchoolsList}
        />
        <MetricCard
          title="Pending Deals"
          value={pendingDealsList.length}
          icon={FileText}
          description="Proposals & contracts"
          schools={pendingDealsList}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <PipelineChart />
        <RecentActivity />
      </div>
    </div>
  );
}
