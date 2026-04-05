import { WorkProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  const existing = await prisma.user.findFirst();

  if (existing) {
    return;
  }

  await prisma.user.create({
    data: {
      name: "Capitana Marina",
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
      workProfile: WorkProfile.EMBROIDERY,
      setupComplete: false,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
