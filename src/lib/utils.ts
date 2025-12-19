export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";

  // Handle YYYY-MM-DD format to avoid timezone issues
  // Parse as local date, not UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";

  // Handle YYYY-MM-DD format to avoid timezone issues
  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  // Compare dates without time
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffInDays = Math.floor(
    (today.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return formatDate(dateString);
}
