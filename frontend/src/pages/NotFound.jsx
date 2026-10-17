import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>Page not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          Sorry, we couldn't find the page you're looking for. It might have been removed or the link is incorrect.
        </p>
        <Link to="/" className="btn">Back to Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
