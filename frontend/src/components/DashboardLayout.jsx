import { useState, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { X, LayoutDashboard, Building, Users, CreditCard, Menu as MenuIcon } from 'lucide-react';
import { getTravelThemeForPath } from '../data/travelThemes';

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = getTravelThemeForPath(pathname);

  const isAdmin = user?.role === 'admin';
  
  const navLinks = isAdmin ? [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Hotels', path: '/admin/hotels', icon: Building },
    { name: 'Bookings', path: '/admin/bookings', icon: CreditCard },
  ] : [
    { name: 'Overview', path: '/manager', icon: LayoutDashboard, exact: true },
    { name: 'My Hotels', path: '/manager/hotels', icon: Building },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          className="mobile-overlay"
        />
      )}

      <aside 
        style={{
          width: '260px',
          background: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: '70px',
          bottom: 0,
          left: sidebarOpen ? 0 : '-260px',
          transition: 'left 0.3s ease',
          zIndex: 50
        }}
        className="dashboard-sidebar"
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'capitalize' }}>
            {user?.role} Panel
          </h2>
          <button className="mobile-only" onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'active-dash-link' : 'dash-link'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                borderRadius: '8px', color: isActive ? 'var(--primary)' : 'var(--text-main)',
                background: isActive ? 'var(--bg-color)' : 'transparent',
                fontWeight: isActive ? 600 : 500
              })}
            >
              <link.icon size={20} /> {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      <style>{`
        .dashboard-sidebar { left: -260px; }
        .mobile-only { display: block; }
        .dash-link:hover { background: var(--bg-color) !important; }
        .main-dash-content { margin-left: 0; width: 100%; position: relative; overflow: hidden; }
        .dash-bg-layer {
          position: absolute;
          inset: -24px;
          background-image: url('${theme.image}');
          background-size: cover;
          background-position: center;
          filter: blur(12px);
          opacity: 0.3;
          z-index: 0;
          pointer-events: none;
        }
        .dash-bg-veil {
          position: absolute;
          inset: 0;
          background: color-mix(in srgb, var(--bg-color) 75%, transparent);
          z-index: 0;
          pointer-events: none;
        }
        .dash-content-inner { position: relative; z-index: 1; }
        
        @media (min-width: 1024px) {
          .dashboard-sidebar { left: 0 !important; position: sticky !important; height: calc(100vh - 70px); }
          .mobile-overlay { display: none !important; }
          .mobile-only { display: none !important; }
          .main-dash-content { margin-left: 0; flex: 1; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>

      <main
        className="main-dash-content"
        style={{
          padding: '2rem 1.5rem',
          background: 'transparent',
          ['--card-travel-image']: `url("${theme.image}")`,
        }}
      >
        <div className="dash-bg-layer" aria-hidden="true" />
        <div className="dash-bg-veil" aria-hidden="true" />
        <div className="dash-content-inner">
          <button 
            className="mobile-menu-btn btn-outline" 
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}
          >
            <MenuIcon size={20} /> Menu
          </button>
          
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
