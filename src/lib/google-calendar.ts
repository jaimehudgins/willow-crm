import { google, calendar_v3 } from "googleapis";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  attendees: string[];
  htmlLink: string;
}

export async function getNextMeetingWithEmails(
  accessToken: string,
  emails: string[]
): Promise<CalendarEvent | null> {
  if (!emails.length) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    // Search for events from now onwards
    const now = new Date().toISOString();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now,
      timeMax: oneYearFromNow.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    const events = response.data.items || [];

    // Find the first event that has any of the given emails as attendees
    for (const event of events) {
      const attendeeEmails =
        event.attendees?.map((a) => a.email?.toLowerCase()) || [];
      const hasMatchingAttendee = emails.some((email) =>
        attendeeEmails.includes(email.toLowerCase())
      );

      if (hasMatchingAttendee) {
        return {
          id: event.id || "",
          summary: event.summary || "No title",
          start: new Date(
            event.start?.dateTime || event.start?.date || Date.now()
          ),
          end: new Date(event.end?.dateTime || event.end?.date || Date.now()),
          attendees: attendeeEmails.filter(Boolean) as string[],
          htmlLink: event.htmlLink || "",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return null;
  }
}

export async function getNextMeetingsForPartners(
  accessToken: string,
  partnerEmails: Map<string, string[]> // partnerId -> emails
): Promise<Map<string, CalendarEvent>> {
  const results = new Map<string, CalendarEvent>();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const now = new Date().toISOString();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now,
      timeMax: threeMonthsFromNow.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 500,
    });

    const events = response.data.items || [];

    // For each partner, find their next meeting
    for (const [partnerId, emails] of partnerEmails) {
      if (results.has(partnerId)) continue;

      for (const event of events) {
        const attendeeEmails =
          event.attendees?.map((a) => a.email?.toLowerCase()) || [];
        const hasMatchingAttendee = emails.some((email) =>
          attendeeEmails.includes(email.toLowerCase())
        );

        if (hasMatchingAttendee) {
          results.set(partnerId, {
            id: event.id || "",
            summary: event.summary || "No title",
            start: new Date(
              event.start?.dateTime || event.start?.date || Date.now()
            ),
            end: new Date(event.end?.dateTime || event.end?.date || Date.now()),
            attendees: attendeeEmails.filter(Boolean) as string[],
            htmlLink: event.htmlLink || "",
          });
          break;
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return results;
  }
}
