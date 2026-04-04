import { EntryType, JobStatus } from "@prisma/client";
import { startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentCapacity, listJobs, listPendingJobs } from "@/services/jobs";
import { getCurrentUser } from "@/services/user";
import { listEntries } from "@/services/finance";
import { listGoals } from "@/services/goals";

export async function getDashboardData() {
  const user = await getCurrentUser();
  const jobs = await listJobs();
  const pendingJobs = await listPendingJobs();
  const capacity = await getCurrentCapacity();
  const entries = await listEntries();
  const goals = await listGoals();
  const monthStart = startOfMonth(new Date());

  const monthEntries = await prisma.financialEntry.findMany({
    where: {
      userId: user.id,
      date: { gte: monthStart },
    },
  });
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

  const income = monthEntries
    .filter((entry) => entry.type === EntryType.INCOME)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenses = monthEntries
    .filter((entry) => entry.type === EntryType.EXPENSE)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const balance = income - expenses;
  const completedJobs = jobs.filter((job) => job.status === JobStatus.DELIVERED);
  const underestimatedCount = completedJobs.filter((job) => {
    return job.actualWorkedMinutes > job.totalTimeMinutes * 1.15;
  }).length;
  const lowMarginJobs = pendingJobs.filter(
    (job) => Number(job.price) <= Number(job.cost) * 1.1,
  );
  const behaviorMessages = [
    !todayLog ? "Hoy no has registrado actividad." : null,
    capacity.needsPendingRefresh
      ? "No puedes calcular nuevos trabajos si no actualizas lo que ya debes."
      : null,
    capacity.lateJobs.length > 0
      ? "Estás aceptando más de lo que puedes cumplir."
      : null,
    capacity.totalAssignedNextThreeDays >= capacity.totalAvailableNextThreeDays
      ? "Tu tiempo es limitado. Lo de hoy y lo de mañana ya están casi llenos."
      : null,
    underestimatedCount >= 2
      ? "Sueles calcular menos tiempo del real."
      : null,
    lowMarginJobs.length > 0 ? "No todo trabajo conviene." : null,
  ].filter(Boolean) as string[];

  return {
    user,
    jobs,
    pendingJobs,
    entries,
    goals,
    capacity,
    todayLog,
    monthSummary: {
      income,
      expenses,
      balance,
    },
    behaviorMessages,
  };
}
