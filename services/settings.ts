import { parseTimeToMinutes } from "@/lib/time";
import { onboardingSchema, settingsSchema } from "@/lib/validations";
import { updateCurrentUser } from "@/services/user";

async function validateAndSave(rawData: unknown, markSetupComplete: boolean) {
  const schema = markSetupComplete ? settingsSchema : onboardingSchema;
  const parsed = schema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Ajusta esos datos para que todo quede claro.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (
    parseTimeToMinutes(parsed.data.workingHoursEnd) <=
    parseTimeToMinutes(parsed.data.workingHoursStart)
  ) {
    return {
      success: false as const,
      message: "Tu hora de salida debe ser después de la de entrada.",
      fieldErrors: {
        workingHoursEnd: ["Debe ser una hora posterior."],
      },
    };
  }

  await updateCurrentUser({
    name: parsed.data.name,
    workingHoursStart: parsed.data.workingHoursStart,
    workingHoursEnd: parsed.data.workingHoursEnd,
    workProfile: parsed.data.workProfile,
    customWorkLabel:
      parsed.data.workProfile === "CUSTOM"
        ? parsed.data.customWorkLabel || "Mi oficio"
        : null,
    setupComplete: true,
  });

  return {
    success: true as const,
    message: "Ajustes guardados.",
  };
}

export async function saveOnboarding(rawData: unknown) {
  return validateAndSave(rawData, false);
}

export async function saveSettings(rawData: unknown) {
  return validateAndSave(rawData, true);
}
