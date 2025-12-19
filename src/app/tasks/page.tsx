"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  ListTodo,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePartners } from "@/hooks/usePartners";
import { formatDate } from "@/lib/utils";

interface TaskItem {
  id: string;
  type: "task" | "onboarding" | "followup";
  title: string;
  dueDate: string | null;
  completed: boolean;
  partnerId: string;
  partnerName: string;
  noteId?: string;
}

type FilterType = "all" | "task" | "onboarding" | "followup";
type StatusFilter = "pending" | "completed" | "all";

export default function TasksPage() {
  const { partners, loading, error } = usePartners();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");

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
          <p className="text-red-600">Error loading tasks: {error}</p>
        </div>
      </div>
    );
  }

  // Collect all items from all partners
  const allItems: TaskItem[] = [];

  partners.forEach((partner) => {
    // Standalone tasks
    (partner.tasks || []).forEach((task) => {
      allItems.push({
        id: task.id,
        type: "task",
        title: task.task,
        dueDate: task.dueDate,
        completed: task.completed,
        partnerId: partner.id,
        partnerName: partner.name,
      });
    });

    // Follow-up tasks from notes
    partner.notes.forEach((note) => {
      (note.followUpTasks || []).forEach((task) => {
        allItems.push({
          id: task.id,
          type: "followup",
          title: task.task,
          dueDate: task.dueDate,
          completed: task.completed,
          partnerId: partner.id,
          partnerName: partner.name,
          noteId: note.id,
        });
      });
    });

    // Onboarding tasks with due dates
    partner.onboardingChecklist.forEach((task, index) => {
      if (task.dueDate) {
        allItems.push({
          id: `${partner.id}-onboarding-${index}`,
          type: "onboarding",
          title: task.task,
          dueDate: task.dueDate,
          completed: task.completed,
          partnerId: partner.id,
          partnerName: partner.name,
        });
      }
    });
  });

  // Apply filters
  let filteredItems = allItems;

  if (typeFilter !== "all") {
    filteredItems = filteredItems.filter((item) => item.type === typeFilter);
  }

  if (statusFilter === "pending") {
    filteredItems = filteredItems.filter((item) => !item.completed);
  } else if (statusFilter === "completed") {
    filteredItems = filteredItems.filter((item) => item.completed);
  }

  if (partnerFilter !== "all") {
    filteredItems = filteredItems.filter(
      (item) => item.partnerId === partnerFilter
    );
  }

  // Sort by due date
  filteredItems.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const today = new Date().toISOString().split("T")[0];

  const getTypeLabel = (type: TaskItem["type"]) => {
    switch (type) {
      case "task":
        return "Task";
      case "followup":
        return "Follow-up";
      case "onboarding":
        return "Onboarding";
    }
  };

  const getTypeColor = (type: TaskItem["type"]) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800";
      case "followup":
        return "bg-purple-100 text-purple-800";
      case "onboarding":
        return "bg-indigo-100 text-indigo-800";
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return dueDate < today;
  };

  const isDueToday = (dueDate: string | null) => {
    if (!dueDate) return false;
    return dueDate === today;
  };

  const pendingCount = allItems.filter((item) => !item.completed).length;
  const overdueCount = allItems.filter(
    (item) => !item.completed && isOverdue(item.dueDate)
  ).length;
  const dueTodayCount = allItems.filter(
    (item) => !item.completed && isDueToday(item.dueDate)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          Tasks
        </h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          All tasks across your partners
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {pendingCount}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Pending Tasks
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{dueTodayCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Due Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="followup">Follow-ups</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1">
                Partner
              </label>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="all">All Partners</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredItems.length} {filteredItems.length === 1 ? "Task" : "Tasks"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-8">
              No tasks match your filters
            </p>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/partners/${item.partnerId}`}
                  className="block"
                >
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors ${
                      item.completed ? "opacity-60" : ""
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 mt-0.5 text-[var(--muted-foreground)] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          item.completed
                            ? "line-through text-[var(--muted-foreground)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getTypeColor(item.type)}`}
                        >
                          {getTypeLabel(item.type)}
                        </Badge>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {item.partnerName}
                        </span>
                      </div>
                    </div>
                    {item.dueDate && (
                      <div
                        className={`flex items-center gap-1 text-sm shrink-0 ${
                          item.completed
                            ? "text-[var(--muted-foreground)]"
                            : isOverdue(item.dueDate)
                              ? "text-red-600 font-medium"
                              : isDueToday(item.dueDate)
                                ? "text-amber-600 font-medium"
                                : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {isOverdue(item.dueDate) && !item.completed
                          ? "Overdue"
                          : isDueToday(item.dueDate) && !item.completed
                            ? "Today"
                            : formatDate(item.dueDate)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
