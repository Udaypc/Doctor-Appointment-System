"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

type Props = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  showLabel?: boolean;
};

export default function StarRatingInput({
  value,
  onChange,
  size = 28,
  showLabel = true,
}: Props) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= active;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => onChange(n)}
              className="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Star
                size={size}
                strokeWidth={1.5}
                className={
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-300"
                }
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 h-4">
          {active ? LABELS[active] : "Tap a star to rate"}
        </p>
      )}
    </div>
  );
}
