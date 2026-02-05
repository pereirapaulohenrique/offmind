import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisYear,
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';

/**
 * Format a date for display in the UI
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date in a smart way based on how recent it is
 */
export function formatSmartDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) {
    return `Today at ${format(d, 'h:mm a')}`;
  }

  if (isTomorrow(d)) {
    return `Tomorrow at ${format(d, 'h:mm a')}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${format(d, 'h:mm a')}`;
  }

  if (isThisWeek(d)) {
    return format(d, 'EEEE at h:mm a');
  }

  if (isThisYear(d)) {
    return format(d, 'MMM d at h:mm a');
  }

  return format(d, 'MMM d, yyyy');
}

/**
 * Get the start and end of a week for calendar view
 */
export function getWeekBounds(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

/**
 * Get the start and end of a day
 */
export function getDayBounds(date: Date = new Date()) {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

/**
 * Add days/weeks to a date
 */
export { addDays, addWeeks, startOfWeek, endOfWeek, isToday, isTomorrow };
