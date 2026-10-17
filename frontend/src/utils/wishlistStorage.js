const STORAGE_KEY = 'bookmystay-sample-wishlist';

export const getSampleWishlistIds = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(ids) ? ids.filter(id => typeof id === 'string' && id.startsWith('sample-')) : [];
  } catch {
    return [];
  }
};

export const toggleSampleWishlistId = id => {
  const savedIds = getSampleWishlistIds();
  const nextIds = savedIds.includes(id)
    ? savedIds.filter(savedId => savedId !== id)
    : [...savedIds, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
  return nextIds;
};