import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { TRAVEL_IMAGES } from '../data/travelThemes';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', position: 'relative' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `url("${TRAVEL_IMAGES.tropical}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(14px)',
          opacity: 0.22,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'color-mix(in srgb, var(--bg-color) 80%, transparent)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div style={{ 
        flex: 1, 
        backgroundImage: `url("${TRAVEL_IMAGES.tropical}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'none',
        position: 'relative',
        zIndex: 1,
      }} className="desktop-hero">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.65), rgba(15,23,42,0.2))' }} />
        <div style={{ position: 'absolute', bottom: '3rem', left: '2rem', right: '2rem', color: '#fff' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your next escape</h2>
          <p style={{ opacity: 0.9 }}>Create an account and start exploring stays around the world.</p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-hero { display: block !important; }
        }
      `}</style>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '2rem',
            ['--card-travel-image']: `url("${TRAVEL_IMAGES.beach}")`,
          }}
        >
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>BookMyStay</Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Create an account</h1>
            <p style={{ color: 'var(--text-muted)' }}>Start your journey with us today.</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} placeholder="John Doe" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} placeholder="you@example.com" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', paddingRight: '40px' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Password must be at least 6 characters.</p>
              )}
            </div>

            <button type="submit" disabled={loading || (password.length > 0 && password.length < 6)} className="btn" style={{ padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
