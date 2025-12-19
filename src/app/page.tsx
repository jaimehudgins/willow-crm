"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  RefreshCw,
  MessageCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import { usePartners } from "@/hooks/usePartners";

interface NextMeeting {
  summary: string;
  start: string;
  htmlLink: string;
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { partners, loading, error } = usePartners();
  const [meetings, setMeetings] = useState<Record<string, NextMeeting>>({});
  const [showRenewals, setShowRenewals] = useState(false);

  // Fetch calendar meetings when authenticated and partners are loaded
  useEffect(() => {
    async function fetchMeetings() {
      if (sessionStatus !== "authenticated" || !session?.accessToken) return;
      if (partners.length === 0) return;

      // Build map of partner IDs to contact emails
      const partnerEmails: Record<string, string[]> = {};
      for (const partner of partners) {
        const emails: string[] = [];
        if (partner.leadContact?.email) {
          emails.push(partner.leadContact.email);
        }
        if (partner.contacts) {
          for (const contact of partner.contacts) {
            if (contact.email) emails.push(contact.email);
          }
        }
        if (emails.length > 0) {
          partnerEmails[partner.id] = emails;
        }
      }

      if (Object.keys(partnerEmails).length === 0) return;

      try {
        const response = await fetch("/api/calendar/next-meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerEmails }),
        });

        if (response.ok) {
          const data = await response.json();
          setMeetings(data);
        }
      } catch (err) {
        console.error("Failed to fetch calendar meetings:", err);
      }
    }

    fetchMeetings();
  }, [sessionStatus, session?.accessToken, partners]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
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

  const thrivingPartners = activePartners
    .filter((p) => p.partnershipHealth === "Thriving")
    .map((p) => ({ id: p.id, name: p.name }));

  const healthyPartners = activePartners
    .filter((p) => p.partnershipHealth === "Healthy")
    .map((p) => ({ id: p.id, name: p.name }));

  const waveringPartners = activePartners
    .filter((p) => p.partnershipHealth === "Wavering")
    .map((p) => ({ id: p.id, name: p.name }));

  const stalledPartners = activePartners
    .filter((p) => p.partnershipHealth === "Stalled")
    .map((p) => ({ id: p.id, name: p.name }));

  const monitoringPartners = activePartners
    .filter((p) => p.partnershipHealth === "Monitoring (New)")
    .map((p) => ({ id: p.id, name: p.name }));

  // Active partners by renewal status
  const confirmedRenewals = activePartners
    .filter((p) => p.renewalStatus === "Confirmed")
    .map((p) => ({ id: p.id, name: p.name }));

  const inDiscussionRenewals = activePartners
    .filter((p) => p.renewalStatus === "In Discussion")
    .map((p) => ({ id: p.id, name: p.name }));

  const atRiskRenewals = activePartners
    .filter((p) => p.renewalStatus === "At Risk")
    .map((p) => ({ id: p.id, name: p.name }));

  const notRenewingPartners = activePartners
    .filter((p) => p.renewalStatus === "Not Renewing")
    .map((p) => ({ id: p.id, name: p.name }));

  const notYetDeterminedRenewals = activePartners
    .filter((p) => !p.renewalStatus || p.renewalStatus === "Not Yet Determined")
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
            title="Thriving"
            value={thrivingPartners.length}
            icon={ThumbsUp}
            schools={thrivingPartners}
            total={activePartners.length}
          />
          <MetricCard
            title="Healthy"
            value={healthyPartners.length}
            icon={Activity}
            schools={healthyPartners}
            total={activePartners.length}
          />
          <MetricCard
            title="Wavering"
            value={waveringPartners.length}
            icon={Eye}
            schools={waveringPartners}
            total={activePartners.length}
          />
          <MetricCard
            title="Stalled"
            value={stalledPartners.length}
            icon={AlertTriangle}
            schools={stalledPartners}
            total={activePartners.length}
          />
          <MetricCard
            title="Monitoring (New)"
            value={monitoringPartners.length}
            icon={School}
            schools={monitoringPartners}
            total={activePartners.length}
          />
        </div>

        {/* 2026-27 Renewal Status Row */}
        <button
          onClick={() => setShowRenewals(!showRenewals)}
          className="flex items-center gap-2 text-md font-medium text-[var(--muted-foreground)] mt-6 mb-3 hover:text-[var(--foreground)] transition-colors"
        >
          {showRenewals ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          2026-27 Renewals
        </button>
        {showRenewals && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Confirmed"
              value={confirmedRenewals.length}
              icon={CheckCircle}
              description="Renewing"
              schools={confirmedRenewals}
              total={activePartners.length}
            />
            <MetricCard
              title="In Discussion"
              value={inDiscussionRenewals.length}
              icon={MessageCircle}
              description="Talking about renewal"
              schools={inDiscussionRenewals}
              total={activePartners.length}
            />
            <MetricCard
              title="At Risk"
              value={atRiskRenewals.length}
              icon={AlertTriangle}
              description="May not renew"
              schools={atRiskRenewals}
              total={activePartners.length}
            />
            <MetricCard
              title="Not Renewing"
              value={notRenewingPartners.length}
              icon={XCircle}
              description="Won't continue"
              schools={notRenewingPartners}
              total={activePartners.length}
            />
            <MetricCard
              title="Not Yet Determined"
              value={notYetDeterminedRenewals.length}
              icon={HelpCircle}
              description="To be discussed"
              schools={notYetDeterminedRenewals}
              total={activePartners.length}
            />
          </div>
        )}
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
        <UpcomingMeetings partners={partners} meetings={meetings} />
        <UpcomingTasks partners={partners} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentActivity partners={partners} />
        <PipelineChart partners={partners} />
      </div>
    </div>
  );
}
