export interface RatingConfig {
  value: number;
  label: { es: string; en: string };
  textColor: string;
  fillColor: string;
  starColor: string;
  badgeBg: string;
  badgeBorder: string;
  dotColor: string;
}

export const RATING_CONFIG: Record<number, RatingConfig> = {
  5: {
    value: 5,
    label: { es: 'Excelente', en: 'Excellent' },
    textColor: 'text-emerald-600 dark:text-emerald-400',
    fillColor: 'fill-emerald-500 text-emerald-500',
    starColor: 'fill-emerald-500 text-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
  },
  4: {
    value: 4,
    label: { es: 'Muy Bueno', en: 'Very Good' },
    textColor: 'text-teal-600 dark:text-teal-400',
    fillColor: 'fill-teal-500 text-teal-500',
    starColor: 'fill-teal-500 text-teal-500',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeBorder: 'border-teal-200 dark:border-teal-800/60',
    dotColor: 'bg-teal-500',
  },
  3: {
    value: 3,
    label: { es: 'Bueno', en: 'Good' },
    textColor: 'text-amber-600 dark:text-amber-400',
    fillColor: 'fill-amber-500 text-amber-500',
    starColor: 'fill-amber-500 text-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeBorder: 'border-amber-200 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
  },
  2: {
    value: 2,
    label: { es: 'Regular', en: 'Fair' },
    textColor: 'text-orange-600 dark:text-orange-400',
    fillColor: 'fill-orange-500 text-orange-500',
    starColor: 'fill-orange-500 text-orange-500',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeBorder: 'border-orange-200 dark:border-orange-800/60',
    dotColor: 'bg-orange-500',
  },
  1: {
    value: 1,
    label: { es: 'Malo', en: 'Poor' },
    textColor: 'text-rose-600 dark:text-rose-400',
    fillColor: 'fill-rose-500 text-rose-500',
    starColor: 'fill-rose-500 text-rose-500',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeBorder: 'border-rose-200 dark:border-rose-800/60',
    dotColor: 'bg-rose-500',
  },
};

/**
 * Safely parses any rating value into an integer between 1 and 5.
 * Defaults to 5 if undefined, null, or out of range.
 */
export const getSafeRating = (rating?: any, defaultVal = 5): number => {
  if (typeof rating === 'number' && !isNaN(rating)) {
    return Math.min(5, Math.max(1, Math.round(rating)));
  }
  const parsed = Number(rating);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
    return Math.min(5, Math.max(1, Math.round(parsed)));
  }
  return defaultVal;
};

/**
 * Returns the semáforo color and label configuration for a rating.
 */
export const getRatingConfig = (rating?: any, defaultVal = 5): RatingConfig => {
  const safe = getSafeRating(rating, defaultVal);
  return RATING_CONFIG[safe] || RATING_CONFIG[5];
};
