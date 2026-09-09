import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { requireCronSecret } from "@/lib/cron-auth";
import { createCalendarEvent } from "@/lib/scheduling/google-calendar";

/** sección 5.3, sección 13: cada 10 minutos — reintenta reservas PENDING_SYNC. */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const pending = await db.select().from(bookings).where(eq(bookings.syncStatus, "pending_sync"));

  const results = await Promise.allSettled(
    pending.map(async (booking) => {
      const event = await createCalendarEvent({
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        studentId: booking.studentId,
      });
      await db
        .update(bookings)
        .set({ googleEventId: event.eventId, googleMeetUrl: event.meetUrl, syncStatus: "synced" })
        .where(eq(bookings.id, booking.id));
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({ attempted: pending.length, failed });
}
