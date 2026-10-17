import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Eye, Plus, BedDouble, MapPin, Pencil } from 'lucide-react';
import api from '../../api/axios';
import PropertyImage from '../../components/PropertyImage';

const statusColors = {
	approved: { color: '#166534', background: '#dcfce7' },
	pending: { color: '#92400e', background: '#fef3c7' },
	rejected: { color: '#991b1b', background: '#fee2e2' },
};

const MyHotels = () => {
	const [hotels, setHotels] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchHotels = async () => {
			try {
				const response = await api.get('/hotels/mine');
				setHotels(response.data.data);
			} catch (requestError) {
				setError(requestError.response?.data?.message || 'Could not load your properties.');
			} finally {
				setLoading(false);
			}
		};

		fetchHotels();
	}, []);

	return (
		<section>
			<header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
				<div>
					<h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Hotels</h1>
					<p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
						{hotels.length} {hotels.length === 1 ? 'property' : 'properties'}
					</p>
				</div>
				<Link to="/manager/hotel/new" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: '8px' }}>
					<Plus size={18} /> Add property
				</Link>
			</header>

			{loading ? (
				<p role="status">Loading your properties...</p>
			) : error ? (
				<p role="alert" style={{ color: '#991b1b' }}>{error}</p>
			) : hotels.length === 0 ? (
				<div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
					<Building size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
					<h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No properties yet</h2>
					<p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>Add your first property to start managing rooms and bookings.</p>
					<Link to="/manager/hotel/new" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: '8px' }}>
						<Plus size={18} /> Add property
					</Link>
				</div>
			) : (
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
					{hotels.map(hotel => {
						const statusStyle = statusColors[hotel.status] || statusColors.pending;
						return (
							<article className="card" key={hotel._id} style={{ overflow: 'hidden' }}>
								<PropertyImage src={hotel.images?.[0]} propertyType={hotel.propertyType} alt={hotel.name} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }} />
								<div style={{ padding: '1.25rem' }}>
									<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
										<div>
											<h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{hotel.name}</h2>
											<p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
												<MapPin size={15} /> {hotel.address?.city}, {hotel.address?.country}
											</p>
										</div>
										<span style={{ color: statusStyle.color, background: statusStyle.background, borderRadius: '4px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
											{hotel.status}
										</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', margin: '1.1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
										<span style={{ textTransform: 'capitalize' }}>{hotel.propertyType}</span>
										<span>From ${Number(hotel.priceFrom || 0).toLocaleString()} / night</span>
									</div>
									<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
										<Link to={`/manager/hotel/${hotel._id}/edit`} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
											<Pencil size={17} /> Edit property
										</Link>
										<Link to={`/manager/hotel/${hotel._id}/rooms`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
											<BedDouble size={17} /> Manage rooms
										</Link>
										<Link to={`/hotel/${hotel._id}`} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
											<Eye size={17} /> View listing
										</Link>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
};

export default MyHotels;
