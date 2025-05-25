import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
    });
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }
    const data = await req.json();

    const { startTime, endTime, days } = data;
    if (!startTime || !endTime || !days || !Array.isArray(days)) {
      return NextResponse.json({ msg: "Invalid data" }, { status: 400 });
    }

    await prisma.availability.upsert({
      where: { userId: user.id },
      update: {
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        days,
      },
      create: {
        userId: user.id,
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        days,
      },
    });

    return NextResponse.json(
      { msg: "Availability created successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}