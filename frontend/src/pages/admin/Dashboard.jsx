import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users as UsersIcon, Building, CreditCard, DollarSign } from 'lucide-react';
import { getCardTravelImage } from '../../data/travelThemes';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/admin');
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
    { label: 'Total Users', value: stats.totals?.users ?? 0, icon: UsersIcon, bg: '#e0e7ff', color: 'var(--primary)', theme: 0 },
    { label: 'Total Hotels', value: stats.totals?.hotels ?? 0, icon: Building, bg: '#fef3c7', color: '#92400e', theme: 1 },
    { label: 'Total Bookings', value: stats.totals?.bookings ?? 0, icon: CreditCard, bg: '#dcfce7', color: '#166534', theme: 2 },
    { label: 'Total Revenue', value: `$${stats.totals?.revenue?.toLocaleString() ?? 0}`, icon: DollarSign, bg: '#fce7f3', color: '#9d174d', theme: 3 },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Admin Overview</h1>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', ['--card-travel-image']: `url("${getCardTravelImage(4)}")` }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top Cities</h2>
          {stats.topCities?.map(city => (
            <div key={city._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span>{city._id}</span>
              <span style={{ fontWeight: 600 }}>{city.count} Hotels</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '1.5rem', ['--card-travel-image']: `url("${getCardTravelImage(5)}")` }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Booking Status Breakdown</h2>
          {stats.statusBreakdown?.map(status => (
            <div key={status._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ textTransform: 'capitalize' }}>{status._id}</span>
              <span style={{ fontWeight: 600 }}>{status.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
