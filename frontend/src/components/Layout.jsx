import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PageBackground from './PageBackground';
import { getTravelThemeForPath } from '../data/travelThemes';

const Layout = () => {
  const { pathname } = useLocation();
  const theme = getTravelThemeForPath(pathname);
  const isAuthSplit = pathname === '/login' || pathname === '/register';
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/manager');

  return (
    <div
      className="app-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        ['--page-travel-image']: `url("${theme.image}")`,
        ['--card-travel-image']: `url("${theme.image}")`,
      }}
      data-travel-theme={theme.key}
    >
      <Navbar />
      <main style={{ flex: '1', width: '100%', position: 'relative' }}>
        {isAuthSplit || isDashboard ? (
          <Outlet />
        ) : (
          <PageBackground pathname={pathname} opacity={0.28} blur={14}>
            <Outlet />
          </PageBackground>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
