import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 14, interactive = false, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? 'var(--amber)' : 'none'}
          color={star <= rating ? 'var(--amber)' : 'var(--border)'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.15s' }}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );
}
