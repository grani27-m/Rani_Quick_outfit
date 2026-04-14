import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ value = '', onChange, placeholder = 'Search products, shops...' }) {
  const [query, setQuery] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange?.(query);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div style={{ position: 'relative', maxWidth: 480, width: '100%' }}>
      <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input
        className="form-input"
        style={{ paddingLeft: 42, paddingRight: query ? 38 : 16 }}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
