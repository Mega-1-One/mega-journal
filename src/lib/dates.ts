export type DatePreset =
  | 'ALL'
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_YEAR'
  | 'CUSTOM';

export function isDateInPreset(
  dateString: string,
  preset: DatePreset,
  customStart?: string,
  customEnd?: string
): boolean {
  if (preset === 'ALL') return true;

  const date = new Date(dateString);
  const now = new Date();

  // Reset hours for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === 'TODAY') {
    return date >= today;
  }

  if (preset === 'YESTERDAY') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const endYesterday = new Date(today);
    return date >= yesterday && date < endYesterday;
  }

  if (preset === 'THIS_WEEK') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return date >= startOfWeek;
  }

  if (preset === 'LAST_WEEK') {
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    return date >= startOfLastWeek && date < startOfThisWeek;
  }

  if (preset === 'THIS_MONTH') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return date >= startOfMonth;
  }

  if (preset === 'LAST_MONTH') {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return date >= startOfLastMonth && date < startOfThisMonth;
  }

  if (preset === 'THIS_YEAR') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return date >= startOfYear;
  }

  if (preset === 'CUSTOM' && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  }

  return true;
}
