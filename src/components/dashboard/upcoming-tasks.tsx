"use client";

import Link from "next/link";
import { Circle, ChevronRight, Clock, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/data/partners";
import { formatDate } from "@/lib/utils";

interface UpcomingItem {
  id: string;
  type: "task" | "onboarding" | "followup";
  title: string;
  dueDate: string | null;
  completed: boolean;
  partnerId: string;
  partnerName: string;
  noteId?: string;
}

interface UpcomingTasksProps {
  partners: Partner[];
  limit?: number;
}

export function UpcomingTasks({ partners, limit = 7 }: UpcomingTasksProps) {
  // Collect all upcoming items from all partners
  const allItems: UpcomingItem[] = [];

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

  // Filter out completed and sort by due date
  const pendingItems = allItems
    .filter((item) => !item.completed)
    .sort((a, b) => {
      // Items without due dates go to the end
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, limit);

  const today = new Date().toISOString().split("T")[0];

  const getTypeLabel = (type: UpcomingItem["type"]) => {
    switch (type) {
      case "task":
        return "Task";
      case "followup":
        return "Follow-up";
      case "onboarding":
        return "Onboarding";
    }
  };

  const getTypeColor = (type: UpcomingItem["type"]) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Upcoming Tasks
          </CardTitle>
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {pendingItems.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-4">
            No upcoming tasks
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingItems.map((item) => (
              <Link
                key={item.id}
                href={`/partners/${item.partnerId}`}
                className="block"
              >
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  <Circle className="h-4 w-4 mt-0.5 text-[var(--muted-foreground)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)] truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                      className={`flex items-center gap-1 text-xs shrink-0 ${
                        isOverdue(item.dueDate)
                          ? "text-red-600 font-medium"
                          : isDueToday(item.dueDate)
                            ? "text-amber-600 font-medium"
                            : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {isOverdue(item.dueDate)
                        ? "Overdue"
                        : isDueToday(item.dueDate)
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
  );
}
