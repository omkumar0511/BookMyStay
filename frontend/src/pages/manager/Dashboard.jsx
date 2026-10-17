import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { DollarSign, Home, CheckCircle, TrendingUp } from 'lucide-react';
import { getCardTravelImage } from '../../data/travelThemes';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/manager');
        setStats(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totals?.revenue?.toLocaleString() ?? 0}`, icon: DollarSign, bg: '#e0e7ff', color: 'var(--primary)', theme: 0 },
    { label: 'Total Bookings', value: stats.totals?.bookings ?? 0, icon: CheckCircle, bg: '#dcfce7', color: '#166534', theme: 1 },
    { label: 'Properties', value: stats.totals?.hotels ?? 0, icon: Home, bg: '#fef3c7', color: '#92400e', theme: 2 },
    {
      label: 'Avg Occupancy',
      value: `${stats.totals?.occupancyRate ?? 0}%`,
      icon: TrendingUp,
      bg: '#fce7f3',
      color: '#9d174d',
      theme: 3
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {statCards.map((item) => (
          <div
            key={item.label}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              ['--card-travel-image']: `url("${getCardTravelImage(item.theme)}")`,
            }}
          >
            <div style={{ padding: '1rem', background: item.bg, borderRadius: '50%', color: item.color }}>
              <item.icon size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '1.5rem', ['--card-travel-image']: `url("${getCardTravelImage(6)}")` }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Bookings</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Ref</th>
                <th style={{ padding: '1rem' }}>Hotel</th>
                <th style={{ padding: '1rem' }}>Guest</th>
                <th style={{ padding: '1rem' }}>Amount</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings?.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{b.bookingRef}</td>
                  <td style={{ padding: '1rem' }}>{b.hotel?.name}</td>
                  <td style={{ padding: '1rem' }}>{b.guestDetails?.fullName}</td>
                  <td style={{ padding: '1rem' }}>${b.totalPrice}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', background: b.status === 'confirmed' ? '#dcfce7' : '#fef3c7' }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
