"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "AccessDenied":
        return {
          title: "Access Denied",
          description:
            "Only @willowed.org accounts are allowed to access this application. Please sign in with your Willow Google account.",
        };
      case "Configuration":
        return {
          title: "Configuration Error",
          description:
            "There is a problem with the server configuration. Please contact your administrator.",
        };
      case "Verification":
        return {
          title: "Verification Error",
          description:
            "The verification link may have expired or already been used.",
        };
      default:
        return {
          title: "Authentication Error",
          description:
            "An error occurred during authentication. Please try again.",
        };
    }
  };

  const { title, description } = getErrorMessage();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/willow-logo.png"
            alt="Willow"
            width={64}
            height={64}
            className="h-16 w-16"
          />
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-6 w-6" />
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/signin" className="w-full">
            <Button className="w-full">Try Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          Loading...
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
