import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
  children: React.ReactNode;
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    secondary: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    outline: "border border-[var(--border)] text-[var(--foreground)]"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
