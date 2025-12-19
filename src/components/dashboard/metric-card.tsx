"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SchoolItem {
  id: string;
  name: string;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  schools?: SchoolItem[];
  total?: number; // If provided, shows percentage with count in parentheses
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  schools,
  total,
}: MetricCardProps) {
  const numericValue =
    typeof value === "number" ? value : parseInt(value as string, 10) || 0;
  const percentage =
    total && total > 0 ? Math.round((numericValue / total) * 100) : null;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Card className="cursor-default">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {title}
              </p>
              <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
                {percentage !== null ? (
                  <>
                    {percentage}%{" "}
                    <span className="text-lg font-normal text-[var(--muted-foreground)]">
                      ({numericValue})
                    </span>
                  </>
                ) : (
                  value
                )}
              </p>
              {description && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {description}
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {showTooltip && schools && schools.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg p-3">
          <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
            {title}
          </p>
          <ul className="space-y-1">
            {schools.map((school) => (
              <li key={school.id}>
                <Link
                  href={`/partners/${school.id}`}
                  className="text-sm text-[var(--foreground)] hover:text-indigo-600 hover:underline block"
                >
                  {school.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
