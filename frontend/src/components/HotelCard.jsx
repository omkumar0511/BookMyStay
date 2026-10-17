import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getCardTravelImage } from '../data/travelThemes';
import PropertyImage from './PropertyImage';

const HotelCard = ({ hotel, isWishlisted: initWishlist, onWishlistToggle, themeIndex }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const { user, toggleWishlist } = useContext(AuthContext);
  const navigate = useNavigate();
  const hotelId = String(hotel._id);
  const isWishlisted = user
    ? (user.wishlist || []).some(entry => String(typeof entry === 'string' ? entry : entry?._id) === hotelId)
    : Boolean(initWishlist);

  const seed =
    themeIndex ??
    (typeof hotel?._id === 'string'
      ? hotel._id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      : 0);
  const cardTravelImage = getCardTravelImage(seed);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setWishlistSaving(true);
    setWishlistError('');
    try {
      const saved = await toggleWishlist(hotel);
      onWishlistToggle?.(hotel._id, saved);
    } catch (error) {
      setWishlistError(error.response?.data?.message || error.message || 'Could not update your wishlist.');
    } finally {
      setWishlistSaving(false);
    }
  };

  return (
    <Link
      to={`/hotel/${hotel._id}`}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ['--card-travel-image']: `url("${cardTravelImage}")`,
      }}
    >
      
      {/* Image Carousel Area */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '66.66%' /* 3:2 aspect ratio */ }}>
        <PropertyImage
          src={hotel.images?.[currentImg]}
          propertyType={hotel.propertyType}
          alt={hotel.name}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <span style={{ background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {hotel.propertyType}
          </span>
        </div>

        {/* Wishlist Heart */}
        <button 
          onClick={handleWishlist}
          disabled={wishlistSaving}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          title={wishlistError || (isWishlisted ? 'Remove from wishlist' : 'Add to wishlist')}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Heart size={20} fill={isWishlisted ? 'var(--danger)' : 'transparent'} color={isWishlisted ? 'var(--danger)' : '#000'} />
        </button>
        {wishlistError && <span role="alert" style={{ position: 'absolute', top: '52px', right: '12px', maxWidth: '220px', padding: '0.4rem 0.6rem', borderRadius: '4px', color: '#991b1b', background: '#fff' }}>{wishlistError}</span>}

        {/* Carousel Dots */}
        {hotel.images && hotel.images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {hotel.images.map((_, idx) => (
              <div 
                key={idx}
                onMouseEnter={(e) => { e.preventDefault(); setCurrentImg(idx); }}
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: currentImg === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3, color: 'var(--text-main)', flex: 1, paddingRight: '0.5rem' }}>
            {hotel.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Star size={16} fill="var(--accent)" />
            {hotel.avgRating ? hotel.avgRating.toFixed(1) : 'New'}
          </div>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
          <MapPin size={14} /> {hotel.address?.city}, {hotel.address?.country}
        </p>

        {/* Reviews snippet */}
        {hotel.reviewCount > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {hotel.reviewCount} {hotel.reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        )}
        
        {/* Amenities (Top 3) */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
            {hotel.amenities.slice(0, 3).map((amenity, i) => (
              <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} color="var(--secondary)" /> {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{hotel.amenities.length - 3} more</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting from</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              ${hotel.priceFrom} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ night</span>
            </div>
          </div>
          <span className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>View deal</span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
