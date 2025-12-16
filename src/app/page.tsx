import {
  School,
  UserPlus,
  FileText,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { partners } from "@/data/partners";

export default function DashboardPage() {
  const totalSchools = partners.length;
  const activeOnboardings = partners.filter(
    (p) => p.status === "Onboarding",
  ).length;
  const proposalsPending = partners.filter(
    (p) => p.status === "Proposal Sent" || p.status === "Contract Review",
  ).length;
  const activeSchools = partners.filter((p) => p.status === "Active").length;
  const pipelineValue = partners
    .filter((p) => p.contractValue && p.status !== "Active")
    .reduce((sum, p) => sum + (p.contractValue || 0), 0);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Schools"
          value={totalSchools}
          icon={School}
          description="All schools in pipeline"
        />
        <MetricCard
          title="Active Schools"
          value={activeSchools}
          icon={CheckCircle}
          description="Fully onboarded"
        />
        <MetricCard
          title="Onboarding"
          value={activeOnboardings}
          icon={UserPlus}
          description="In progress"
        />
        <MetricCard
          title="Pending Deals"
          value={proposalsPending}
          icon={FileText}
          description="Proposals & contracts"
        />
        <MetricCard
          title="Pipeline Value"
          value={`$${(pipelineValue / 1000).toFixed(0)}k`}
          icon={DollarSign}
          description="Annual contract value"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <PipelineChart />
        <RecentActivity />
      </div>
    </div>
  );
}
