"use client";

import {
  Calendar,
  Clock,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Partner } from "@/data/partners";
import { formatDate } from "@/lib/utils";

interface NextMeeting {
  summary: string;
  start: string;
  htmlLink: string;
}

interface MeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  partnerId: string;
  partnerName: string;
  htmlLink: string;
}

interface UpcomingMeetingsProps {
  partners: Partner[];
  meetings: Record<string, NextMeeting>;
}

export function UpcomingMeetings({ partners, meetings }: UpcomingMeetingsProps) {
  const today = new Date().toISOString().split("T")[0];

  // Build list of meetings with partner info
  const meetingItems: MeetingItem[] = [];

  partners.forEach((partner) => {
    const meeting = meetings[partner.id];
    if (meeting) {
      const meetingDate = new Date(meeting.start);
      meetingItems.push({
        id: `meeting-${partner.id}`,
        title: meeting.summary,
        date: meeting.start.split("T")[0],
        time: meetingDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        partnerId: partner.id,
        partnerName: partner.name,
        htmlLink: meeting.htmlLink,
      });
    }
  });

  // Sort by date
  meetingItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isDueToday = (date: string) => date === today;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meetingItems.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-4">
            No upcoming meetings
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {meetingItems.map((item) => (
              <a
                key={item.id}
                href={item.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
                  <Video className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)] truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {item.partnerName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs shrink-0 text-green-600 font-medium">
                    <Clock className="h-3 w-3" />
                    {isDueToday(item.date)
                      ? `Today ${item.time}`
                      : `${formatDate(item.date)} ${item.time}`}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
