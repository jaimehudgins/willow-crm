import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}

export function MetricCard({ title, value, icon: Icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
            <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
