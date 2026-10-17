import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgotpassword', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell" style={{ display: 'flex', minHeight: '70vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          ['--card-travel-image']: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200")',
        }}
      >
        
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', display: 'inline-block' }}>BookMyStay</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Forgot Password</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', textAlign: 'left' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success ? (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={32} />
            <p>Password reset email sent! Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} placeholder="you@example.com" />
            </div>

            <button type="submit" disabled={loading} className="btn" style={{ padding: '0.8rem', fontSize: '1rem' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Return to sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
