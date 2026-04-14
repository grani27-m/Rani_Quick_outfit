import { CATEGORIES, SIZES } from '../../data/constants';

export default function FilterPanel({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>Filters</h3>

      {/* Category */}
      <div>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button className={`btn btn-sm ${!filters.category || filters.category === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('category', 'all')}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={`btn btn-sm ${filters.category === c.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('category', c.id)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Price Range</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="form-input" type="number" placeholder="Min" value={filters.minPrice || ''} onChange={(e) => update('minPrice', e.target.value)} style={{ width: 100 }} />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input className="form-input" type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => update('maxPrice', e.target.value)} style={{ width: 100 }} />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Sizes</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SIZES.map((size) => (
            <button key={size} className={`btn btn-sm ${filters.sizes === size ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('sizes', filters.sizes === size ? '' : size)}>
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Sort By</label>
        <select className="form-select" value={filters.sort || 'newest'} onChange={(e) => update('sort', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={() => onChange({ category: 'all', sort: 'newest' })}>Clear All Filters</button>
    </div>
  );
}
