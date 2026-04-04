import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { moneyEntrySchema } from "@/lib/validations";
import { getCurrentUser } from "@/services/user";

export async function listEntries() {
  const user = await getCurrentUser();

  return prisma.financialEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 12,
  });
}

export async function createEntry(rawData: unknown) {
  const parsed = moneyEntrySchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Revisa el movimiento antes de guardarlo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await getCurrentUser();

  await prisma.financialEntry.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      amount: new Prisma.Decimal(parsed.data.amount),
      type: parsed.data.type,
      category: parsed.data.category,
      date: new Date(parsed.data.date),
      notes: parsed.data.notes,
    },
  });

  return {
    success: true as const,
    message: "Movimiento guardado.",
  };
}
