"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SchoolItem {
  id: string;
  name: string;
}

type ColorVariant =
  | "green"
  | "teal"
  | "yellow"
  | "red"
  | "blue"
  | "orange"
  | "gray"
  | "default";

const colorStyles: Record<ColorVariant, { bg: string; icon: string }> = {
  green: { bg: "bg-green-100", icon: "text-green-700" },
  teal: { bg: "bg-teal-100", icon: "text-teal-700" },
  yellow: { bg: "bg-yellow-100", icon: "text-yellow-700" },
  red: { bg: "bg-red-100", icon: "text-red-700" },
  blue: { bg: "bg-blue-100", icon: "text-blue-700" },
  orange: { bg: "bg-orange-100", icon: "text-orange-700" },
  gray: { bg: "bg-gray-100", icon: "text-gray-600" },
  default: { bg: "bg-slate-100", icon: "text-slate-800" },
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  schools?: SchoolItem[];
  total?: number;
  color?: ColorVariant;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  schools,
  total,
  color = "default",
}: MetricCardProps) {
  const numericValue =
    typeof value === "number" ? value : parseInt(value as string, 10) || 0;
  const percentage =
    total && total > 0 ? Math.round((numericValue / total) * 100) : null;
  const [showTooltip, setShowTooltip] = useState(false);

  const styles = colorStyles[color];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Card className="cursor-default h-full">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${styles.bg} mb-3`}
          >
            <Icon className={`h-6 w-6 ${styles.icon}`} />
          </div>
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
                  className="text-sm text-[var(--foreground)] hover:text-slate-700 hover:underline block"
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
