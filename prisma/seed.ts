import {
  EntryType,
  GoalType,
  JobStatus,
  Prisma,
  WorkProfile,
} from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

async function main() {
  const existing = await prisma.user.findFirst();

  if (existing) {
    return;
  }

  const today = startOfDay(new Date());
  const user = await prisma.user.create({
    data: {
      name: "Capitana Marina",
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
      workProfile: WorkProfile.EMBROIDERY,
      setupComplete: false,
    },
  });

  await prisma.job.createMany({
    data: [
      {
        userId: user.id,
        clientName: "Panadería Sol",
        type: "Gorras bordadas",
        description: "12 gorras negras con logo pequeño al frente.",
        quantity: 12,
        price: new Prisma.Decimal(96),
        cost: new Prisma.Decimal(34),
        timePerUnitMinutes: 18,
        totalTimeMinutes: 216,
        deadline: addDays(today, 1),
        status: JobStatus.IN_PROGRESS,
        progressPercent: 35,
        actualWorkedMinutes: 110,
      },
      {
        userId: user.id,
        clientName: "Colegio Mar Azul",
        type: "Uniformes",
        description: "8 bordados de escudo para camisas escolares.",
        quantity: 8,
        price: new Prisma.Decimal(72),
        cost: new Prisma.Decimal(26),
        timePerUnitMinutes: 20,
        totalTimeMinutes: 160,
        deadline: addDays(today, 3),
        status: JobStatus.PENDING,
        progressPercent: 0,
        actualWorkedMinutes: 0,
      },
    ],
  });

  await prisma.financialEntry.createMany({
    data: [
      {
        userId: user.id,
        type: EntryType.INCOME,
        title: "Abono del Colegio Mar Azul",
        amount: new Prisma.Decimal(40),
        category: "Anticipo",
        date: today,
      },
      {
        userId: user.id,
        type: EntryType.EXPENSE,
        title: "Hilo y backing",
        amount: new Prisma.Decimal(18),
        category: "Materiales",
        date: today,
      },
    ],
  });

  await prisma.dailyLog.create({
    data: {
      userId: user.id,
      date: today,
      totalWorkedMinutes: 180,
      notes: "Avance de gorras y revisión de entregas.",
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Cerrar la semana con todo al día",
        type: GoalType.DISCIPLINE,
        targetValue: 5,
        currentValue: 2,
        unit: "días",
        periodLabel: "esta semana",
      },
      {
        userId: user.id,
        title: "Ingresar 500 este mes",
        type: GoalType.INCOME,
        targetValue: 500,
        currentValue: 140,
        unit: "USD",
        periodLabel: "este mes",
      },
    ],
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
