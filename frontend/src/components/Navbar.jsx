import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Menu, X, Heart, Moon, Sun, User as UserIcon, LogOut, Briefcase, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px'
      }}>
        {/* Left: Logo & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>BookMyStay</span>
          </Link>
          <nav className="desktop-nav" style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/search" style={{ fontWeight: 500 }}>Explore</Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={toggleTheme} style={{ padding: '0.5rem', color: 'var(--text-main)', display: 'flex' }} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/profile?tab=wishlist" style={{ color: 'var(--text-main)', display: 'none', alignItems: 'center', padding: '0.5rem' }} className="desktop-nav" aria-label="Wishlist">
            <Heart size={20} />
          </Link>

          {/* Desktop User Menu */}
          <div className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem' }}
                >
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100'} 
                    alt="avatar" 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                  />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '120%', right: 0,
                    width: '220px', background: 'var(--bg-surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)', padding: '0.5rem', zIndex: 100
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>

                    <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '6px' }} className="dropdown-item">
                      <Briefcase size={16} /> My Bookings
                    </Link>
                    <Link to="/profile?tab=wishlist" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '6px' }} className="dropdown-item">
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '6px' }} className="dropdown-item">
                      <UserIcon size={16} /> Profile
                    </Link>

                    {(user.role === 'manager' || user.role === 'admin') && (
                      <Link to={`/${user.role}`} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '6px' }} className="dropdown-item">
                        <Settings size={16} /> Dashboard
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', width: '100%', color: 'var(--danger)', borderRadius: '6px', textAlign: 'left' }} className="dropdown-item">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Log in</Link>
                <Link to="/register" className="btn" style={{ padding: '0.5rem 1rem' }}>Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-only" style={{ padding: '0.5rem', color: 'var(--text-main)', display: 'flex' }} aria-label="Menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* CSS specific to Navbar responsive behaviors */}
      <style>{`
        .desktop-nav { display: none !important; }
        .mobile-only { display: flex !important; }
        .dropdown-item:hover { background-color: var(--bg-color); }
        
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '70px', left: 0, width: '100%',
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem',
          boxShadow: 'var(--shadow-md)', zIndex: 40
        }}>
          <Link to="/search" onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Explore</Link>
          
          {user ? (
            <>
              <div style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100'} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontWeight: 600 }}>{user.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
              </div>
              <Link to="/my-bookings" onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Briefcase size={18} /> My Bookings</Link>
              <Link to="/profile?tab=wishlist" onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Heart size={18} /> Wishlist</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><UserIcon size={18} /> Profile</Link>
              {(user.role === 'manager' || user.role === 'admin') && (
                <Link to={`/${user.role}`} onClick={() => setMobileOpen(false)} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Settings size={18} /> Dashboard</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)', textAlign: 'left', width: '100%' }}><LogOut size={18} /> Logout</button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline" style={{ justifyContent: 'center' }}>Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn" style={{ justifyContent: 'center' }}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
