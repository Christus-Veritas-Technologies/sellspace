function fullMonthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

function fullYearsBetween(start: Date, end: Date): number {
  let years = end.getFullYear() - start.getFullYear();

  if (
    end.getMonth() < start.getMonth()
    || (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
  ) {
    years -= 1;
  }

  return Math.max(0, years);
}

export function formatMembershipDuration(createdAt: string | Date, now = new Date()): string {
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const dayDifference = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / 86400000));

  if (dayDifference < 29) {
    return `${dayDifference} ${dayDifference === 1 ? "day" : "days"}`;
  }

  const monthDifference = fullMonthsBetween(createdDate, now);
  if (monthDifference < 12) {
    const months = Math.max(1, monthDifference);
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  const yearDifference = Math.max(1, fullYearsBetween(createdDate, now));
  return `${yearDifference} ${yearDifference === 1 ? "year" : "years"}`;
}