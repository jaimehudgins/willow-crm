"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColors, priorityColors, type Partner } from "@/data/partners";
import { formatDate } from "@/lib/utils";
import { Calendar, ArrowRight } from "lucide-react";

interface RecentActivityProps {
  partners: Partner[];
}

export function RecentActivity({ partners }: RecentActivityProps) {
  const sortedPartners = [...partners]
    .sort(
      (a, b) =>
        new Date(b.lastContactDate).getTime() -
        new Date(a.lastContactDate).getTime(),
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPartners.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-4">
              No recent activity
            </p>
          ) : (
            sortedPartners.map((partner) => (
              <Link
                key={partner.id}
                href={`/partners/${partner.id}`}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4 transition-colors hover:bg-[var(--muted)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {partner.name}
                    </p>
                    <Badge className={statusColors[partner.status]}>
                      {partner.status}
                    </Badge>
                    <Badge className={priorityColors[partner.priority]}>
                      {partner.priority}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    <span>Last: {formatDate(partner.lastContactDate)}</span>
                    {partner.nextFollowUp && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Follow-up: {formatDate(partner.nextFollowUp)}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 ml-2" />
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
