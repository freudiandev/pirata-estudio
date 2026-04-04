import { prisma } from "@/lib/prisma";
import { dailyLogSchema } from "@/lib/validations";
import { getCurrentUser } from "@/services/user";

export async function saveDailyLog(rawData: unknown) {
  const parsed = dailyLogSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Cuéntame mejor cuánto trabajaste hoy.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getCurrentUser();
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
      totalWorkedMinutes: parsed.data.totalWorkedMinutes,
      notes: parsed.data.notes,
    },
    update: {
      totalWorkedMinutes: parsed.data.totalWorkedMinutes,
      notes: parsed.data.notes,
    },
  });

  return {
    success: true as const,
    message: "Tu día quedó registrado.",
  };
}
