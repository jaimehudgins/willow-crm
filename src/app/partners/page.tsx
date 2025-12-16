"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronRight,
  Users,
  GraduationCap,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  partners,
  statusColors,
  priorityColors,
  leadSourceColors,
  onboardingStepColors,
  statusOrder,
  type PartnerStatus,
} from "@/data/partners";
import { formatDate } from "@/lib/utils";

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | "all">(
    "all",
  );

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
  }, [searchQuery, statusFilter]);

  const getNextAction = (partner: (typeof partners)[0]) => {
    if (partner.nextFollowUp) {
      return formatDate(partner.nextFollowUp);
    }
    if (partner.proposalDeadline) {
      return formatDate(partner.proposalDeadline);
    }
    return "—";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          School Directory
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Manage and track all your school partnerships
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Schools ({partners.length})</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Search schools, contacts..."
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
                    School
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
                            <GraduationCap className="h-3 w-3" />
                            {partner.studentCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {partner.staffCount}
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
                        <Badge
                          className={`${priorityColors[partner.priority]} w-fit`}
                        >
                          {partner.priority}
                        </Badge>
                      </div>
                    </td>
                    <td className="hidden py-4 pr-4 lg:table-cell">
                      <div className="text-sm">
                        <p className="font-medium text-[var(--foreground)]">
                          {partner.leadContact.name}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {partner.leadContact.title}
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
                      {getNextAction(partner)}
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
                      No schools found matching your criteria
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
