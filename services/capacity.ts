import { JobStatus } from "@prisma/client";
import { addDays, differenceInCalendarDays, isAfter, isBefore, startOfDay } from "date-fns";
import { formatFriendlySuggestedDate } from "@/lib/formatters";
import { getDayLabel, getAvailableMinutesForDate, getWorkingMinutesPerDay } from "@/lib/time";
import { clamp } from "@/lib/utils";

export type CapacityMood = "calm" | "warn" | "stress";

export type CapacityJobInput = {
  id: string;
  clientName: string;
  description: string;
  deadline: Date;
  totalTimeMinutes: number;
  actualWorkedMinutes: number;
  progressPercent: number;
  status: JobStatus | string;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleDay = {
  date: Date;
  label: string;
  availableMinutes: number;
  assignedMinutes: number;
  occupancyPercent: number;
};

export type ScheduledJobResult = {
  jobId: string;
  finishDate: Date | null;
  onTime: boolean;
  remainingMinutes: number;
};

export type CapacitySnapshot = {
  now: Date;
  workingMinutesPerDay: number;
  todayAvailableMinutes: number;
  todayAssignedMinutes: number;
  totalPendingMinutes: number;
  totalAvailableNextThreeDays: number;
  totalAssignedNextThreeDays: number;
  loadPercentToday: number;
  days: ScheduleDay[];
  jobResults: ScheduledJobResult[];
  lateJobs: string[];
  pendingCount: number;
  needsPendingRefresh: boolean;
  mood: CapacityMood;
};

export type NewJobAssessment = {
  status: "fit" | "tight" | "unrealistic";
  message: string;
  detail: string;
  canSave: boolean;
  suggestedDate: Date | null;
  suggestedDateLabel: string | null;
  snapshot: CapacitySnapshot;
};

export function isActiveJob(status: JobStatus | string) {
  return status === "PENDING" || status === "STARTING" || status === "ADVANCING";
}

export function getRemainingMinutes(job: CapacityJobInput) {
  if (!isActiveJob(job.status)) {
    return 0;
  }

  const progressBased = Math.round(
    job.totalTimeMinutes * ((100 - clamp(job.progressPercent, 0, 100)) / 100),
  );
  const actualBased = Math.max(job.totalTimeMinutes - job.actualWorkedMinutes, 0);

  return Math.max(progressBased, actualBased, 0);
}

export function buildCapacitySnapshot(options: {
  jobs: CapacityJobInput[];
  workingHoursStart: string;
  workingHoursEnd: string;
  todayWorkedMinutes: number;
  now?: Date;
  horizonDays?: number;
}) {
  const {
    jobs,
    workingHoursStart,
    workingHoursEnd,
    todayWorkedMinutes,
    now = new Date(),
    horizonDays = 8,
  } = options;
  const activeJobs = jobs.filter((job) => isActiveJob(job.status));
  const sortedJobs = [...activeJobs].sort((a, b) => {
    const deadlineDifference = a.deadline.getTime() - b.deadline.getTime();

    if (deadlineDifference !== 0) {
      return deadlineDifference;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const start = startOfDay(now);
  const latestDeadline = sortedJobs.reduce((latest, job) => {
    return isAfter(job.deadline, latest) ? job.deadline : latest;
  }, addDays(start, horizonDays - 1));
  const totalDays = Math.max(
    horizonDays,
    differenceInCalendarDays(startOfDay(latestDeadline), start) + 4,
  );

  const days: ScheduleDay[] = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(start, index);
    const availableMinutes = getAvailableMinutesForDate({
      date,
      now,
      workingHoursStart,
      workingHoursEnd,
      todayWorkedMinutes,
    });

    return {
      date,
      label: getDayLabel(date, now),
      availableMinutes,
      assignedMinutes: 0,
      occupancyPercent: 0,
    };
  });

  const jobResults: ScheduledJobResult[] = [];

  for (const job of sortedJobs) {
    let remaining = getRemainingMinutes(job);
    let finishDate: Date | null = null;

    for (const day of days) {
      if (remaining <= 0) {
        break;
      }

      const free = Math.max(day.availableMinutes - day.assignedMinutes, 0);

      if (free <= 0) {
        continue;
      }

      const assigned = Math.min(free, remaining);
      day.assignedMinutes += assigned;
      remaining -= assigned;
      finishDate = day.date;
    }

    jobResults.push({
      jobId: job.id,
      finishDate,
      onTime: Boolean(
        finishDate && !isAfter(startOfDay(finishDate), startOfDay(job.deadline)),
      ),
      remainingMinutes: remaining,
    });
  }

  for (const day of days) {
    day.occupancyPercent =
      day.availableMinutes === 0
        ? day.assignedMinutes > 0
          ? 100
          : 0
        : clamp((day.assignedMinutes / day.availableMinutes) * 100, 0, 100);
  }

  const lateJobs = jobResults
    .filter((result) => !result.onTime || result.remainingMinutes > 0)
    .map((result) => result.jobId);
  const today = days[0];
  const nextThreeDays = days.slice(0, 3);
  const pendingCount = activeJobs.length;
  const needsPendingRefresh =
    pendingCount > 0 &&
    activeJobs.every((job) => !sameDay(job.updatedAt, now));
  const totalAssignedNextThreeDays = nextThreeDays.reduce(
    (total, day) => total + day.assignedMinutes,
    0,
  );
  const totalAvailableNextThreeDays = nextThreeDays.reduce(
    (total, day) => total + day.availableMinutes,
    0,
  );
  const mood = getMood(today.occupancyPercent, lateJobs.length);

  return {
    now,
    workingMinutesPerDay: getWorkingMinutesPerDay(
      workingHoursStart,
      workingHoursEnd,
    ),
    todayAvailableMinutes: today?.availableMinutes ?? 0,
    todayAssignedMinutes: today?.assignedMinutes ?? 0,
    totalPendingMinutes: sortedJobs.reduce(
      (total, job) => total + getRemainingMinutes(job),
      0,
    ),
    totalAvailableNextThreeDays,
    totalAssignedNextThreeDays,
    loadPercentToday: today?.occupancyPercent ?? 0,
    days,
    jobResults,
    lateJobs,
    pendingCount,
    needsPendingRefresh,
    mood,
  } satisfies CapacitySnapshot;
}

export function evaluateNewJobAcceptance(options: {
  existingJobs: CapacityJobInput[];
  proposedJob: CapacityJobInput;
  workingHoursStart: string;
  workingHoursEnd: string;
  todayWorkedMinutes: number;
  now?: Date;
}) {
  const {
    existingJobs,
    proposedJob,
    workingHoursStart,
    workingHoursEnd,
    todayWorkedMinutes,
    now = new Date(),
  } = options;
  const proposalResult = buildCapacitySnapshot({
    jobs: [...existingJobs, proposedJob],
    workingHoursStart,
    workingHoursEnd,
    todayWorkedMinutes,
    now,
    horizonDays: 10,
  });
  const proposedJobResult = proposalResult.jobResults.find(
    (result) => result.jobId === proposedJob.id,
  );
  const finishDate = proposedJobResult?.finishDate ?? null;
  const proposedOnTime =
    Boolean(proposedJobResult?.onTime ?? true) &&
    (proposedJobResult?.remainingMinutes ?? 0) === 0;
  const loadByDeadline = proposalResult.days
    .filter((day) => !isAfter(startOfDay(day.date), startOfDay(proposedJob.deadline)))
    .reduce(
      (acc, day) => {
        acc.available += day.availableMinutes;
        acc.assigned += day.assignedMinutes;
        return acc;
      },
      { available: 0, assigned: 0 },
    );
  const slack = loadByDeadline.available - loadByDeadline.assigned;
  const nextTwoDaysPacked = proposalResult.days
    .slice(0, 2)
    .every((day) => day.occupancyPercent >= 95);

  if (proposalResult.needsPendingRefresh) {
    return {
      status: "unrealistic",
      message: "Primero actualiza lo que ya debes",
      detail:
        "No puedes calcular nuevos trabajos si no revisas tus pendientes de hoy.",
      canSave: false,
      suggestedDate: null,
      suggestedDateLabel: null,
      snapshot: proposalResult,
    } satisfies NewJobAssessment;
  }

  if (!proposedOnTime) {
    const suggestedDate = finishDate || proposedJob.deadline;

    return {
      status: "unrealistic",
      message: "No es realista aceptar este trabajo para esa fecha",
      detail: nextTwoDaysPacked
        ? "Tu carga pendiente ya ocupa completamente hoy y mañana."
        : `Sí sería posible si lo prometes para el ${formatFriendlySuggestedDate(
            suggestedDate,
          )}.`,
      canSave: false,
      suggestedDate,
      suggestedDateLabel: `Puedes aceptarlo para el ${formatFriendlySuggestedDate(
        suggestedDate,
      )}`,
      snapshot: proposalResult,
    } satisfies NewJobAssessment;
  }

  if (slack <= proposalResult.workingMinutesPerDay * 0.3 || nextTwoDaysPacked) {
    return {
      status: "tight",
      message: "Vas a estar justo de tiempo",
      detail:
        "Cabe, pero no te deja mucho aire. Si aparece un retraso, te aprieta.",
      canSave: true,
      suggestedDate: null,
      suggestedDateLabel: null,
      snapshot: proposalResult,
    } satisfies NewJobAssessment;
  }

  return {
    status: "fit",
    message: "Puedes aceptar este trabajo",
    detail: "Hay espacio real para cumplirlo sin ahogarte.",
    canSave: true,
    suggestedDate: null,
    suggestedDateLabel: null,
    snapshot: proposalResult,
  } satisfies NewJobAssessment;
}

function getMood(loadPercent: number, lateJobsCount: number): CapacityMood {
  if (lateJobsCount > 0 || loadPercent >= 95) {
    return "stress";
  }

  if (loadPercent >= 70) {
    return "warn";
  }

  return "calm";
}

function sameDay(left: Date, right: Date) {
  return !isBefore(startOfDay(left), startOfDay(right)) &&
    !isAfter(startOfDay(left), startOfDay(right));
}
