import { GoalType, WorkProfile } from "@prisma/client";

type WorkProfileCopy = {
  label: string;
  shortLabel: string;
  jobTypeLabel: string;
  example: string;
  todayPrompt: string;
  pendingTitle: string;
  newJobHint: string;
};

const profileCopyMap: Record<WorkProfile, WorkProfileCopy> = {
  EMBROIDERY: {
    label: "Confección y bordado",
    shortLabel: "Taller",
    jobTypeLabel: "Tipo de prenda o pieza",
    example: "Ej. 20 polos bordados con logo",
    todayPrompt: "¿Ya registraste lo del taller hoy?",
    pendingTitle: "Esto es lo que ya prometiste entregar",
    newJobHint: "Piensa en prendas, piezas, tallas o acabados.",
  },
  SERVICE: {
    label: "Servicios",
    shortLabel: "Servicio",
    jobTypeLabel: "Tipo de servicio",
    example: "Ej. 6 mantenimientos y 2 visitas",
    todayPrompt: "¿Ya registraste el servicio de hoy?",
    pendingTitle: "Esto es lo que ya prometiste hacer",
    newJobHint: "Piensa en visitas, sesiones, turnos o paquetes.",
  },
  TECHNICAL: {
    label: "Trabajo técnico",
    shortLabel: "Técnico",
    jobTypeLabel: "Tipo de trabajo técnico",
    example: "Ej. 4 reparaciones de laptops",
    todayPrompt: "¿Ya registraste tus trabajos técnicos de hoy?",
    pendingTitle: "Esto es lo que ya prometiste resolver",
    newJobHint: "Piensa en diagnósticos, instalaciones o reparaciones.",
  },
  CREATIVE: {
    label: "Trabajo creativo",
    shortLabel: "Creativo",
    jobTypeLabel: "Tipo de proyecto creativo",
    example: "Ej. 3 piezas gráficas y una portada",
    todayPrompt: "¿Ya registraste lo creativo de hoy?",
    pendingTitle: "Esto es lo que ya prometiste crear",
    newJobHint: "Piensa en revisiones, entregables y rondas de cambios.",
  },
  CUSTOM: {
    label: "Personalizado",
    shortLabel: "Negocio",
    jobTypeLabel: "Tipo de trabajo",
    example: "Describe tu trabajo con tus palabras",
    todayPrompt: "¿Ya registraste lo de hoy?",
    pendingTitle: "Esto es lo que ya prometiste",
    newJobHint: "Usa palabras simples que te ayuden a decidir mejor.",
  },
};

export function getWorkProfileCopy(
  profile: WorkProfile,
  customWorkLabel?: string | null,
) {
  if (profile === "CUSTOM" && customWorkLabel) {
    return {
      ...profileCopyMap.CUSTOM,
      label: customWorkLabel,
      shortLabel: customWorkLabel,
    };
  }

  return profileCopyMap[profile];
}

export const goalTypeCopy: Record<
  GoalType,
  { label: string; unit: string; hint: string }
> = {
  INCOME: {
    label: "Ingresos",
    unit: "USD",
    hint: "Lo que quieres lograr de dinero en un periodo concreto.",
  },
  ORDER: {
    label: "Orden",
    unit: "registros",
    hint: "Cuántos días o registros quieres llevar al día.",
  },
  COMPLIANCE: {
    label: "Cumplimiento",
    unit: "entregas",
    hint: "Cuántas entregas quieres cumplir sin atrasarte.",
  },
  DISCIPLINE: {
    label: "Disciplina",
    unit: "días",
    hint: "Cuántos días quieres cerrar con el trabajo actualizado.",
  },
  CALM: {
    label: "Tranquilidad",
    unit: "días",
    hint: "Cuántos días quieres sentir que el negocio está bajo control.",
  },
};
