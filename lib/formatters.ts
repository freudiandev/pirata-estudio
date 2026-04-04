import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  if (!minutes) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

export function formatShortDate(value: Date) {
  return format(value, "d 'de' MMM", { locale: es });
}

export function formatLongDate(value: Date) {
  return format(value, "EEEE d 'de' MMMM", { locale: es });
}

export function formatFriendlySuggestedDate(value: Date) {
  return format(value, "EEEE", { locale: es });
}

export function buildAsciiBar(percent: number) {
  const steps = 10;
  const filled = Math.round((Math.min(percent, 100) / 100) * steps);
  const empty = steps - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${Math.round(percent)}%`;
}
