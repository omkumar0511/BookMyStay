import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

const FALLBACK_IMAGES = {
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  resort: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  villa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  hostel: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  boutique: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
};

const PropertyImage = ({ src, propertyType = 'hotel', alt = '', style = {}, ...imageProps }) => {
  const fallback = FALLBACK_IMAGES[propertyType] || FALLBACK_IMAGES.hotel;
  const [imageSource, setImageSource] = useState(src || fallback);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setImageSource(src || fallback);
    setFallbackFailed(false);
  }, [src, fallback]);

  const handleError = () => {
    if (imageSource !== fallback) {
      setImageSource(fallback);
    } else {
      setFallbackFailed(true);
    }
  };

  if (fallbackFailed) {
    return (
      <div
        role="img"
        aria-label={alt || `${propertyType} image unavailable`}
        style={{ display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #dce9e8, #f1e9df)', color: '#52646a', ...style }}
      >
        <Building2 size={30} aria-hidden="true" />
      </div>
    );
  }

  return <img {...imageProps} src={imageSource} alt={alt} loading="lazy" onError={handleError} style={style} />;
};

export default PropertyImage;