export interface TimeInterval {
  start: string;
  end: string;
}

export function generateHourlyIntervals(
  startDate: string,
  endDate: string,
): TimeInterval[] {
  const intervals: TimeInterval[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const currentHour = new Date(start);

  while (currentHour < end) {
    const intervalEnd = new Date(currentHour);
    intervalEnd.setHours(intervalEnd.getHours() + 1);

    if (intervalEnd > end) {
      intervals.push({
        start: currentHour.toISOString(),
        end: end.toISOString(),
      });
    } else {
      intervals.push({
        start: currentHour.toISOString(),
        end: intervalEnd.toISOString(),
      });
    }

    currentHour.setHours(currentHour.getHours() + 1);
  }

  return intervals;
}
