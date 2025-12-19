"use client";

import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Circle,
  ChevronRight,
  Clock,
  ListTodo,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Partner } from "@/data/partners";
import { formatDate } from "@/lib/utils";

interface UpcomingItem {
  id: string;
  type: "task" | "onboarding" | "followup" | "meeting";
  title: string;
  dueDate: string | null;
  completed: boolean;
  partnerId: string;
  partnerName: string;
  noteId?: string;
  meetingLink?: string;
}

interface NextMeeting {
  summary: string;
  start: string;
  htmlLink: string;
}

interface UpcomingTasksProps {
  partners: Partner[];
  meetings?: Record<string, NextMeeting>;
  limit?: number;
}

export function UpcomingTasks({
  partners,
  meetings = {},
  limit = 7,
}: UpcomingTasksProps) {
  // Collect all upcoming items from all partners
  const allItems: UpcomingItem[] = [];

  partners.forEach((partner) => {
    // Calendar meetings
    const meeting = meetings[partner.id];
    if (meeting) {
      allItems.push({
        id: `meeting-${partner.id}`,
        type: "meeting",
        title: meeting.summary,
        dueDate: meeting.start.split("T")[0],
        completed: false,
        partnerId: partner.id,
        partnerName: partner.name,
        meetingLink: meeting.htmlLink,
      });
    }

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
      case "meeting":
        return "Meeting";
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
      case "meeting":
        return "bg-green-100 text-green-800";
    }
  };

  const getIcon = (type: UpcomingItem["type"]) => {
    if (type === "meeting") {
      return <Video className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />;
    }
    return (
      <Circle className="h-4 w-4 mt-0.5 text-[var(--muted-foreground)] shrink-0" />
    );
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return dueDate < today;
  };

  const isDueToday = (dueDate: string | null) => {
    if (!dueDate) return false;
    return dueDate === today;
  };

  const formatMeetingTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Upcoming
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
            No upcoming tasks or meetings
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingItems.map((item) => {
              const content = (
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  {getIcon(item.type)}
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
                        item.type === "meeting"
                          ? "text-green-600 font-medium"
                          : isOverdue(item.dueDate)
                            ? "text-red-600 font-medium"
                            : isDueToday(item.dueDate)
                              ? "text-amber-600 font-medium"
                              : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {item.type === "meeting"
                        ? isDueToday(item.dueDate)
                          ? `Today ${formatMeetingTime(meetings[item.partnerId]?.start || "")}`
                          : `${formatDate(item.dueDate)} ${formatMeetingTime(meetings[item.partnerId]?.start || "")}`
                        : isOverdue(item.dueDate)
                          ? "Overdue"
                          : isDueToday(item.dueDate)
                            ? "Today"
                            : formatDate(item.dueDate)}
                    </div>
                  )}
                </div>
              );

              // Meetings link to Google Calendar, tasks link to partner page
              if (item.type === "meeting" && item.meetingLink) {
                return (
                  <a
                    key={item.id}
                    href={item.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={`/partners/${item.partnerId}`}
                  className="block"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
