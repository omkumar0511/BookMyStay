/**
 * Sample hotel listings for BookMyStay UI demos.
 * Edit arrays below to add cities, names, images, or amenities — the list regenerates automatically.
 */

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  { city: 'Goa', state: 'Goa', country: 'India' },
  { city: 'Surat', state: 'Gujarat', country: 'India' },
  { city: 'Kochi', state: 'Kerala', country: 'India' },
  { city: 'Udaipur', state: 'Rajasthan', country: 'India' },
  { city: 'Manali', state: 'Himachal Pradesh', country: 'India' },
  { city: 'New York', state: 'New York', country: 'USA' },
  { city: 'London', state: 'England', country: 'UK' },
  { city: 'Dubai', state: 'Dubai', country: 'UAE' },
  { city: 'Paris', state: 'Île-de-France', country: 'France' },
  { city: 'Singapore', state: 'Singapore', country: 'Singapore' },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan' },
];

const PROPERTY_TYPES = ['hotel', 'resort', 'hostel', 'villa', 'apartment', 'boutique'];

const NAME_PREFIXES = [
  'Grand', 'Royal', 'Urban', 'Skyline', 'Harbor', 'Garden', 'Pearl', 'Crystal',
  'Golden', 'Silver', 'Azure', 'Palm', 'Summit', 'Coastal', 'Heritage', 'Modern',
  'Serene', 'Luxe', 'Prime', 'Vista',
];

const NAME_SUFFIXES = [
  'Plaza', 'Inn', 'Suites', 'Stay', 'Residency', 'Lodge', 'Retreat', 'House',
  'Palace', 'Courtyard', 'Heights', 'Haven', 'Nest', 'Quarters', 'Manor',
];

const AMENITIES_POOL = [
  'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'AC',
  'Room Service', 'Laundry', 'Airport Shuttle', 'Pet Friendly', 'Beach Access',
  'Breakfast', 'Workspace', 'Kids Club', 'Concierge', 'EV Charging',
];

const IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c1c82b20?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40eb0d8173?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800&q=80',
];

const TOTAL_SAMPLE_HOTELS = 120;

const pick = (arr, i) => arr[i % arr.length];

const pickAmenities = (seed) => {
  const count = 3 + (seed % 5);
  const start = seed % AMENITIES_POOL.length;
  return Array.from({ length: count }, (_, j) =>
    AMENITIES_POOL[(start + j) % AMENITIES_POOL.length]
  );
};

const buildHotel = (index) => {
  const loc = pick(CITIES, index);
  const prefix = pick(NAME_PREFIXES, index);
  const suffix = pick(NAME_SUFFIXES, Math.floor(index / NAME_PREFIXES.length));
  const propertyType = pick(PROPERTY_TYPES, index);
  const name = `${prefix} ${suffix} ${loc.city}`;
  const imgA = pick(IMAGES, index);
  const imgB = pick(IMAGES, index + 3);
  const imgC = pick(IMAGES, index + 7);

  return {
    _id: `sample-${index + 1}`,
    name,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
    description: `A welcoming ${propertyType} in ${loc.city}, ${loc.country}. Ideal for leisure and business travelers looking for comfort and value.`,
    propertyType,
    address: {
      street: `${100 + (index % 80)} ${suffix} Road`,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      zip: String(100000 + index),
    },
    location: {
      lat: 10 + (index % 40) + (index % 10) / 10,
      lng: 70 + (index % 50) + (index % 7) / 10,
    },
    images: [imgA, imgB, imgC],
    amenities: pickAmenities(index),
    starRating: 3 + (index % 3),
    avgRating: Number((3.5 + (index % 15) / 10).toFixed(1)),
    reviewCount: 5 + ((index * 7) % 240),
    priceFrom: 45 + ((index * 17) % 420),
    featured: index % 11 === 0,
    status: 'approved',
    policies: {
      checkIn: '14:00',
      checkOut: '11:00',
      cancellation: index % 2 === 0 ? 'flexible' : 'moderate',
    },
  };
};

/** Full sample catalog (120 hotels) */
export const sampleHotels = Array.from({ length: TOTAL_SAMPLE_HOTELS }, (_, i) => buildHotel(i));

/** Featured subset for home carousels */
export const featuredSampleHotels = sampleHotels.filter((h) => h.featured);

/** Lookup by sample id */
export const getSampleHotelById = (id) => sampleHotels.find((h) => h._id === id);

/** Filter helpers for search fallbacks */
export const filterSampleHotels = ({ city, propertyType, minPrice, maxPrice, minRating } = {}) => {
  return sampleHotels.filter((h) => {
    if (city && !h.address.city.toLowerCase().includes(String(city).toLowerCase())) return false;
    if (propertyType && h.propertyType !== propertyType) return false;
    if (minPrice && h.priceFrom < Number(minPrice)) return false;
    if (maxPrice && h.priceFrom > Number(maxPrice)) return false;
    if (minRating && (h.starRating || 0) < Number(minRating)) return false;
    return true;
  });
};

export default sampleHotels;
