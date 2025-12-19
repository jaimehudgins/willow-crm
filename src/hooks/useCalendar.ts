"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface NextMeeting {
  summary: string;
  start: string;
  htmlLink: string;
}

export function useCalendarMeetings(
  partnerEmails: Record<string, string[]> // partnerId -> emails
) {
  const { data: session, status } = useSession();
  const [meetings, setMeetings] = useState<Record<string, NextMeeting>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      return;
    }

    if (Object.keys(partnerEmails).length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calendar/next-meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partnerEmails }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      console.error("Error fetching calendar meetings:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, partnerEmails]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    loading,
    error,
    isAuthenticated: status === "authenticated",
    refetch: fetchMeetings,
  };
}
