import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { getSampleHotelById } from '../data';
import PropertyImage from '../components/PropertyImage';
import { MapPin, Star, Share, Heart, CheckCircle, Wifi, Coffee, Car, Dumbbell, Wind, Info } from 'lucide-react';

const HotelDetails = () => {
  const { id } = useParams();
  const { user, toggleWishlist } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const isWishlisted = Boolean(user?.wishlist?.some(entry =>
    String(typeof entry === 'string' ? entry : entry?._id) === String(id)
  ));

  // Booking Card State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState('');
  
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        if (String(id).startsWith('sample-')) {
          const sample = getSampleHotelById(id);
          if (sample) {
            setHotel({
              ...sample,
              rooms: [
                {
                  _id: `${id}-room-1`,
                  name: 'Standard Room',
                  pricePerNight: sample.priceFrom,
                  maxGuests: 2,
                  beds: 1,
                  amenities: sample.amenities?.slice(0, 4) || [],
                },
                {
                  _id: `${id}-room-2`,
                  name: 'Deluxe Suite',
                  pricePerNight: sample.priceFrom + 40,
                  maxGuests: 4,
                  beds: 2,
                  amenities: sample.amenities || [],
                },
              ],
            });
            return;
          }
        }
        const res = await api.get(`/hotels/${id}`);
        setHotel(res.data.data);
      } catch (error) {
        console.error(error);
        const sample = getSampleHotelById(id);
        if (sample) {
          setHotel({
            ...sample,
            rooms: [
              {
                _id: `${id}-room-1`,
                name: 'Standard Room',
                pricePerNight: sample.priceFrom,
                maxGuests: 2,
                beds: 1,
                amenities: sample.amenities?.slice(0, 4) || [],
              },
            ],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id, user]);

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    setWishlistSaving(true);
    setWishlistError('');
    try {
      await toggleWishlist(hotel || { _id: id });
    } catch (error) {
      setWishlistError(error.response?.data?.message || error.message || 'Could not update your wishlist.');
    } finally {
      setWishlistSaving(false);
    }
  };

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;
  const roomDoc = hotel?.rooms?.find(r => r._id === selectedRoom);
  const priceEstimate = roomDoc && nights > 0 ? roomDoc.pricePerNight * nights : 0;

  const handleReserve = () => {
    if (!user) { navigate('/login'); return; }
    if (!checkIn || !checkOut || !selectedRoom) {
      alert("Please select dates and a room.");
      return;
    }
    // Navigate to booking checkout logic
    navigate(`/book/${selectedRoom}?hotelId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Loading...</div>;
  if (!hotel) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Hotel not found.</div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {hotel.propertyType}
            </span>
            <div style={{ display: 'flex', gap: '2px', color: 'var(--accent)' }}>
              {[...Array(hotel.starRating || 1)].map((_, i) => <Star key={i} size={16} fill="var(--accent)" />)}
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{hotel.name}</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={16} /> {hotel.address.street}, {hotel.address.city}, {hotel.address.country}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Share size={18} /> Share
          </button>
          <button onClick={handleWishlist} disabled={wishlistSaving} aria-pressed={isWishlisted} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderColor: isWishlisted ? 'var(--danger)' : '', color: isWishlisted ? 'var(--danger)' : '' }}>
            <Heart size={18} fill={isWishlisted ? 'var(--danger)' : 'transparent'} /> {isWishlisted ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      {wishlistError && <p role="alert" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{wishlistError}</p>}

      {/* Image Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 200px', gap: '0.5rem', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}>
        <div style={{ gridRow: '1 / 3' }}>
          <PropertyImage src={hotel.images?.[0]} propertyType={hotel.propertyType} alt={`${hotel.name} main view`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {hotel.images?.slice(1, 5).map((img, idx) => (
          <div key={idx}>
            <PropertyImage src={img} propertyType={hotel.propertyType} alt={`${hotel.name} gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', '@media(min-width: 900px)': { gridTemplateColumns: '2fr 1fr' } }}>
        <style>{`
          .main-content { grid-column: 1 / -1; }
          .sidebar-card { position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; border-radius: 16px 16px 0 0; border: none; border-top: 1px solid var(--border); box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
          @media(min-width: 900px) {
            .two-cols { display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; }
            .main-content { grid-column: 1 / 2; }
            .sidebar-card { position: sticky; top: 100px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-lg); }
          }
        `}</style>
        
        <div className="two-cols">
          {/* Left Column */}
          <div className="main-content">
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Overview</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{hotel.description}</p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {hotel.amenities?.map((amenity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <CheckCircle size={18} color="var(--secondary)" /> {amenity}
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Choose your room</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {hotel.rooms?.map(room => (
                  <div key={room._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', border: selectedRoom === room._id ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{room.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{room.beds} Beds • Max {room.capacity} Guests</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {room.amenities?.slice(0, 4).map((a, i) => <span key={i} style={{ background: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{a}</span>)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${room.pricePerNight}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>per night</div>
                        </div>
                        <button 
                          className={selectedRoom === room._id ? "btn" : "btn btn-outline"} 
                          onClick={() => setSelectedRoom(room._id)}
                        >
                          {selectedRoom === room._id ? "Selected" : "Select Room"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>House Rules</h2>
              <div className="card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Info size={18}/> Check-in</h4>
                  <p style={{ color: 'var(--text-muted)' }}>After {hotel.policies?.checkIn}</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Info size={18}/> Check-out</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Before {hotel.policies?.checkOut}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <h4 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Info size={18}/> Cancellation Policy</h4>
                  <p style={{ color: 'var(--text-muted)' }}>This property has a <strong style={{textTransform:'capitalize'}}>{hotel.policies?.cancellation}</strong> cancellation policy.</p>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Booking Card */}
          <div className="sidebar-card travel-panel" style={{ padding: '1.5rem', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200")' }}>
            {hotel.reviewSummary?.total > 0 && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                 <div style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>{hotel.reviewSummary.avgRating.toFixed(1)}</div>
                 <div style={{ fontWeight: 600 }}>Excellent</div>
                 <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({hotel.reviewSummary.total} reviews)</div>
               </div>
            )}
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              ${roomDoc ? roomDoc.pricePerNight : hotel.priceFrom} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ night</span>
            </h3>

            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, padding: '0.75rem 1rem', borderRight: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Check-In</label>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ border: 'none', padding: 0, width: '100%', background: 'transparent', outline: 'none' }} />
                </div>
                <div style={{ flex: 1, padding: '0.75rem 1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Check-Out</label>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ border: 'none', padding: 0, width: '100%', background: 'transparent', outline: 'none' }} />
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Guests</label>
                <input type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)} style={{ border: 'none', padding: 0, width: '100%', background: 'transparent', outline: 'none' }} />
              </div>
            </div>

            {nights > 0 && roomDoc ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>${roomDoc.pricePerNight} x {nights} nights</span>
                  <span>${priceEstimate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span>Total (est)</span>
                  <span>${priceEstimate}</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Select dates and a room to see exact pricing.
              </p>
            )}

            <button onClick={handleReserve} className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              Reserve
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
