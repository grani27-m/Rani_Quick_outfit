import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api/products.api';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import { SlidersHorizontal, X } from 'lucide-react';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    sizes: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sizes) params.sizes = filters.sizes;

      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [filters, page]);

  const handleSearch = (query) => {
    setFilters((f) => ({ ...f, search: query }));
    setPage(1);
  };

  return (
    <div className="section">
      <div className="container">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-heading">Browse Products</h1>
            <p className="section-sub">{total} products found</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SearchBar value={filters.search} onChange={handleSearch} />
            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />} Filters
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '280px 1fr' : '1fr', gap: 24, transition: 'all 0.3s' }}>
          {showFilters && <FilterPanel filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />}

          <div>
            {loading ? (
              <div className="loading-page"><div className="spinner"></div></div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
                {total > 20 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                    <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span style={{ padding: '8px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>Page {page}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPage(page + 1)}>Next</button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🔍</span>
                <p style={{ fontSize: 18, fontWeight: 600 }}>No products found</p>
                <p style={{ fontSize: 14 }}>Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
