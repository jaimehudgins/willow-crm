"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  noteTypeColors,
  type Partner,
  type Note,
  type NoteType,
} from "@/data/partners";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";

interface ActivityItem {
  partnerId: string;
  partnerName: string;
  note: Note;
}

interface RecentActivityProps {
  partners: Partner[];
}

const noteTypeIconMap: Record<NoteType, React.ReactNode> = {
  Call: <Phone className="h-3 w-3" />,
  Email: <Mail className="h-3 w-3" />,
  Meeting: <Calendar className="h-3 w-3" />,
  "Site Visit": <MapPin className="h-3 w-3" />,
  "Internal Note": <FileText className="h-3 w-3" />,
};

export function RecentActivity({ partners }: RecentActivityProps) {
  // Collect all notes from all partners with partner info
  const allActivities: ActivityItem[] = partners.flatMap((partner) =>
    partner.notes.map((note) => ({
      partnerId: partner.id,
      partnerName: partner.name,
      note,
    })),
  );

  // Sort by date (most recent first) and take top 10
  const recentActivities = allActivities
    .sort(
      (a, b) =>
        new Date(b.note.date).getTime() - new Date(a.note.date).getTime(),
    )
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-4">
              No recent activity
            </p>
          ) : (
            recentActivities.map((activity) => (
              <Link
                key={`${activity.partnerId}-${activity.note.id}`}
                href={`/partners/${activity.partnerId}`}
                className="block rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--muted)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={noteTypeColors[activity.note.type]}>
                        <span className="flex items-center gap-1">
                          {noteTypeIconMap[activity.note.type]}
                          {activity.note.type}
                        </span>
                      </Badge>
                      <span className="font-medium text-[var(--foreground)] text-sm">
                        {activity.partnerName}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                      {activity.note.content}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span>{activity.note.author}</span>
                      <span>•</span>
                      <span>{formatDate(activity.note.date)}</span>
                      {activity.note.followUpTasks &&
                        activity.note.followUpTasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600">
                              {
                                activity.note.followUpTasks.filter(
                                  (t) => !t.completed,
                                ).length
                              }{" "}
                              task(s)
                            </span>
                          </>
                        )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 mt-1" />
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
