import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import api from '../api/axios';
import { filterSampleHotels } from '../data';
import { SlidersHorizontal, MapPin, Calendar, Users, LayoutGrid, List } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  
  // Search bar state
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');

  // Filter state
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recommended');
  
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setCity(searchParams.get('city') || '');
    setCheckIn(searchParams.get('checkIn') || '');
    setCheckOut(searchParams.get('checkOut') || '');
    setGuests(searchParams.get('guests') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinRating(searchParams.get('minRating') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setSort(searchParams.get('sort') || 'recommended');
  }, [searchParams]);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/hotels?${query}`);
        const apiHotels = res.data.data || [];
        setHotels(apiHotels);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Error fetching hotels', error);
        const filtered = filterSampleHotels({
          city: searchParams.get('city') || '',
          propertyType: searchParams.get('propertyType') || '',
          minPrice: searchParams.get('minPrice') || '',
          maxPrice: searchParams.get('maxPrice') || '',
          minRating: searchParams.get('minRating') || '',
        });
        setHotels(filtered);
        setPagination({ total: filtered.length, page: 1, pages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (city) newParams.set('city', city); else newParams.delete('city');
    if (checkIn) newParams.set('checkIn', checkIn); else newParams.delete('checkIn');
    if (checkOut) newParams.set('checkOut', checkOut); else newParams.delete('checkOut');
    if (guests) newParams.set('guests', guests); else newParams.delete('guests');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setCity(''); setCheckIn(''); setCheckOut(''); setGuests('');
    setMinPrice(''); setMaxPrice(''); setMinRating(''); setPropertyType(''); setSort('recommended');
  };

  return (
    <div className="page-shell" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Top Search Bar */}
      <div className="travel-panel" style={{ borderBottom: '1px solid var(--border)', padding: '1rem 0', position: 'sticky', top: '70px', zIndex: 30, ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600")' }}>
        <div className="container">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 8px', background: 'var(--bg-color)' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <input type="text" placeholder="Destination" value={city} onChange={e => setCity(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 8px', background: 'var(--bg-color)' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 8px', background: 'var(--bg-color)' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ flex: '0 1 100px', display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 8px', background: 'var(--bg-color)' }}>
              <Users size={18} color="var(--text-muted)" />
              <input type="number" min="1" placeholder="Guests" value={guests} onChange={e => setGuests(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.5rem' }} />
            </div>
            <button type="submit" className="btn">Search</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Sidebar Filters */}
        <aside style={{ 
          width: '280px', flexShrink: 0, 
          display: showMobileFilters ? 'block' : 'none',
          '@media (minWidth: 768px)': { display: 'block' }
        }} className="desktop-sidebar">
          <div className="card travel-panel" style={{ padding: '1.5rem', borderRadius: '12px', position: 'sticky', top: '150px', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200")' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600 }}>Filter by</h3>
              <button onClick={clearFilters} style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Clear all</button>
            </div>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Your budget (per night)</h4>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} onBlur={() => updateFilters('minPrice', minPrice)} style={{ width: '100%', padding: '0.5rem' }} />
                <span>-</span>
                <input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} onBlur={() => updateFilters('maxPrice', maxPrice)} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Property Rating</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => { setMinRating(star.toString()); updateFilters('minRating', star.toString()); }}
                    style={{ 
                      padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem',
                      border: '1px solid var(--border)',
                      background: minRating === star.toString() ? 'var(--primary)' : 'var(--bg-surface)',
                      color: minRating === star.toString() ? '#fff' : 'var(--text-main)'
                    }}
                  >
                    {star} Stars +
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Property Type</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['hotel', 'resort', 'villa', 'hostel', 'apartment', 'boutique'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="propertyType" 
                      checked={propertyType === type}
                      onChange={() => { setPropertyType(type); updateFilters('propertyType', type); }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filters Toggle (CSS handles visibility) */}
        <style>{`
          .mobile-filter-btn { display: flex; }
          .desktop-sidebar { display: none !important; }
          @media (min-width: 900px) {
            .mobile-filter-btn { display: none !important; }
            .desktop-sidebar { display: block !important; }
          }
        `}</style>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              {city ? `${city}: ` : ''} {pagination?.total || 0} properties found
            </h1>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="mobile-filter-btn btn btn-outline" onClick={() => setShowMobileFilters(!showMobileFilters)} style={{ padding: '0.4rem 0.8rem' }}>
                <SlidersHorizontal size={16} style={{ marginRight: '0.5rem' }} /> Filters
              </button>
              
              <select 
                value={sort} 
                onChange={(e) => { setSort(e.target.value); updateFilters('sort', e.target.value); }}
                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
              >
                <option value="recommended">Our Top Picks</option>
                <option value="priceAsc">Price (lowest first)</option>
                <option value="priceDesc">Price (highest first)</option>
                <option value="ratingDesc">Property Rating (high to low)</option>
              </select>

              <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem', background: viewMode === 'grid' ? 'var(--border)' : 'transparent' }}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem', background: viewMode === 'list' ? 'var(--border)' : 'transparent' }}><List size={18} /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '1.5rem' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ height: '350px', background: 'var(--border)', borderRadius: '12px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div style={{ background: 'var(--bg-surface)', padding: '4rem 2rem', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>No properties found</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Try adjusting your filters or search destination.</p>
              <button onClick={clearFilters} className="btn">Clear all filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '1.5rem' }}>
              {hotels.map(hotel => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              {[...Array(pagination.pages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => updateFilters('page', (i + 1).toString())}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: pagination.page === i + 1 ? 'var(--primary)' : 'var(--bg-surface)',
                    color: pagination.page === i + 1 ? '#fff' : 'var(--text-main)',
                    border: '1px solid var(--border)',
                    fontWeight: 500
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Search;
