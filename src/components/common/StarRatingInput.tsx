import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { getRatingConfig, getSafeRating } from '../../utils/ratingColors';

interface StarRatingInputProps {
  value: number;
  onChange?: (val: number) => void;
  label?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  label,
  readOnly = false,
  required = false,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : getSafeRating(value, 5);
  const config = getRatingConfig(displayRating);
  const meaning = config.label.es;

  const starSizeClass =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="space-y-1.5">
      {/* Header Row: Label on Left, Meaning in Single Line on Right (no number, no hyphen, in traffic-light semáforo color) */}
      <div className="flex items-center justify-between min-h-[20px]">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d8]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {meaning && (
          <span
            className={`text-xs font-bold font-sans ml-auto transition-colors ${config.textColor}`}
          >
            {meaning}
          </span>
        )}
      </div>

      {/* Interactive Stars Row (Traffic light semáforo filled stars) */}
      <div
        className="flex items-center gap-1.5"
        onMouseLeave={() => !readOnly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = displayRating >= star;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onClick={() => {
                if (!readOnly && onChange) {
                  onChange(star);
                }
              }}
              className={`p-1 rounded-lg transition-transform ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
              }`}
              title={`${star} - ${getRatingConfig(star).label.es}`}
            >
              <Star
                className={`${starSizeClass} transition-colors ${
                  isFilled
                    ? `${config.starColor} drop-shadow-xs`
                    : 'text-slate-300 dark:text-[#383840] hover:text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

