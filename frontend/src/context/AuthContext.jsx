import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { getSampleWishlistIds, toggleSampleWishlistId } from '../utils/wishlistStorage';

const mergeSampleWishlist = wishlist => {
  const entries = wishlist || [];
  const existingIds = new Set(entries.map(entry => String(typeof entry === 'string' ? entry : entry?._id)));
  const localSampleIds = getSampleWishlistIds().filter(id => !existingIds.has(id));
  return [...entries, ...localSampleIds];
};

const attachWishlist = user => user ? { ...user, wishlist: mergeSampleWishlist(user.wishlist) } : user;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(attachWishlist(res.data.data));
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(attachWishlist(res.data.data));
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    setUser(attachWishlist(res.data.data));
    return res.data;
  };

  const toggleWishlist = async hotel => {
    if (!user) throw new Error('Please sign in to manage your wishlist.');

    const hotelId = String(hotel._id);
    const isSaved = (user.wishlist || []).some(entry =>
      String(typeof entry === 'string' ? entry : entry?._id) === hotelId
    );

    let nextWishlist;
    if (hotelId.startsWith('sample-')) {
      const savedSampleIds = toggleSampleWishlistId(hotelId);
      nextWishlist = (user.wishlist || []).filter(entry =>
        String(typeof entry === 'string' ? entry : entry?._id) !== hotelId
      );
      nextWishlist.push(...savedSampleIds.filter(id =>
        !nextWishlist.some(entry => String(typeof entry === 'string' ? entry : entry?._id) === id)
      ));
    } else {
      const response = isSaved
        ? await api.delete(`/users/wishlist/${hotelId}`)
        : await api.post(`/users/wishlist/${hotelId}`);
      nextWishlist = response.data.data;
    }

    setUser(currentUser => currentUser ? {
      ...currentUser,
      wishlist: mergeSampleWishlist(nextWishlist),
    } : currentUser);
    return !isSaved;
  };

  const logout = async () => {
    await api.get('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, toggleWishlist, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
