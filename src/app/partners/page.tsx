"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronRight,
  Users,
  GraduationCap,
  Mail,
  Loader2,
  AlertTriangle,
  Plus,
  X,
  Building,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  statusColors,
  priorityColors,
  leadSourceColors,
  onboardingStepColors,
  partnershipHealthColors,
  renewalStatusColors,
  statusOrder,
  type PartnerStatus,
  type RenewalStatus,
} from "@/data/partners";
import { formatDate } from "@/lib/utils";
import { usePartners } from "@/hooks/usePartners";
import { supabase } from "@/lib/supabase";

interface NextMeeting {
  summary: string;
  start: string;
  htmlLink: string;
}

export default function PartnersPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { partners, loading, error, refetch } = usePartners();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | "all">(
    "all",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    schoolType: "Public",
    district: "",
    city_state: "",
  });
  const [nextMeetings, setNextMeetings] = useState<Record<string, NextMeeting>>(
    {},
  );
  const [loadingMeetings, setLoadingMeetings] = useState(false);

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

      setLoadingMeetings(true);
      try {
        const response = await fetch("/api/calendar/next-meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerEmails }),
        });

        if (response.ok) {
          const data = await response.json();
          setNextMeetings(data);
        }
      } catch (err) {
        console.error("Failed to fetch calendar meetings:", err);
      } finally {
        setLoadingMeetings(false);
      }
    }

    fetchMeetings();
  }, [sessionStatus, session?.accessToken, partners]);

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch =
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.willowStaffLead
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        partner.leadContact.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        partner.leadContact.email
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        partner.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || partner.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchQuery, statusFilter]);

  const getNextAction = (partner: (typeof partners)[0]) => {
    // Check for calendar meeting first
    const meeting = nextMeetings[partner.id];
    if (meeting) {
      return {
        type: "meeting" as const,
        date: formatDate(meeting.start),
        summary: meeting.summary,
        link: meeting.htmlLink,
      };
    }
    if (partner.nextFollowUp) {
      return {
        type: "followup" as const,
        date: formatDate(partner.nextFollowUp),
      };
    }
    if (partner.proposalDeadline) {
      return {
        type: "deadline" as const,
        date: formatDate(partner.proposalDeadline),
      };
    }
    return null;
  };

  const handleCreatePartner = async () => {
    if (!newPartner.name.trim()) return;

    setIsCreating(true);
    try {
      const { data, error: createError } = await supabase
        .from("partners")
        .insert({
          name: newPartner.name,
          school_type: newPartner.schoolType,
          district: newPartner.district,
          city_state: newPartner.city_state,
          status: "New Lead",
          priority: "Medium",
        })
        .select()
        .single();

      if (createError) throw createError;

      setShowAddModal(false);
      setNewPartner({
        name: "",
        schoolType: "Public",
        district: "",
        city_state: "",
      });
      await refetch();

      if (data) {
        router.push(`/partners/${data.id}`);
      }
    } catch (err) {
      console.error("Failed to create partner:", err);
      alert("Failed to create partner. Check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Partner Directory
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Manage and track all your partnerships
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--background)] rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Partner</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Partner Name *
                </label>
                <Input
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter partner name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Partner Type
                </label>
                <select
                  value={newPartner.schoolType}
                  onChange={(e) =>
                    setNewPartner((prev) => ({
                      ...prev,
                      schoolType: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  <option value="Public">Public</option>
                  <option value="Charter">Charter</option>
                  <option value="Non-Profit">Non-Profit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  District
                </label>
                <Input
                  value={newPartner.district}
                  onChange={(e) =>
                    setNewPartner((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))
                  }
                  placeholder="Enter district name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  City, State
                </label>
                <Input
                  value={newPartner.city_state}
                  onChange={(e) =>
                    setNewPartner((prev) => ({
                      ...prev,
                      city_state: e.target.value,
                    }))
                  }
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreatePartner}
                disabled={isCreating || !newPartner.name.trim()}
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Partner
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Partners ({partners.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Search partners, contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as PartnerStatus | "all")
                  }
                  className="h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <option value="all">All Statuses</option>
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                    Partner
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                    Status
                  </th>
                  <th className="hidden pb-3 text-left text-sm font-medium text-[var(--muted-foreground)] lg:table-cell">
                    Contact
                  </th>
                  <th className="hidden pb-3 text-left text-sm font-medium text-[var(--muted-foreground)] md:table-cell">
                    Willow Lead
                  </th>
                  <th className="hidden pb-3 text-left text-sm font-medium text-[var(--muted-foreground)] sm:table-cell">
                    Next Follow-up
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-[var(--muted-foreground)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="group transition-colors hover:bg-[var(--muted)]"
                  >
                    <td className="py-4 pr-4">
                      <Link href={`/partners/${partner.id}`} className="block">
                        <span className="font-medium text-[var(--foreground)] hover:text-indigo-600">
                          {partner.name}
                        </span>
                        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {partner.schoolCount ?? 1}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {(partner.studentCount ?? 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {partner.staffCount ?? 0}
                          </span>
                          <span>{partner.schoolType}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge className={statusColors[partner.status]}>
                            {partner.status}
                          </Badge>
                          {partner.status === "New Lead" &&
                            partner.leadSource && (
                              <Badge
                                className={leadSourceColors[partner.leadSource]}
                              >
                                {partner.leadSource}
                              </Badge>
                            )}
                          {partner.status === "Onboarding" &&
                            partner.onboardingStep && (
                              <Badge
                                className={
                                  onboardingStepColors[partner.onboardingStep]
                                }
                              >
                                {partner.onboardingStep}
                              </Badge>
                            )}
                        </div>
                        {partner.status === "Active" ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {partner.partnershipHealth && (
                              <Badge
                                className={`${partnershipHealthColors[partner.partnershipHealth]} w-fit`}
                              >
                                {partner.partnershipHealth}
                              </Badge>
                            )}
                            {partner.renewalStatus && (
                              <Badge
                                className={`${renewalStatusColors[partner.renewalStatus as RenewalStatus]} w-fit`}
                              >
                                {partner.renewalStatus}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge
                            className={`${priorityColors[partner.priority]} w-fit`}
                          >
                            {partner.priority}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="hidden py-4 pr-4 lg:table-cell">
                      <div className="text-sm">
                        <p className="font-medium text-[var(--foreground)]">
                          {partner.leadContact.name}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {partner.leadContact.role}
                        </p>
                        <a
                          href={`mailto:${partner.leadContact.email}`}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3 w-3" />
                          {partner.leadContact.email}
                        </a>
                      </div>
                    </td>
                    <td className="hidden py-4 pr-4 text-[var(--muted-foreground)] md:table-cell">
                      {partner.willowStaffLead}
                    </td>
                    <td className="hidden py-4 pr-4 text-[var(--muted-foreground)] sm:table-cell">
                      {(() => {
                        const action = getNextAction(partner);
                        if (!action) return "—";
                        if (action.type === "meeting") {
                          return (
                            <a
                              href={action.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-indigo-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                              title={action.summary}
                            >
                              <Calendar className="h-3 w-3" />
                              {action.date}
                            </a>
                          );
                        }
                        return action.date;
                      })()}
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/partners/${partner.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredPartners.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-[var(--muted-foreground)]"
                    >
                      No partners found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
