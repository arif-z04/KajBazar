import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  showValue = false,
  totalReviews = null,
  className = ''
}) => {
  const numericRating = Number(rating) || 0;

  return (
    <div className={`kb-rating-stars-wrap ${className}`.trim()}>
      <div className="kb-stars-row" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${numericRating} out of ${max}`}>
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(numericRating);

          if (interactive) {
            return (
              <button
                type="button"
                key={index}
                className={`kb-star-btn ${isFilled ? 'filled' : 'empty'}`}
                onClick={() => onChange && onChange(starValue)}
                aria-label={`${starValue} star`}
              >
                <Star
                  size={size}
                  className={`kb-star-icon ${isFilled ? 'star-filled' : 'star-empty'}`}
                  fill={isFilled ? 'currentColor' : 'none'}
                />
              </button>
            );
          }

          return (
            <Star
              key={index}
              size={size}
              className={`kb-star-icon ${isFilled ? 'star-filled' : 'star-empty'}`}
              fill={isFilled ? 'currentColor' : 'none'}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="kb-rating-numeric">
          <strong>{numericRating.toFixed(1)}</strong>
          {totalReviews !== null && <span className="kb-rating-count">({totalReviews})</span>}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
