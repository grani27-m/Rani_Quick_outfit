import { useState, useEffect, useCallback } from 'react';
import { shopsAPI } from '../api/shops.api';
import { MapPin, Star, Clock, Compass, Navigation } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import toast from 'react-hot-toast';

const mapContainerStyle = { width: '100%', height: '600px', borderRadius: '16px' };
const defaultCenter = { lat: 28.6139, lng: 77.209 }; // Default Delhi

export default function StoresPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  // Location & Map State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [radius, setRadius] = useState(5000); 
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    setLoading(true);
    if (userLocation) {
      shopsAPI.getNearby(userLocation.lat, userLocation.lng, radius)
        .then(({ data }) => setShops(data))
        .catch(() => toast.error('Failed to fetch nearby shops'))
        .finally(() => setLoading(false));
    } else {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      shopsAPI.getAll(params)
        .then(({ data }) => setShops(data))
        .finally(() => setLoading(false));
    }
  }, [search, category, userLocation, radius]);

  const handleLocateMe = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setViewMode('map');
        toast.success(`Location updated! Search radius: ${radius / 1000}km`);
      },
      () => {
        toast.error('Location access denied. Please enable location permissions.');
        setLocating(false);
      }
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    setViewMode('list');
  };

  return (
    <div className="section" style={{ background: '#F8F9FA', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-heading">Local Stores</h1>
            <p className="section-sub">Discover boutiques and shops near you</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search stores..." />
            
            <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setViewMode('list')} style={{ padding: '10px 16px', background: viewMode === 'list' ? 'var(--amber-pale)' : 'transparent', color: viewMode === 'list' ? 'var(--rust)' : 'var(--text-secondary)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>List</button>
              <button onClick={() => setViewMode('map')} style={{ padding: '10px 16px', background: viewMode === 'map' ? 'var(--amber-pale)' : 'transparent', color: viewMode === 'map' ? 'var(--rust)' : 'var(--text-secondary)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Map</button>
            </div>
          </div>
        </div>

        {/* Location Tools Bar */}
        <div className="card" style={{ padding: '16px 24px', marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn btn-primary" onClick={handleLocateMe} disabled={locating} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Navigation size={18} /> {locating ? 'Locating...' : 'Find shops near me'}
            </button>
            {userLocation && (
              <button className="btn btn-ghost" onClick={clearLocation} style={{ color: '#E53E3E', padding: '8px 12px' }}>Clear Location</button>
            )}
          </div>

          {userLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Search Radius: {radius / 1000}km</span>
              <input 
                type="range" 
                min="2000" 
                max="20000" 
                step="1000" 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))} 
                style={{ width: 150, accentColor: 'var(--amber)' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                {[2000, 5000, 10000, 20000].map(r => (
                  <button key={r} onClick={() => setRadius(r)} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: radius === r ? 'var(--amber)' : 'white', color: radius === r ? 'white' : 'var(--charcoal)', cursor: 'pointer' }}>
                    {r / 1000}k
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && !userLocation ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : (
          <>
            {/* MAP VIEW */}
            {viewMode === 'map' && isLoaded && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--border)', marginBottom: 48 }}>
                <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation || defaultCenter} zoom={userLocation ? 13 : 11}>
                  {userLocation && (
                    <Marker position={userLocation} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />
                  )}
                  {shops.map((shop) => {
                    const hasValidCoords = shop.location?.coordinates && shop.location.coordinates.length === 2;
                    if (!hasValidCoords) return null;
                    return (
                      <Marker 
                        key={shop._id}
                        position={{ lat: shop.location.coordinates[1], lng: shop.location.coordinates[0] }}
                        onClick={() => setSelectedShop(shop)}
                      />
                    );
                  })}
                  
                  {selectedShop && (
                    <InfoWindow 
                      position={{ lat: selectedShop.location.coordinates[1], lng: selectedShop.location.coordinates[0] }}
                      onCloseClick={() => setSelectedShop(null)}
                    >
                      <div style={{ padding: 8, maxWidth: 220 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selectedShop.name}</h4>
                        <p style={{ fontSize: 12, color: 'gray', marginBottom: 8 }}>{selectedShop.address}</p>
                        <span className={`badge ${selectedShop.isLive ? 'badge-green' : 'badge-gray'}`} style={{ marginBottom: 12, display: 'inline-block' }}>
                          {selectedShop.isLive ? 'Open' : 'Closed'}
                        </span>
                        <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => navigate(`/browse?shopId=${selectedShop._id}`)}>
                          View Products
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              shops.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
                  {shops.map((shop) => (
                    <div key={shop._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }} onClick={() => navigate(`/browse?shopId=${shop._id}`)}>
                      <div style={{ height: 160, background: 'linear-gradient(135deg, var(--amber-pale), var(--sage-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                        🏪
                      </div>
                      <div style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800 }}>{shop.name}</h3>
                          <span className={`badge ${shop.isLive ? 'badge-green' : 'badge-gray'}`}>{shop.isLive ? 'Open' : 'Closed'}</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{shop.description || 'Local fashion boutique'}</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8f9fa', padding: 12, borderRadius: 8 }}>
                          <span style={{ fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--charcoal)' }}><MapPin size={16} style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} /> {shop.address || 'Address available soon'}</span>
                          <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--charcoal)' }}><Star size={16} fill="var(--amber)" color="var(--amber)" /> {shop.rating?.toFixed(1) || '0.0'} · {shop.reviewCount || 0} reviews</span>
                          <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--charcoal)' }}><Clock size={16} style={{ color: 'gray' }} /> {shop.operatingHours?.open || '10:00 AM'} - {shop.operatingHours?.close || '9:00 PM'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)', background: 'white', borderRadius: 16 }}>
                  <Compass size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>No stores found nearby</p>
                  <p style={{ fontSize: 15 }}>Try increasing your search radius or moving the map to a different area.</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
