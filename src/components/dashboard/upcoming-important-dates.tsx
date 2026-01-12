"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ImportantDateWithPartner {
  id: string;
  title: string;
  date: string;
  notes?: string;
  partnerId: string;
  partnerName: string;
}

interface UpcomingImportantDatesProps {
  importantDates: ImportantDateWithPartner[];
}

export function UpcomingImportantDates({
  importantDates,
}: UpcomingImportantDatesProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter to only show future dates (including today) and sort by date
  const upcomingDates = importantDates
    .filter((d) => {
      const dateObj = new Date(d.date + "T00:00:00");
      return dateObj >= today;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10); // Show top 10

  const isToday = (date: string) => {
    const dateObj = new Date(date + "T00:00:00");
    return dateObj.getTime() === today.getTime();
  };

  const isWithinWeek = (date: string) => {
    const dateObj = new Date(date + "T00:00:00");
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dateObj > today && dateObj <= weekFromNow;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Important Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDates.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-4">
            No upcoming important dates
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingDates.map((item) => {
              const dateIsToday = isToday(item.date);
              const dateIsUpcoming = isWithinWeek(item.date);

              return (
                <Link
                  key={item.id}
                  href={`/partners/${item.partnerId}`}
                  className="block"
                >
                  <div
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      dateIsToday
                        ? "bg-green-50 hover:bg-green-100"
                        : dateIsUpcoming
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-[var(--muted)]"
                    }`}
                  >
                    <Calendar
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        dateIsToday
                          ? "text-green-600"
                          : dateIsUpcoming
                            ? "text-blue-600"
                            : "text-[var(--muted-foreground)]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--foreground)] truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {item.partnerName}
                        </span>
                        {item.notes && (
                          <>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              •
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)] truncate">
                              {item.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-xs shrink-0 font-medium ${
                        dateIsToday
                          ? "text-green-600"
                          : dateIsUpcoming
                            ? "text-blue-600"
                            : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {dateIsToday ? "Today" : formatDate(item.date)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
