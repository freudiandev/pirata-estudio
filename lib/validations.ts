import { EntryType, GoalType, JobStatus, WorkProfile } from "@prisma/client";
import { z } from "zod";
import { toNumber } from "@/lib/utils";

const moneyNumber = z.preprocess(
  (value) => toNumber(value),
  z.number().min(0, "No puede ser negativo."),
);

const wholeNumber = z.preprocess(
  (value) => Number(value),
  z.number().int().min(0),
);

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Cuéntame al menos un nombre corto."),
  workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/),
  workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/),
  workProfile: z.nativeEnum(WorkProfile),
  customWorkLabel: z.string().trim().optional(),
});

export const settingsSchema = onboardingSchema.extend({
  setupComplete: z.boolean().optional(),
});

export const moneyEntrySchema = z.object({
  title: z.string().trim().min(2, "Escribe algo breve para reconocerlo."),
  amount: moneyNumber.refine((value) => value > 0, "Debe ser mayor a cero."),
  type: z.nativeEnum(EntryType),
  category: z.string().trim().min(2, "Pon una categoría simple."),
  date: z.string().min(1),
  notes: z.string().trim().optional(),
});

export const dailyLogSchema = z.object({
  totalWorkedMinutes: wholeNumber.refine(
    (value) => value > 0,
    "Pon cuántos minutos trabajaste hoy.",
  ),
  notes: z.string().trim().optional(),
});

export const jobCreateSchema = z
  .object({
    clientName: z.string().trim().min(2, "Escribe el nombre del cliente."),
    type: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
        "Pon la fecha y la hora en que entró el pedido.",
      ),
    description: z.string().trim().min(8, "Descríbelo con un poco más de detalle."),
    quantity: z.preprocess(
      (value) => Number(value),
      z.number().int().min(1, "Debe ser al menos 1."),
    ),
    price: moneyNumber,
    cost: moneyNumber,
    timePerUnitMinutes: wholeNumber.optional(),
    totalTimeMinutes: wholeNumber.optional(),
    deadline: z.string().min(1, "Necesitamos una fecha prometida."),
  })
  .superRefine((value, ctx) => {
    const hasPerUnit = Boolean(value.timePerUnitMinutes && value.timePerUnitMinutes > 0);
    const hasTotal = Boolean(value.totalTimeMinutes && value.totalTimeMinutes > 0);

    if (!hasPerUnit && !hasTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timePerUnitMinutes"],
        message: "Pon tiempo por unidad o tiempo total.",
      });
    }
  });

export const jobUpdateSchema = z.object({
  progressPercent: z.preprocess(
    (value) => Number(value),
    z.number().int().min(0).max(100),
  ),
  status: z.nativeEnum(JobStatus),
  workedMinutesToday: wholeNumber.optional(),
});

export const goalCreateSchema = z.object({
  title: z.string().trim().min(2, "Ponle un nombre sencillo."),
  type: z.nativeEnum(GoalType),
  targetValue: z.preprocess(
    (value) => Number(value),
    z.number().int().min(1, "Tu meta debe ser mayor a cero."),
  ),
  currentValue: wholeNumber.optional(),
  unit: z.string().trim().min(1),
  periodLabel: z.string().trim().min(2),
});

export const goalUpdateSchema = z.object({
  currentValue: z.preprocess(
    (value) => Number(value),
    z.number().int().min(0),
  ),
  active: z.preprocess((value) => value === "true" || value === true, z.boolean()),
});
