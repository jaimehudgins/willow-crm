"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  ListTodo,
  Loader2,
  AlertTriangle,
  Search,
  Pause,
  Play,
  Hourglass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePartners } from "@/hooks/usePartners";
import { formatDate } from "@/lib/utils";
import { type TaskStatus, taskStatusColors } from "@/data/partners";
import { supabase } from "@/lib/supabase";

interface TaskItem {
  id: string;
  type: "task" | "onboarding" | "followup";
  title: string;
  dueDate: string | null;
  completed: boolean;
  status: TaskStatus;
  partnerId: string;
  partnerName: string;
  noteId?: string;
}

type FilterType = "all" | "task" | "onboarding" | "followup";
type StatusFilter = TaskStatus | "all" | "active";

const STATUS_OPTIONS: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Waiting",
  "Paused",
  "Complete",
];

export default function TasksPage() {
  const { partners, loading, error, refetch } = usePartners();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

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
        status: task.status || "Not Started",
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
          status: task.status || "Not Started",
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
          status: task.completed ? "Complete" : "Not Started",
          partnerId: partner.id,
          partnerName: partner.name,
        });
      }
    });
  });

  // Apply filters
  let filteredItems = allItems;

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.partnerName.toLowerCase().includes(query),
    );
  }

  if (typeFilter !== "all") {
    filteredItems = filteredItems.filter((item) => item.type === typeFilter);
  }

  if (statusFilter === "active") {
    filteredItems = filteredItems.filter((item) => item.status !== "Complete");
  } else if (statusFilter !== "all") {
    filteredItems = filteredItems.filter(
      (item) => item.status === statusFilter,
    );
  }

  if (partnerFilter !== "all") {
    filteredItems = filteredItems.filter(
      (item) => item.partnerId === partnerFilter,
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
        return "bg-teal-100 text-teal-800";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "Complete":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "In Progress":
        return <Play className="h-5 w-5 text-blue-600" />;
      case "Waiting":
        return <Hourglass className="h-5 w-5 text-yellow-600" />;
      case "Paused":
        return <Pause className="h-5 w-5 text-orange-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
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

  const activeCount = allItems.filter(
    (item) => item.status !== "Complete",
  ).length;
  const overdueCount = allItems.filter(
    (item) => item.status !== "Complete" && isOverdue(item.dueDate),
  ).length;
  const dueTodayCount = allItems.filter(
    (item) => item.status !== "Complete" && isDueToday(item.dueDate),
  ).length;

  const handleStatusChange = async (
    taskId: string,
    newStatus: TaskStatus,
    taskType: TaskItem["type"],
  ) => {
    // Onboarding tasks use a different system
    if (taskType === "onboarding") return;

    setUpdatingTaskId(taskId);
    try {
      const { error: updateError } = await supabase
        .from("follow_up_tasks")
        .update({
          status: newStatus,
          completed: newStatus === "Complete",
        })
        .eq("id", taskId);

      if (updateError) throw updateError;

      // Refetch to update the UI
      await refetch();
    } catch (err) {
      console.error("Error updating task status:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

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
                {activeCount}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Active Tasks
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">
                {dueTodayCount}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Due Today
              </p>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Search tasks or partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="active">Active (Not Complete)</option>
                <option value="all">All</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting">Waiting</option>
                <option value="Paused">Paused</option>
                <option value="Complete">Complete</option>
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
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "Task" : "Tasks"}
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
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors ${
                    item.status === "Complete" ? "opacity-60" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {updatingTaskId === item.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                    ) : (
                      getStatusIcon(item.status)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/partners/${item.partnerId}`}>
                      <p
                        className={`text-sm hover:underline ${
                          item.status === "Complete"
                            ? "line-through text-[var(--muted-foreground)]"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        {item.title}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getTypeColor(item.type)}`}
                      >
                        {getTypeLabel(item.type)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${taskStatusColors[item.status]}`}
                      >
                        {item.status}
                      </Badge>
                      <Link href={`/partners/${item.partnerId}`}>
                        <span className="text-xs text-[var(--muted-foreground)] hover:underline">
                          {item.partnerName}
                        </span>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.dueDate && (
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          item.status === "Complete"
                            ? "text-[var(--muted-foreground)]"
                            : isOverdue(item.dueDate)
                              ? "text-red-600 font-medium"
                              : isDueToday(item.dueDate)
                                ? "text-amber-600 font-medium"
                                : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {isOverdue(item.dueDate) && item.status !== "Complete"
                          ? "Overdue"
                          : isDueToday(item.dueDate) &&
                              item.status !== "Complete"
                            ? "Today"
                            : formatDate(item.dueDate)}
                      </div>
                    )}
                    {item.type !== "onboarding" && (
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as TaskStatus,
                            item.type,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={updatingTaskId === item.id}
                        className={`rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs ${taskStatusColors[item.status]}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
