import { Availability } from "./types";

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getMonthDays(year: number, month: number) {
  // month 0-indexed
  const firstDay = new Date(year, month, 1);
  const days: Date[] = [];
  while (firstDay.getMonth() === month) {
    days.push(new Date(firstDay));
    firstDay.setDate(firstDay.getDate() + 1);
  }
  return days;
}

export function groupAvailabilityByDate(availabilities: Availability[]) {
  return availabilities.reduce<Record<string, Availability[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

export function getPeriodLabel(period: Availability["period"]): string {
  switch (period) {
    case "morning":
      return "午前";
    case "afternoon":
      return "午後";
    case "night":
      return "夜間";
    default:
      return period;
  }
}

export function statusLabel(status: Availability["status"]): string {
  switch (status) {
    case "available":
      return "空きあり";
    case "few":
      return "残りわずか";
    case "full":
      return "満員";
    case "closed":
      return "休館";
    default:
      return status;
  }
}
