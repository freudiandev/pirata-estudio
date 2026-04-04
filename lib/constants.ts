export const workProfileOptions = [
  { value: "EMBROIDERY", label: "Confección y bordado" },
  { value: "SERVICE", label: "Servicios" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "CREATIVE", label: "Creativo" },
  { value: "CUSTOM", label: "Personalizado" },
] as const;

export type WorkProfileValue = (typeof workProfileOptions)[number]["value"];

export const goalTypeOptions = [
  { value: "INCOME", label: "Ingresos", unit: "USD" },
  { value: "ORDER", label: "Orden", unit: "registros" },
  { value: "COMPLIANCE", label: "Cumplimiento", unit: "entregas" },
  { value: "DISCIPLINE", label: "Disciplina", unit: "días" },
  { value: "CALM", label: "Tranquilidad", unit: "días" },
] as const;

export type GoalTypeValue = (typeof goalTypeOptions)[number]["value"];

export const jobStatusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En marcha" },
  { value: "READY", label: "Listo" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

export type JobStatusValue = (typeof jobStatusOptions)[number]["value"];

export const entryTypeOptions = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Gasto" },
] as const;

export type EntryTypeValue = (typeof entryTypeOptions)[number]["value"];
