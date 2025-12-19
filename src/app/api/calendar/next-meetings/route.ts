import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNextMeetingsForPartners } from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Google" },
        { status: 401 },
      );
    }

    const { partnerEmails } = await request.json();

    // Convert array to Map
    const emailsMap = new Map<string, string[]>(
      Object.entries(partnerEmails) as [string, string[]][],
    );

    const meetings = await getNextMeetingsForPartners(
      session.accessToken,
      emailsMap,
    );

    // Convert Map to object for JSON response
    const result: Record<
      string,
      { summary: string; start: string; htmlLink: string }
    > = {};
    for (const [partnerId, event] of meetings) {
      result[partnerId] = {
        summary: event.summary,
        start: event.start.toISOString(),
        htmlLink: event.htmlLink,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}
