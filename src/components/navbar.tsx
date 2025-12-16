"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, School, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partners", label: "Schools", icon: School },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">
                Willow Staff
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
