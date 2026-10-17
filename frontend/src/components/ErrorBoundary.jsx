import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '2rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
            <AlertTriangle size={64} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We're sorry, but an unexpected error occurred. Please try refreshing the page or going back home.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} className="btn-outline">Refresh Page</button>
              <Link to="/" onClick={() => this.setState({ hasError: false })} className="btn">Go Home</Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
