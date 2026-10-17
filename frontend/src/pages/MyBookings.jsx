import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, MapPin, CreditCard, XCircle, Star, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyImage from '../components/PropertyImage';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'

  // Modals state
  const [editModal, setEditModal] = useState({ open: false, booking: null });
  const [editData, setEditData] = useState({ checkIn: '', checkOut: '', adults: 1 });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, refundAmount: 0 });
  const [reviewModal, setReviewModal] = useState({ open: false, bookingId: null, hotelId: null });
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEditClick = (booking) => {
    setEditData({
      checkIn: new Date(booking.checkIn).toISOString().slice(0, 10),
      checkOut: new Date(booking.checkOut).toISOString().slice(0, 10),
      adults: booking.guests?.adults || 1,
    });
    setEditModal({ open: true, booking });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      await api.put(`/bookings/${editModal.booking._id}`, {
        checkIn: editData.checkIn,
        checkOut: editData.checkOut,
        guests: {
          adults: Number(editData.adults),
          children: Number(editModal.booking.guests?.children || 0),
        },
      });
      await fetchBookings();
      setEditModal({ open: false, booking: null });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update booking');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelClick = async (booking) => {
    // In a real app we might simulate refund calculation locally or hit an endpoint preview. 
    // The backend PATCH /cancel returns the refundAmount. 
    // We'll just ask for confirmation and show the policy.
    const policy = booking.hotel?.policies?.cancellation || 'moderate';
    let message = "Are you sure you want to cancel?";
    if (policy === 'strict') message += " This hotel has a STRICT policy. No refund will be issued.";
    else if (policy === 'moderate') message += " This hotel has a MODERATE policy. You may receive a 50% refund depending on time.";
    else message += " This hotel has a FREE cancellation policy. You will receive a full refund if within time limits.";

    if (window.confirm(message)) {
      try {
        await api.patch(`/bookings/${booking._id}/cancel`);
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/hotels/${reviewModal.hotelId}/reviews`, {
        booking: reviewModal.bookingId,
        ...reviewData
      });
      alert('Review submitted successfully!');
      setReviewModal({ open: false, bookingId: null, hotelId: null });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') return ['pending', 'confirmed'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Loading bookings...</div>;

  return (
    <div className="container page-shell" style={{ padding: '3rem 1.5rem 5rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>My Bookings</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        {['upcoming', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 0', textTransform: 'capitalize', fontWeight: 600,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=1200")' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>No {activeTab} bookings found.</h2>
          <Link to="/search" className="btn">Explore hotels</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredBookings.map(booking => (
            <div key={booking._id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', '@media(minWidth:768px)': { flexDirection: 'row' } }}>
              <style>{`.booking-card-row { display: flex; flex-direction: column; } @media(min-width: 768px) { .booking-card-row { flex-direction: row; } }`}</style>
              <div className="booking-card-row" style={{ width: '100%' }}>
                
                {/* Image */}
                <div style={{ width: '100%', height: '200px', flex: '0 0 280px' }}>
                  <PropertyImage src={booking.hotel?.images?.[0]} propertyType={booking.hotel?.propertyType} alt={booking.hotel?.name || 'Booked property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <Link to={`/hotel/${booking.hotel._id}`}>{booking.hotel.name}</Link>
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={16} /> {booking.hotel.address?.city}, {booking.hotel.address?.country}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                      background: booking.status === 'confirmed' || booking.status === 'completed' ? '#dcfce7' : booking.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                      color: booking.status === 'confirmed' || booking.status === 'completed' ? '#166534' : booking.status === 'cancelled' ? '#991b1b' : '#92400e'
                    }}>
                      {booking.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check-in</p>
                      <p style={{ fontWeight: 500 }}>{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check-out</p>
                      <p style={{ fontWeight: 500 }}>{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</p>
                      <p style={{ fontWeight: 600 }}>${booking.totalPrice?.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    
                    {booking.status === 'pending' && booking.paymentStatus === 'unpaid' && (
                      <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Pay Now</button>
                    )}

                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <>
                        <button onClick={() => handleEditClick(booking)} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px' }}>Edit</button>
                        <button onClick={() => handleCancelClick(booking)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--danger)', background: '#fee2e2', borderRadius: '8px' }}>
                          <XCircle size={16} /> Cancel
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && (
                      <button 
                        onClick={() => setReviewModal({ open: true, bookingId: booking._id, hotelId: booking.hotel._id })}
                        className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px' }}
                      >
                        <Star size={16} style={{ marginRight: '0.5rem' }} /> Write a Review
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <form onSubmit={handleEditSubmit} className="card" style={{ background: 'var(--bg-surface)', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Edit Booking</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label htmlFor="edit-check-in" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Check-in</label>
                <input id="edit-check-in" type="date" required min={new Date().toISOString().slice(0, 10)} value={editData.checkIn} onChange={e => setEditData({ ...editData, checkIn: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label htmlFor="edit-check-out" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Check-out</label>
                <input id="edit-check-out" type="date" required min={editData.checkIn || new Date().toISOString().slice(0, 10)} value={editData.checkOut} onChange={e => setEditData({ ...editData, checkOut: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label htmlFor="edit-adults" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Adults</label>
                <input id="edit-adults" type="number" required min="1" value={editData.adults} onChange={e => setEditData({ ...editData, adults: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditModal({ open: false, booking: null })} style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Close</button>
              <button type="submit" className="btn" disabled={isSavingEdit}>{isSavingEdit ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <form onSubmit={handleReviewSubmit} className="card" style={{ background: 'var(--bg-surface)', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Write a Review</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Rating</label>
              <select value={reviewData.rating} onChange={e => setReviewData({...reviewData, rating: e.target.value})} style={{ width: '100%' }}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
              <input type="text" required value={reviewData.title} onChange={e => setReviewData({...reviewData, title: e.target.value})} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Comment</label>
              <textarea rows="4" required value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setReviewModal({ open: false })} style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Cancel</button>
              <button type="submit" className="btn">Submit Review</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default MyBookings;
