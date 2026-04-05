import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jobCreateSchema, jobUpdateSchema } from "@/lib/validations";
import { buildCapacitySnapshot, evaluateNewJobAcceptance, type CapacityJobInput } from "@/services/capacity";
import { getCurrentUser } from "@/services/user";

export class JobValidationError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

function mapJobToCapacity(job: {
  id: string;
  clientName: string;
  description: string;
  deadline: Date;
  totalTimeMinutes: number;
  actualWorkedMinutes: number;
  progressPercent: number;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...job,
  } satisfies CapacityJobInput;
}

export async function listJobs() {
  const user = await getCurrentUser();

  return prisma.job.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
  });
}

export async function listPendingJobs() {
  const user = await getCurrentUser();

  return prisma.job.findMany({
    where: {
      userId: user.id,
      status: {
        in: [JobStatus.PENDING, JobStatus.STARTING, JobStatus.ADVANCING],
      },
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "asc" }],
  });
}

export async function createJob(rawData: unknown) {
  const parsed = jobCreateSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new JobValidationError("Revisa los datos del trabajo.", parsed.error.flatten().fieldErrors);
  }

  const user = await getCurrentUser();
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
  const pendingJobs = await listPendingJobs();
  const totalTimeMinutes =
    parsed.data.totalTimeMinutes && parsed.data.totalTimeMinutes > 0
      ? parsed.data.totalTimeMinutes
      : parsed.data.quantity * (parsed.data.timePerUnitMinutes ?? 0);
  const proposedJob = {
    id: "preview",
    clientName: parsed.data.clientName,
    description: parsed.data.description,
    deadline: new Date(parsed.data.deadline),
    totalTimeMinutes,
    actualWorkedMinutes: 0,
    progressPercent: 0,
    status: JobStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies CapacityJobInput;
  const assessment = evaluateNewJobAcceptance({
    existingJobs: pendingJobs.map(mapJobToCapacity),
    proposedJob,
    workingHoursStart: user.workingHoursStart,
    workingHoursEnd: user.workingHoursEnd,
    todayWorkedMinutes: todayLog?.totalWorkedMinutes ?? 0,
  });

  if (!assessment.canSave) {
    throw new JobValidationError(assessment.message, {
      deadline: [assessment.detail],
    });
  }

  return prisma.job.create({
    data: {
      userId: user.id,
      clientName: parsed.data.clientName,
      type: parsed.data.type,
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      price: new Prisma.Decimal(parsed.data.price),
      cost: new Prisma.Decimal(parsed.data.cost),
      timePerUnitMinutes:
        parsed.data.timePerUnitMinutes && parsed.data.timePerUnitMinutes > 0
          ? parsed.data.timePerUnitMinutes
          : Math.max(Math.round(totalTimeMinutes / parsed.data.quantity), 1),
      totalTimeMinutes,
      deadline: new Date(parsed.data.deadline),
      status: JobStatus.PENDING,
    },
  });
}

export async function updateJob(jobId: string, rawData: unknown) {
  const parsed = jobUpdateSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new JobValidationError("No pude guardar ese avance.", parsed.error.flatten().fieldErrors);
  }

  const user = await getCurrentUser();
  const workedMinutesToday = parsed.data.workedMinutesToday ?? 0;
  const status =
    parsed.data.status === JobStatus.COMPLETED || parsed.data.progressPercent === 100
      ? JobStatus.COMPLETED
      : parsed.data.status;
  const existing = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!existing) {
    throw new JobValidationError("Ese trabajo ya no existe o no te pertenece.");
  }

  const updated = await prisma.job.update({
    where: { id: existing.id },
    data: {
      progressPercent: status === JobStatus.COMPLETED ? 100 : parsed.data.progressPercent,
      status,
      actualWorkedMinutes: {
        increment: workedMinutesToday,
      },
    },
  });

  if (workedMinutesToday > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      create: {
        userId: user.id,
        date: today,
        totalWorkedMinutes: workedMinutesToday,
      },
      update: {
        totalWorkedMinutes: {
          increment: workedMinutesToday,
        },
      },
    });
  }

  return updated;
}

export async function deleteJob(jobId: string) {
  const user = await getCurrentUser();
  const existing = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!existing) {
    throw new JobValidationError("Ese trabajo ya no existe o no te pertenece.");
  }

  await prisma.job.delete({
    where: { id: existing.id },
  });
}

export async function getCurrentCapacity() {
  const user = await getCurrentUser();
  const pendingJobs = await listPendingJobs();
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

  return buildCapacitySnapshot({
    jobs: pendingJobs.map(mapJobToCapacity),
    workingHoursStart: user.workingHoursStart,
    workingHoursEnd: user.workingHoursEnd,
    todayWorkedMinutes: todayLog?.totalWorkedMinutes ?? 0,
  });
}
