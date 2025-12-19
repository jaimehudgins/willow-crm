"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, School, Calendar, ListTodo } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partners", label: "Partners", icon: School },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/willow-logo.png"
                alt="Willow"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-[var(--foreground)]">
                Willow Partner Success
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
                      ? "bg-slate-700 text-white"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="ml-4 border-l border-[var(--border)] pl-4">
              {status === "authenticated" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-emerald-600"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar Connected
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signIn("google")}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Connect Calendar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
