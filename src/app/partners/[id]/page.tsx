"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
  Circle,
  MapPin,
  GraduationCap,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  partners,
  statusColors,
  priorityColors,
  leadSourceColors,
  onboardingStepColors,
  type OnboardingTask,
} from "@/data/partners";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PartnerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const partner = partners.find((p) => p.id === id);

  const [checklist, setChecklist] = useState<OnboardingTask[]>(
    partner?.onboardingChecklist || [],
  );

  if (!partner) {
    notFound();
  }

  const toggleTask = (index: number) => {
    setChecklist((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const completedTasks = checklist.filter((t) => t.completed).length;
  const totalTasks = checklist.length;
  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/partners">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schools
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {partner.name}
            </h1>
            <Badge className={statusColors[partner.status]}>
              {partner.status}
            </Badge>
            {partner.status === "New Lead" && partner.leadSource && (
              <Badge className={leadSourceColors[partner.leadSource]}>
                {partner.leadSource}
              </Badge>
            )}
            {partner.status === "Onboarding" && partner.onboardingStep && (
              <Badge className={onboardingStepColors[partner.onboardingStep]}>
                {partner.onboardingStep}
              </Badge>
            )}
            <Badge className={priorityColors[partner.priority]}>
              {partner.priority} Priority
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {partner.schoolType}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {partner.studentCount.toLocaleString()} students
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {partner.staffCount} staff
            </span>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit School
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {partner.summary}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pain Points & Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {partner.painPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-[var(--muted-foreground)]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Dates & Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Last Contact
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatDate(partner.lastContactDate)}
                    </p>
                  </div>
                </div>
                {partner.nextFollowUp && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Next Follow-up
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(partner.nextFollowUp)}
                      </p>
                    </div>
                  </div>
                )}
                {partner.proposalDeadline && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Proposal Deadline
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(partner.proposalDeadline)}
                      </p>
                    </div>
                  </div>
                )}
                {partner.contractValue && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Contract Value
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        ${partner.contractValue.toLocaleString()}/year
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Contract
                    </p>
                    <a
                      href={partner.contractLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      View Contract
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Onboarding Checklist</CardTitle>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {completedTasks} of {totalTasks} completed
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {checklist.map((task, index) => (
                  <button
                    key={index}
                    onClick={() => toggleTask(index)}
                    className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] p-4 text-left transition-colors hover:bg-[var(--muted)]"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                    )}
                    <span
                      className={
                        task.completed
                          ? "text-[var(--muted-foreground)] line-through"
                          : "text-[var(--foreground)]"
                      }
                    >
                      {task.task}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partner.notes.map((note, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-indigo-200 pl-4"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[var(--foreground)]">
                        {note.author}
                      </span>
                      <span className="text-[var(--muted-foreground)]">•</span>
                      <span className="text-[var(--muted-foreground)]">
                        {formatDate(note.date)}
                      </span>
                    </div>
                    <p className="mt-1 text-[var(--muted-foreground)]">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  District
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {partner.district}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  {partner.address}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Willow Staff Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {partner.willowStaffLead}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Account Manager
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>School Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {partner.leadContact.name}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {partner.leadContact.title}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={`mailto:${partner.leadContact.email}`}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {partner.leadContact.email}
                  </a>
                  <a
                    href={`tel:${partner.leadContact.phone}`}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {partner.leadContact.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
