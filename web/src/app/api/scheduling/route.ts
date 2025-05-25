import { GetAIScheduleResponse } from "@/lib/aiSchedulePrompt";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  // Convert input date (UTC) to IST date
  // IST is UTC + 5:30
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  const istDay = istDate.getDay();   // Sunday=0 ... Saturday=6, matches your stored days array
  const istHour = istDate.getHours(); // Hour in 24h format

  const isAvailableOnDay = days.includes(istDay);
  const isWithinTime = istHour >= startTime && istHour < endTime;

  if (!isAvailableOnDay || !isWithinTime) return { isAvailable: false };

  const allAppointments = [
    ...user.hostedAppointments,
    ...user.attendingAppointments,
  ];

  // Check if the requested date/time overlaps existing appointments
  const isConflict = allAppointments.some((appt) => {
    const start = new Date(appt.date);
    const end = new Date(start.getTime() + (appt.duration ?? 30) * 60000);
    // Check if 'date' (UTC) falls within any existing appointment interval (also in UTC)
    return date >= start && date < end;
  });

  return { isAvailable: !isConflict };
}


async function getDate(nlp: string) {
  const now = new Date();
  //nlp is expected to be a natural language string like "tomorrow at 8 am"
  const prompt = `
You are a date extraction assistant. 
Given a natural language input describing a date and time (e.g., "tomorrow at 8 am") and the current date/time in Asia/Kolkata timezone, 
return ONLY the exact date and time as an ISO 8601 string in UTC format.

Do NOT return any code, explanations, or additional text.

Current date/time in Asia/Kolkata timezone: ${now.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  })}

Input: "${nlp}"

Output (ISO 8601 UTC date/time string only):`;
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const cleanDate = response.trim();

  return cleanDate;
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
  const session = await getServerSession();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
  });
  if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  const data = await req.text();

  const userPrompt = data.trim();
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
          const baseDateISO = await getDate(step.input.nlp);
          context.date = new Date(baseDateISO);
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
