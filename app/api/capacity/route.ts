import { JobStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateNewJobAcceptance } from "@/services/capacity";
import { getCurrentCapacity, listPendingJobs } from "@/services/jobs";
import { getCurrentUser } from "@/services/user";

export async function GET() {
  const snapshot = await getCurrentCapacity();
  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await getCurrentUser();
  const jobs = await listPendingJobs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLog = await prisma.dailyLog.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  const totalTimeMinutes =
    Number(body.totalTimeMinutes) > 0
      ? Number(body.totalTimeMinutes)
      : Number(body.quantity) * Number(body.timePerUnitMinutes);

  const assessment = evaluateNewJobAcceptance({
    existingJobs: jobs,
    proposedJob: {
      id: "preview",
      clientName: body.clientName || "Nuevo cliente",
      description: body.description || "Trabajo nuevo",
      deadline: new Date(body.deadline),
      totalTimeMinutes,
      actualWorkedMinutes: 0,
      progressPercent: 0,
      status: JobStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    workingHoursStart: user.workingHoursStart,
    workingHoursEnd: user.workingHoursEnd,
    todayWorkedMinutes: todayLog?.totalWorkedMinutes ?? 0,
  });

  return NextResponse.json(assessment);
}
