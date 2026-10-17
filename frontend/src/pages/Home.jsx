import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import PropertyImage from '../components/PropertyImage';
import api from '../api/axios';
import { sampleHotels, featuredSampleHotels } from '../data';
import { MapPin, Calendar, Users, Shield, Clock, CreditCard, Award } from 'lucide-react';

const Home = () => {
  const [featuredHotels, setFeaturedHotels] = useState(featuredSampleHotels);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  
  // Search state
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, citiesRes] = await Promise.all([
          api.get('/hotels/featured'),
          api.get('/hotels/cities')
        ]);
        const apiFeatured = featuredRes.data.data || [];
        setFeaturedHotels(apiFeatured.length > 0 ? apiFeatured : featuredSampleHotels);
        setPopularCities(citiesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching home data', error);
        setFeaturedHotels(featuredSampleHotels);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);
    navigate(`/search?${params.toString()}`);
  };

  const handleNewsletterSubmit = async event => {
    event.preventDefault();
    setNewsletterSubmitting(true);
    setNewsletterMessage('');

    try {
      const response = await api.post('/newsletter', { email: newsletterEmail });
      setNewsletterStatus('success');
      setNewsletterMessage(response.data.message || 'Thanks for subscribing!');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage(error.response?.data?.message || 'Could not subscribe right now. Please try again.');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const propertyTypes = [
    { name: 'Hotels', value: 'hotel', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300' },
    { name: 'Resorts', value: 'resort', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300' },
    { name: 'Villas', value: 'villa', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300' },
    { name: 'Hostels', value: 'hostel', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300' },
    { name: 'Apartments', value: 'apartment', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300' },
    { name: 'Boutique', value: 'boutique', img: 'https://images.unsplash.com/photo-1515542622106-78b28af7815b?w=300' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem'
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(15,23,42,0.4), rgba(15,23,42,0.8))',
          zIndex: -1
        }} />

        <div className="container" style={{ textAlign: 'center', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Find your next stay
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Search low prices on hotels, homes and much more...
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{
            background: 'var(--bg-surface)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            maxWidth: '900px',
            margin: '0 auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '8px', padding: '0 12px' }}>
              <MapPin size={20} color="var(--text-muted)" />
              <input type="text" placeholder="Where are you going?" value={city} onChange={e => setCity(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', boxShadow: 'none' }} />
            </div>
            
            <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '8px', padding: '0 12px' }}>
              <Calendar size={20} color="var(--text-muted)" />
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', boxShadow: 'none' }} />
            </div>

            <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '8px', padding: '0 12px' }}>
              <Calendar size={20} color="var(--text-muted)" />
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', boxShadow: 'none' }} />
            </div>

            <div style={{ flex: '0 1 120px', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '8px', padding: '0 12px' }}>
              <Users size={20} color="var(--text-muted)" />
              <input type="number" min="1" placeholder="Guests" value={guests} onChange={e => setGuests(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', boxShadow: 'none' }} />
            </div>

            <button type="submit" className="btn" style={{ flex: '0 0 auto', padding: '0 2rem', fontSize: '1.1rem' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>
      ) : (
        <>
          {/* Property Types */}
          <section className="container" style={{ padding: '4rem 1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Browse by property type</h2>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
              {propertyTypes.map(type => (
                <Link key={type.value} to={`/search?propertyType=${type.value}`} style={{ minWidth: '160px', flex: '0 0 auto' }}>
                  <PropertyImage src={type.img} propertyType={type.value} alt={type.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>{type.name}</h3>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Cities */}
          {popularCities.length > 0 && (
            <section className="container" style={{ padding: '0 1.5rem 4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Trending Destinations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {popularCities.map(city => (
                  <Link key={city._id} to={`/search?city=${city._id}`} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '200px', display: 'block' }}>
                    <PropertyImage src={city.image} alt={`${city._id} destination`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: '#fff' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{city._id}</h3>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{city.count} {city.count === 1 ? 'property' : 'properties'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured Stays */}
          {featuredHotels.length > 0 && (
            <section className="container" style={{ padding: '0 1.5rem 4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Featured Stays</h2>
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {featuredHotels.map(hotel => (
                  <div key={hotel._id} style={{ minWidth: '300px', maxWidth: '350px', flex: '0 0 auto' }}>
                    <HotelCard hotel={hotel} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Explore sample catalog (100+ stays) */}
          <section style={{ padding: '4rem 0' }}>
            <div className="container" style={{ padding: '0 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>Explore Stays</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {sampleHotels.length}+ curated sample properties — data lives in <code>src/data</code>
                  </p>
                </div>
                <Link to="/search" className="btn-outline" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  View all search
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {sampleHotels.slice(0, visibleCount).map((hotel, idx) => (
                  <HotelCard key={hotel._id} hotel={hotel} themeIndex={idx} />
                ))}
              </div>
              {visibleCount < sampleHotels.length && (
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setVisibleCount((c) => Math.min(c + 24, sampleHotels.length))}
                  >
                    Load more ({Math.min(visibleCount + 24, sampleHotels.length)} / {sampleHotels.length})
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Why Book With Us */}
          <section className="travel-panel" style={{ padding: '4rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600")' }}>
            <div className="container">
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Why Book With Us</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                <div>
                  <Shield size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Secure Booking</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your data and payments are heavily protected.</p>
                </div>
                <div>
                  <Clock size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>24/7 Support</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our team is available worldwide at any hour.</p>
                </div>
                <div>
                  <CreditCard size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Flexible Payments</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pay now or at the property on selected stays.</p>
                </div>
                <div>
                  <Award size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Best Price Guarantee</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We'll match the price if you find it cheaper.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--primary)', color: '#fff', borderRadius: '16px', padding: '3rem 2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>Save time, save money!</h2>
              <p style={{ marginBottom: '2rem', opacity: 0.9 }}>Sign up and we'll send the best deals to you</p>
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
                <input
                  type="email"
                  name="email"
                  aria-label="Email address for newsletter"
                  placeholder="Your email address"
                  autoComplete="email"
                  required
                  value={newsletterEmail}
                  disabled={newsletterSubmitting}
                  onChange={event => setNewsletterEmail(event.target.value)}
                  style={{ flex: 1, minWidth: 0, padding: '0.8rem 1rem', border: 'none', borderRadius: '8px' }}
                />
                <button type="submit" className="btn" disabled={newsletterSubmitting} style={{ background: 'var(--text-main)', color: 'var(--bg-color)' }}>
                  {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsletterMessage && <p role={newsletterStatus === 'error' ? 'alert' : 'status'} style={{ marginTop: '1rem' }}>{newsletterMessage}</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
