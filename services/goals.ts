import { prisma } from "@/lib/prisma";
import { goalCreateSchema, goalUpdateSchema } from "@/lib/validations";
import { getCurrentUser } from "@/services/user";

export async function listGoals() {
  const user = await getCurrentUser();

  return prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
}

export async function createGoal(rawData: unknown) {
  const parsed = goalCreateSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Tu objetivo todavía necesita un ajuste.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getCurrentUser();

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      targetValue: parsed.data.targetValue,
      currentValue: parsed.data.currentValue ?? 0,
      unit: parsed.data.unit,
      periodLabel: parsed.data.periodLabel,
    },
  });

  return {
    success: true as const,
    message: "Objetivo guardado.",
  };
}

export async function updateGoal(goalId: string, rawData: unknown) {
  const parsed = goalUpdateSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "No pude actualizar ese objetivo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getCurrentUser();
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  if (!existing) {
    return {
      success: false as const,
      message: "Ese objetivo ya no existe o no te pertenece.",
    };
  }

  await prisma.goal.update({
    where: { id: existing.id },
    data: {
      currentValue: parsed.data.currentValue,
      active: parsed.data.active,
    },
  });

  return {
    success: true as const,
    message: "Objetivo actualizado.",
  };
}
