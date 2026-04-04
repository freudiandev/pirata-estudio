import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { clamp } from "@/lib/utils";

export function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getWorkingMinutesPerDay(
  workingHoursStart: string,
  workingHoursEnd: string,
) {
  const start = parseTimeToMinutes(workingHoursStart);
  const end = parseTimeToMinutes(workingHoursEnd);
  return Math.max(end - start, 0);
}

export function getAvailableMinutesForDate(options: {
  date: Date;
  now: Date;
  workingHoursStart: string;
  workingHoursEnd: string;
  todayWorkedMinutes: number;
}) {
  const { date, now, workingHoursStart, workingHoursEnd, todayWorkedMinutes } =
    options;
  const totalForDay = getWorkingMinutesPerDay(workingHoursStart, workingHoursEnd);

  if (!isSameDay(date, now)) {
    return totalForDay;
  }

  const start = parseTimeToMinutes(workingHoursStart);
  const end = parseTimeToMinutes(workingHoursEnd);
  const current = now.getHours() * 60 + now.getMinutes();

  if (current >= end) {
    return 0;
  }

  const windowRemaining = current <= start ? totalForDay : end - current;
  const unspentCapacity = totalForDay - todayWorkedMinutes;

  return clamp(Math.min(windowRemaining, unspentCapacity), 0, totalForDay);
}

export function getDayLabel(date: Date, baseDate = new Date()) {
  if (isSameDay(date, baseDate)) {
    return "Hoy";
  }

  if (isSameDay(date, addDays(baseDate, 1))) {
    return "Mañana";
  }

  if (isSameDay(date, addDays(baseDate, 2))) {
    return "Pasado mañana";
  }

  return format(date, "EEEE d 'de' MMM", { locale: es });
}

export function asStartOfDay(date: Date) {
  return startOfDay(date);
}

export function asEndOfDay(date: Date) {
  return endOfDay(date);
}
