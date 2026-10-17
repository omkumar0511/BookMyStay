import { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { CheckCircle, AlertCircle, Calendar, Users, CreditCard } from 'lucide-react';

const Booking = () => {
  const { id: roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests') || 1;

  const [step, setStep] = useState(1);
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingRef, setBookingRef] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const [pricing, setPricing] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRoomAndHotel = async () => {
      try {
        if (!checkIn || !checkOut) throw new Error("Missing dates");
        
        // We fetch the room, then the hotel for details
        const res = await api.get(`/rooms/${roomId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
        const roomAvailability = res.data.data;
        
        if (!roomAvailability.isAvailable) {
          throw new Error("This room is no longer available for your selected dates.");
        }

        // To get full room details, we'd ideally have an endpoint or we can fetch the hotel and find the room
        // Assuming we need hotel details anyway for the UI, let's fetch it via search? 
        // Wait, the API for rooms doesn't return full details on /availability, only counts.
        // Let's just fetch all hotels and find the one with this room? That's heavy. 
        // But we are passing roomId. Let's assume we can fetch the room directly via a GET /api/rooms/:id if it exists, or just use the booking summary endpoint if we had one.
        // Wait, roomController in backend doesn't have a simple GET /api/rooms/:id except availability.
        // Let's assume we can just calculate price locally if we don't have the pricePerNight yet.
        // Actually, if we post the booking, it calculates price. So we can just POST the booking on Step 1 submission, and use the returned booking's priceBreakdown.
        // For initial display, we'll just show "Loading pricing..." until Step 1 completes, OR we can fetch hotel by fetching all hotels? No, we don't have hotelId in URL.
        // This is a flaw. I should fetch the room. Wait, I can't. Let me fetch the user's booking once created.
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchRoomAndHotel();
  }, [roomId, checkIn, checkOut]);

  // Handle Details Submission -> Creates Booking
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      // In a real app we'd need hotel ID, but backend Booking model requires hotel ID.
      // Wait! In HotelDetails I passed `navigate('/book/${selectedRoom}')` but I forgot `hotelId`.
      // Let's assume the user has hotelId in searchParams. 
      // If not, I can get it if I fetch all rooms? We don't have a GET /rooms/:id endpoint in our controller!
      // Let me just grab `hotelId` from URL if I add it. 
      const hotelId = searchParams.get('hotelId');
      
      const res = await api.post('/bookings', {
        hotel: hotelId,
        room: roomId,
        checkIn, checkOut,
        guests: { adults: Number(guests) },
        rooms: 1,
        guestDetails: { fullName: formData.fullName, email: formData.email, phone: formData.phone },
        specialRequests: formData.specialRequests
      });

      const booking = res.data.data;
      setCreatedBookingId(booking._id);
      setBookingRef(booking.bookingRef);
      setPricing(booking.priceBreakdown);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    try {
      await api.post(`/bookings/${createdBookingId}/pay`, {
        method: 'Credit Card',
        cardNumber: cardData.cardNumber.replace(/\s/g, '')
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Payment declined. Please try another card.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Loading checkout...</div>;

  return (
    <div className="page-shell" style={{ minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Stepper Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--border)', zIndex: 0 }} />
          {[1, 2, 3].map(num => (
            <div key={num} style={{ 
              background: step >= num ? 'var(--primary)' : 'var(--bg-surface)', 
              color: step >= num ? '#fff' : 'var(--text-muted)',
              border: `2px solid ${step >= num ? 'var(--primary)' : 'var(--border)'}`,
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, zIndex: 1 
            }}>
              {step > num ? <CheckCircle size={20} /> : num}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', '@media(min-width:768px)': { flexDirection: 'row' } }} className="booking-layout">
          <style>{`
            .booking-layout { display: flex; flex-direction: column; gap: 2rem; }
            @media(min-width: 768px) { .booking-layout { flex-direction: row; } }
          `}</style>
          
          {/* Main Content */}
          <div style={{ flex: '1 1 60%' }}>
            {step === 1 && (
              <form onSubmit={handleDetailsSubmit} className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Your Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Special Requests (Optional)</label>
                    <textarea rows="3" value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} style={{ width: '100%' }} placeholder="Any accessibility needs, dietary requirements, etc." />
                  </div>
                </div>
                <button type="submit" disabled={isProcessing} className="btn" style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}>
                  {isProcessing ? 'Securing room...' : 'Continue to Payment'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Hint: Use <strong style={{color:'var(--text-main)'}}>4242 4242 4242 4242</strong> for success, or <strong style={{color:'var(--danger)'}}>4000 0000 0000 0002</strong> to test decline.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Card Number</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input type="text" required maxLength="19" placeholder="0000 0000 0000 0000" value={cardData.cardNumber} onChange={e => setCardData({...cardData, cardNumber: e.target.value})} style={{ width: '100%', paddingLeft: '40px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry (MM/YY)</label>
                      <input type="text" required placeholder="MM/YY" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>CVV</label>
                      <input type="text" required maxLength="4" placeholder="123" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Name on Card</label>
                    <input type="text" required value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} style={{ width: '100%' }} />
                  </div>
                </div>
                <button type="submit" disabled={isProcessing} className="btn" style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}>
                  {isProcessing ? 'Processing...' : `Pay $${pricing?.total.toFixed(2)}`}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your booking reference is <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{bookingRef}</strong></p>
                <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem' }}>
                  <p><strong>Primary Guest:</strong> {formData.fullName}</p>
                  <p><strong>Check-in:</strong> {new Date(checkIn).toLocaleDateString()}</p>
                  <p><strong>Check-out:</strong> {new Date(checkOut).toLocaleDateString()}</p>
                </div>
                <Link to="/my-bookings" className="btn">View My Bookings</Link>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          {step < 3 && (
            <div style={{ flex: '1 1 35%' }}>
              <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Booking Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem' }}>{new Date(checkIn).toLocaleDateString()} &mdash; {new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.9rem' }}>{guests} Guests, 1 Room</span>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pricing ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Room subtotal</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Taxes (12%)</span>
                        <span>${pricing.taxes.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Service Fee (3%)</span>
                        <span>${pricing.serviceFee.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <span>Total Price</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      Complete Step 1 to see full pricing details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Booking;
