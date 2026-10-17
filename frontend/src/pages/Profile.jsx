import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { User, Lock, Heart, Settings, Trash2 } from 'lucide-react';
import HotelCard from '../components/HotelCard';
import { getSampleHotelById } from '../data';
import { getSampleWishlistIds } from '../utils/wishlistStorage';

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const { user, setUser } = useContext(AuthContext);
  
  // Personal Info State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [file, setFile] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const res = await api.get('/users/wishlist');
      const savedHotels = res.data.data || [];
      const sampleIds = getSampleWishlistIds();
      const sampleHotels = sampleIds.map(getSampleHotelById).filter(Boolean);
      setWishlist([...savedHotels, ...sampleHotels]);
      setUser(currentUser => currentUser ? {
        ...currentUser,
        wishlist: [...savedHotels, ...sampleIds.filter(id => !savedHotels.some(hotel => hotel._id === id))],
      } : currentUser);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      let avatarUrl = avatar;
      if (file) {
        const formData = new FormData();
        formData.append('images', file);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        avatarUrl = uploadRes.data.data[0];
      }

      const res = await api.put('/users/me', { name, phone, avatar: avatarUrl });
      setUser(res.data.data);
      setAvatar(res.data.data.avatar);
      alert('Profile updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/updatepassword', { currentPassword, newPassword });
      alert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating password');
    }
  };

  const handleWishlistToggle = (hotelId, saved) => {
    if (!saved) {
      setWishlist(currentWishlist => currentWishlist.filter(hotel => hotel._id !== hotelId));
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem', '@media(min-width:768px)': { flexDirection: 'row' } }}>
      
      <style>{`.profile-layout { display: flex; flex-direction: column; gap: 3rem; } @media(min-width: 768px) { .profile-layout { flex-direction: row; } }`}</style>
      <div className="profile-layout">
        
        {/* Sidebar */}
        <div style={{ flex: '0 0 250px' }}>
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200")' }}>
            <button 
              onClick={() => setActiveTab('personal')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'personal' ? 'var(--bg-color)' : 'transparent', color: activeTab === 'personal' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'personal' ? 600 : 400, textAlign: 'left' }}
            >
              <User size={18} /> Personal Info
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'wishlist' ? 'var(--bg-color)' : 'transparent', color: activeTab === 'wishlist' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'wishlist' ? 600 : 400, textAlign: 'left' }}
            >
              <Heart size={18} /> Wishlist
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'security' ? 'var(--bg-color)' : 'transparent', color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'security' ? 600 : 400, textAlign: 'left' }}
            >
              <Lock size={18} /> Security
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: activeTab === 'account' ? 'var(--bg-color)' : 'transparent', color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'account' ? 600 : 400, textAlign: 'left' }}
            >
              <Settings size={18} /> Account Details
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'personal' && (
            <div className="card" style={{ padding: '2rem', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200")' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Personal Information</h2>
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <img src={file ? URL.createObjectURL(file) : avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150'} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <input type="file" id="avatarUpload" style={{ display: 'none' }} accept="image/*" onChange={e => setFile(e.target.files[0])} />
                    <label htmlFor="avatarUpload" className="btn-outline" style={{ padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>Change Avatar</label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', maxWidth: '400px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                    <input type="email" value={user?.email} disabled style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-color)', color: 'var(--text-muted)' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Email cannot be changed.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', maxWidth: '400px' }} />
                  </div>
                </div>
                <button type="submit" className="btn" style={{ marginTop: '2rem' }}>Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card" style={{ padding: '2rem', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200")' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Change Password</h2>
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Current Password</label>
                  <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%' }} />
                </div>
                <button type="submit" className="btn" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>Update Password</button>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="card" style={{ padding: '2rem', ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200")' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Account Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p><strong>Account Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
                <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <h3 style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '0.5rem' }}>Danger Zone</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="btn" style={{ background: 'var(--danger)' }}>Delete Account</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Your Wishlist</h2>
              {loadingWishlist ? (
                <p>Loading your saved properties...</p>
              ) : wishlist.length === 0 ? (
                <div style={{ background: 'var(--bg-surface)', padding: '3rem 2rem', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <Heart size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nothing saved yet</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Start exploring and click the heart icon to save your favorite stays.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {wishlist.map(hotel => (
                    <div key={hotel._id} style={{ position: 'relative' }}>
                      <HotelCard hotel={hotel} isWishlisted={true} onWishlistToggle={handleWishlistToggle} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
