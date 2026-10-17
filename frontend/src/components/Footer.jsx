import { Link } from 'react-router-dom';
import { FaFacebook as Facebook, FaTwitter as Twitter, FaInstagram as Instagram, FaYoutube as Youtube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', paddingTop: '4rem', paddingBottom: '2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Brand Blurb */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              BookMyStay
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Your ultimate marketplace for discovering and booking the world's best hotels, resorts, and vacation rentals.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)' }}><Facebook size={20} /></a>
              <a href="#" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
              <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={20} /></a>
              <a href="#" style={{ color: 'var(--text-muted)' }}><Youtube size={20} /></a>
            </div>
          </div>

          {/* Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Company</h4>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>About Us</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Careers</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Press</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Blog</Link>
          </div>

          {/* Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Support</h4>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Help Center</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Safety Information</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Cancellation Options</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Contact Us</Link>
          </div>

          {/* Explore */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Explore</h4>
            <Link to="/search" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>All Properties</Link>
            <Link to="/search?propertyType=resort" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Resorts</Link>
            <Link to="/search?propertyType=villa" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Villas</Link>
            <Link to="/search?propertyType=hostel" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Hostels</Link>
          </div>

        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} BookMyStay, Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Privacy</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terms</Link>
            <Link to="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
