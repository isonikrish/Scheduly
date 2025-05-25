import { GetAIScheduleResponse } from "@/lib/aiSchedulePrompt";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// ---------- Tools ----------
async function findAttendee(name: string) {
  if (!name) throw new Error("Name is required.");
  return prisma.user.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
}

async function checkAvailability(attendeeId: number, date: Date) {
  if (!attendeeId || !date)
    throw new Error("Attendee ID and date are required.");

  const user = await prisma.user.findUnique({
    where: { id: attendeeId },
    include: {
      hostedAppointments: true,
      attendingAppointments: true,
      availability: true,
    },
  });

  if (!user?.availability) return { isAvailable: false };

  const { startTime, endTime, days } = user.availability;
  if (
    startTime === undefined ||
    endTime === undefined ||
    !Array.isArray(days)
  ) {
    return { isAvailable: false };
  }

  const utcDay = date.getUTCDay();
  const utcHour = date.getUTCHours();

  const isAvailableOnDay = days.includes(utcDay);
  const isWithinTime = utcHour >= startTime && utcHour < endTime;

  if (!isAvailableOnDay || !isWithinTime) return { isAvailable: false };

  const allAppointments = [
    ...user.hostedAppointments,
    ...user.attendingAppointments,
  ];

  // Check if the requested date/time overlaps existing appointments
  const isConflict = allAppointments.some((appt) => {
    const start = new Date(appt.date);
    const end = new Date(start.getTime() + (appt.duration ?? 30) * 60000);
    // Check if 'date' falls within any existing appointment interval
    return date >= start && date < end;
  });

  return { isAvailable: !isConflict };
}

async function getDate(day: "today" | "tomorrow" | string, timeStr?: string) {
  const now = new Date();

  // Start from midnight UTC of the day
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (day === "tomorrow") {
    date.setUTCDate(date.getUTCDate() + 1);
  } else if (day !== "today") {
    // handle other days if needed
  }

  if (timeStr) {
    const timeMatch = timeStr.toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);

    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2] || "0", 10);
      const period = timeMatch[3];

      if (period === "pm" && hour < 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;

      date.setUTCHours(hour, minute, 0, 0);
    } else {
      date.setUTCHours(9, 0, 0, 0);
    }
  } else {
    date.setUTCHours(9, 0, 0, 0);
  }

  return date;
}

async function scheduleAppointment(
  agenda: string,
  attendeeId: number,
  hostId: number,
  date: Date
) {
  return prisma.appointment.create({
    data: {
      agenda,
      date,
      attendeeId,
      hostId,
    },
  });
}

// ---------- Main POST handler ----------
export async function POST(req: Request) {
  // const session = await getServerSession();
  // const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } });
  // if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

  const user = { id: 1 }; // Hardcoded for testing
  const userPrompt =
    "Schedule the appointment with john doe for tomorrow at 10 am for a product related meeting";

  const aiPlan = await GetAIScheduleResponse(userPrompt);
  if (!Array.isArray(aiPlan)) {
    return NextResponse.json(
      { msg: "Invalid AI plan received" },
      { status: 500 }
    );
  }
  try {
    let context: Record<string, any> = {};

    for (const step of aiPlan) {
      if (step.type !== "action") continue;

      switch (step.action) {
        case "findAttendee": {
          const attendee = await findAttendee(step.input.name);
          if (!attendee) {
            return NextResponse.json(
              { msg: "Attendee not found" },
              { status: 404 }
            );
          }
          context.attendee = attendee;
          break;
        }

        case "getDate": {
          const baseDate = await getDate(step.input.day, step.input.timeStr);
          context.date = baseDate;
          break;
        }

        case "checkAvailability": {
          if (!context.attendee) {
            return NextResponse.json(
              { msg: "Attendee missing" },
              { status: 400 }
            );
          }

          const availability = await checkAvailability(
            context.attendee.id,
            context.date
          );
          if (!availability.isAvailable) {
            return NextResponse.json(
              { msg: "Attendee is not available at the selected time" },
              { status: 400 }
            );
          }
          context.isAvailable = true;
          break;
        }

        case "scheduleAppointment": {
          if (!context.attendee || !context.isAvailable) {
            return NextResponse.json(
              { msg: "Cannot schedule: attendee unavailable" },
              { status: 400 }
            );
          }
          const appointment = await scheduleAppointment(
            step.input.agenda,
            context.attendee.id,
            user.id,
            context.date
          );
          context.appointment = appointment;
          break;
        }
      }
    }

    return NextResponse.json(
      { msg: "Scheduled Appointment", context },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
