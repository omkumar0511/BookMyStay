/**
 * Travel-themed background images used across pages & cards.
 * Swap any URL here — Layout and cards pick themes automatically.
 */

export const TRAVEL_IMAGES = {
  beach:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000',
  mountains:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000',
  city:
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000',
  airplane:
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000',
  tropical:
    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=2000',
  desert:
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2000',
  lake:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000',
  hotel:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000',
  adventure:
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2000',
  nightCity:
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000',
  passport:
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000',
  villa:
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000',
};

/** Page-route → travel theme key */
export const PAGE_THEME_MAP = [
  { match: /^\/$/, theme: 'beach' },
  { match: /^\/search/, theme: 'city' },
  { match: /^\/hotel\//, theme: 'hotel' },
  { match: /^\/login/, theme: 'airplane' },
  { match: /^\/register/, theme: 'tropical' },
  { match: /^\/forgot-password/, theme: 'passport' },
  { match: /^\/profile/, theme: 'lake' },
  { match: /^\/my-bookings/, theme: 'adventure' },
  { match: /^\/book\//, theme: 'villa' },
  { match: /^\/admin/, theme: 'nightCity' },
  { match: /^\/manager/, theme: 'mountains' },
];

const CARD_THEME_CYCLE = [
  'beach',
  'mountains',
  'city',
  'tropical',
  'desert',
  'lake',
  'hotel',
  'adventure',
  'airplane',
  'villa',
];

export const getTravelThemeForPath = (pathname = '/') => {
  const found = PAGE_THEME_MAP.find((entry) => entry.match.test(pathname));
  const key = found?.theme || 'beach';
  return {
    key,
    image: TRAVEL_IMAGES[key] || TRAVEL_IMAGES.beach,
  };
};

/** Rotate travel images across cards for visual variety */
export const getCardTravelImage = (index = 0) => {
  const key = CARD_THEME_CYCLE[Math.abs(index) % CARD_THEME_CYCLE.length];
  return TRAVEL_IMAGES[key];
};

export default TRAVEL_IMAGES;
