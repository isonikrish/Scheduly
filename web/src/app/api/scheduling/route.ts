import { GetAIScheduleResponse } from "@/lib/aiSchedulePrompt";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { NextResponse } from "next/server";

//Tools
async function findAttendee(name: string) {
  if (!name) {
    throw new Error("Name is required to find an attendee.");
  }
  const attendee = await prisma.user.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: "insensitive",
      },
    },
  });
  return attendee;
}
async function checkAvailability(attendeeId: number, date: Date) {
  if (!attendeeId) {
    throw new Error("Attendee ID and date are required to check availability.");
  }

  const user = await prisma.user.findUnique({
    where: { id: attendeeId },
    include: {
      hostedAppointments: true,
      attendingAppointments: true,
      availability: true,
    },
  });

  if (!user || !user.availability) return { isAvailable: false };

  const { startTime, endTime, days } = user.availability;
  const day = date.getUTCDay();
  const hour = date.getUTCHours();

  const isAvailableOnDay = days.includes(day);
  const isAvailableTime = hour >= startTime && hour < endTime;

  if (!isAvailableOnDay || !isAvailableTime) return { isAvailable: false };

  const allAppointments = [
    ...user.hostedAppointments,
    ...user.attendingAppointments,
  ];

  const isConflict = allAppointments.some((appt) => {
    const start = new Date(appt.date);
    const end = new Date(start.getTime() + (appt.duration ?? 30) * 60000);
    return date >= start && date < end;
  });

  return { isAvailable: !isConflict };
}
async function getDate(day: "today" | "tomorrow" | string) {
  const date = new Date();
  if (day === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }
  return date;
}
async function scheduleAppointment(
  agenda: string,
  attendeeId: number,
  hostId: number,
  date: Date
) {
  const appoinment = await prisma.appointment.create({
    data: {
      agenda,
      date,
      attendeeId,
      hostId,
    },
  });
  return appoinment;
}
async function updateAppoinment(appointmentId: number, date: Date) {
  const appoinment = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      date,
    },
  });
  return appoinment;
}
async function findExistingAppointment(appointmentId: number) {
  return await prisma.appointment.findUnique({
    where: {
      id: appointmentId
    },
  });
}
const tools = {
  findAttendee,
  checkAvailability,
  getDate,
  scheduleAppointment,
  updateAppoinment,
  findExistingAppointment
};
export async function POST(req: Request) {
  // const session = await getServerSession();
  // if (!session) {
  //   return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  // }
  // const user = await prisma.user.findUnique({
  //   where: { email: session?.user?.email ?? "" },
  // });
  // if (!user) {
  //   return NextResponse.json({ msg: "User not found" }, { status: 404 });
  // }
const user = {id: 1}
  let userPrompt =
    "Schedule the appointment with john doe for today at 8 pm for a product related meeting";
  const aiPlan = await GetAIScheduleResponse(userPrompt);
  try {
    let context: Record<string, any> = {};
    for (const step of aiPlan) {
      if (step.type === "action") {
        switch (step.action) {
          case "findAttendee":
            const attendee = await tools.findAttendee(step.input.name);
            if (!attendee) {
              return NextResponse.json(
                { msg: "Attendee not found" },
                { status: 404 }
              );
            }
            context.attendee = attendee;
            break;

          case "getDate":
            const baseDate = await tools.getDate(step.input.day);
            context.date = baseDate;
            break;
          case "checkAvailability":
            if (!context.attendee) {
              return NextResponse.json(
                { msg: "Attendee not found in context" },
                { status: 404 }
              );
            }
            const availability = await tools.checkAvailability(
              context.attendee.id,
              context.date
            );
            if (!availability.isAvailable) {
              return NextResponse.json(
                { msg: "Attendee is not available at the specified time" },
                { status: 400 }
              );
            }
            context.isAvailable = true;
            break;
          case "scheduleAppointment":
            if (!context.attendee || !context.isAvailable) {
              return NextResponse.json(
                { msg: "Cannot schedule appointment, attendee not available" },
                { status: 400 }
              );
            }
            const appointment = await tools.scheduleAppointment(
              step.input.agenda,
              context.attendee.id,
              user.id,
              context.date
            );
            context.appointment = appointment;
            break;
          // case "updateAppoinment":
          //   if (!context.appointment) {
          //     return NextResponse.json(
          //       { msg: "Appointment not found in context" },
          //       { status: 404 }
          //     );
          //   }
          //   const updatedAppointment = await tools.updateAppoinment(
          //     context.appointment.id,
          //     context.date
          //   );
          //   context.appointment = updatedAppointment;
          //   break;
        }
      }
    }
    return NextResponse.json({ msg: "Scheduled Appointment" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
