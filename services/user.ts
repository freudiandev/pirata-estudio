import { WorkProfile, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      name: "Capitana Marina",
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
      workProfile: WorkProfile.EMBROIDERY,
      setupComplete: false,
    },
  });
}

export async function updateCurrentUser(data: Partial<User>) {
  const user = await getCurrentUser();

  return prisma.user.update({
    where: { id: user.id },
    data,
  });
}
