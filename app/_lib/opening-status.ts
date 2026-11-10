import type { OpeningHour } from "@/app/_types/establishment-details";

const WEEKDAY_NUMBERS: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export function getOpeningStatus(
  openingHours: OpeningHour[],
  currentTime: Date = new Date(),
): boolean | null {
  if (openingHours.length === 0) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(currentTime);

  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  const dayNumber = weekday ? WEEKDAY_NUMBERS[weekday] : undefined;

  if (!dayNumber || hour === undefined || minute === undefined) {
    return null;
  }

  const today = openingHours.find(
    (schedule) => schedule.dayOfWeek === dayNumber,
  );

  if (!today) {
    return null;
  }

  if (today.closed) {
    return false;
  }

  if (!today.openingTime || !today.closingTime) {
    return null;
  }

  // O backend representa funcionamento 24 horas como 00:00–00:00.
  const open24Hours =
    today.openingTime === "00:00" && today.closingTime === "00:00";

  if (open24Hours) {
    return true;
  }

  const currentHour = `${hour}:${minute}`;

  return currentHour >= today.openingTime && currentHour < today.closingTime;
}
