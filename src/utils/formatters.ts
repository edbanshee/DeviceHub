/**
 * Formats GB value to GB or TB with clean decimals.
 */
export function formatGigabytes(gb: number, decimals: number = 1): string {
  if (gb === undefined || gb === null || isNaN(gb)) return '0 GB';
  if (gb >= 1000) {
    const tb = gb / 1024;
    // If it's practically a whole number like 1024GB -> 1 TB
    return `${Number(tb.toFixed(decimals))} TB`;
  }
  return `${Number(gb.toFixed(decimals))} GB`;
}

export const formatStorageGB = formatGigabytes;

/**
 * Calculates used percentage (0 - 100)
 */
export function calculatePercentage(used: number, capacity: number): number {
  if (!capacity || capacity <= 0) return 0;
  const pct = (used / capacity) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Returns color classes for progress bars and badges based on usage percentage
 */
export function getUsageColorClass(percentage: number): {
  bar: string;
  text: string;
  badge: string;
  isHigh: boolean;
} {
  if (percentage >= 90) {
    return {
      bar: 'bg-rose-500 dark:bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      isHigh: true,
    };
  }
  if (percentage >= 70) {
    return {
      bar: 'bg-amber-500 dark:bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      isHigh: false,
    };
  }
  return {
    bar: 'bg-emerald-500 dark:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    isHigh: false,
  };
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
