"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { partners, statusOrder, type PartnerStatus } from "@/data/partners";

const statusBarColors: Record<PartnerStatus, string> = {
  "New Lead": "bg-blue-500",
  Contacted: "bg-yellow-500",
  "Proposal Sent": "bg-purple-500",
  "Contract Preparation": "bg-orange-500",
  Onboarding: "bg-indigo-500",
  Active: "bg-green-500",
};

const leadSourceColors = {
  Website: "bg-sky-400",
  Warm: "bg-pink-400",
};

const onboardingStepColors = {
  "Step 1": "bg-violet-400",
  "Step 2": "bg-fuchsia-400",
  "Step 3": "bg-rose-400",
};

export function PipelineChart() {
  const statusCounts = statusOrder.map((status) => {
    const schoolsInStatus = partners.filter((p) => p.status === status);
    const totalValue = schoolsInStatus.reduce(
      (sum, p) => sum + (p.contractValue || 0),
      0,
    );

    // Get sub-category breakdown for New Lead
    let subCategories: { label: string; count: number; color: string }[] = [];

    if (status === "New Lead") {
      const websiteLeads = schoolsInStatus.filter(
        (p) => p.leadSource === "Website",
      ).length;
      const warmLeads = schoolsInStatus.filter(
        (p) => p.leadSource === "Warm",
      ).length;
      if (websiteLeads > 0 || warmLeads > 0) {
        subCategories = [
          {
            label: "Website",
            count: websiteLeads,
            color: leadSourceColors.Website,
          },
          { label: "Warm", count: warmLeads, color: leadSourceColors.Warm },
        ].filter((s) => s.count > 0);
      }
    }

    // Get sub-category breakdown for Onboarding
    if (status === "Onboarding") {
      const step1 = schoolsInStatus.filter(
        (p) => p.onboardingStep === "Step 1",
      ).length;
      const step2 = schoolsInStatus.filter(
        (p) => p.onboardingStep === "Step 2",
      ).length;
      const step3 = schoolsInStatus.filter(
        (p) => p.onboardingStep === "Step 3",
      ).length;
      if (step1 > 0 || step2 > 0 || step3 > 0) {
        subCategories = [
          {
            label: "Step 1",
            count: step1,
            color: onboardingStepColors["Step 1"],
          },
          {
            label: "Step 2",
            count: step2,
            color: onboardingStepColors["Step 2"],
          },
          {
            label: "Step 3",
            count: step3,
            color: onboardingStepColors["Step 3"],
          },
        ].filter((s) => s.count > 0);
      }
    }

    return {
      status,
      count: schoolsInStatus.length,
      value: totalValue,
      subCategories,
    };
  });

  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusCounts.map(({ status, count, value, subCategories }) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--foreground)]">
                  {status}
                </span>
                <span className="text-[var(--muted-foreground)]">
                  {count} school{count !== 1 ? "s" : ""}
                  {value > 0 && ` • $${(value / 1000).toFixed(0)}k`}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-[var(--muted)]">
                <div
                  className={`h-3 rounded-full transition-all ${statusBarColors[status]}`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              {subCategories.length > 0 && (
                <div className="ml-4 flex flex-wrap gap-3 text-xs">
                  {subCategories.map((sub) => (
                    <div key={sub.label} className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${sub.color}`} />
                      <span className="text-[var(--muted-foreground)]">
                        {sub.label}: {sub.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
