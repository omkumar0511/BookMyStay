import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Hotels = () => {
	const [hotels, setHotels] = useState([]);
	const [status, setStatus] = useState('all');
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [savingHotelId, setSavingHotelId] = useState('');

	useEffect(() => {
		const fetchHotels = async () => {
			try {
				const response = await api.get('/hotels/admin');
				setHotels(response.data.data);
			} catch (requestError) {
				setError(requestError.response?.data?.message || 'Could not load hotels.');
			} finally {
				setLoading(false);
			}
		};
		fetchHotels();
	}, []);

	const query = search.trim().toLowerCase();
	const visibleHotels = hotels.filter(hotel =>
		(status === 'all' || hotel.status === status) &&
		`${hotel.name} ${hotel.address?.city} ${hotel.address?.country} ${hotel.owner?.name}`.toLowerCase().includes(query)
	);

	const updateHotelStatus = async (hotelId, nextStatus) => {
		setSavingHotelId(hotelId);
		setError('');
		try {
			const response = await api.patch(`/hotels/${hotelId}/status`, { status: nextStatus });
			setHotels(currentHotels => currentHotels.map(hotel => hotel._id === hotelId ? { ...hotel, ...response.data.data } : hotel));
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not update property status.');
		} finally {
			setSavingHotelId('');
		}
	};

	return (
		<section>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
				<div>
					<h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Hotels</h1>
					<p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>{visibleHotels.length} of {hotels.length} properties</p>
				</div>
				<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
					<input aria-label="Search hotels" placeholder="Search hotels or owners" value={search} onChange={event => setSearch(event.target.value)} style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
					<select aria-label="Filter by hotel status" value={status} onChange={event => setStatus(event.target.value)} style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
						<option value="all">All statuses</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
					</select>
				</div>
			</header>

			{error && <p role="alert" style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>}
			{loading ? <p role="status">Loading hotels...</p> : (
				<div className="card" style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', minWidth: '900px', textAlign: 'left', borderCollapse: 'collapse' }}>
						<thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
							<th style={{ padding: '1rem' }}>Property</th><th style={{ padding: '1rem' }}>Manager</th><th style={{ padding: '1rem' }}>Location</th><th style={{ padding: '1rem' }}>Type</th><th style={{ padding: '1rem' }}>From / night</th><th style={{ padding: '1rem' }}>Status</th><th style={{ padding: '1rem' }}>Manage</th>
						</tr></thead>
						<tbody>
							{visibleHotels.map(hotel => (
								<tr key={hotel._id} style={{ borderBottom: '1px solid var(--border)' }}>
									<td style={{ padding: '1rem', fontWeight: 600 }}>{hotel.name}</td>
									<td style={{ padding: '1rem' }}>{hotel.owner?.name || 'Unknown'}<br /><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{hotel.owner?.email}</span></td>
									<td style={{ padding: '1rem' }}>{hotel.address?.city}, {hotel.address?.country}</td>
									<td style={{ padding: '1rem', textTransform: 'capitalize' }}>{hotel.propertyType}</td>
									<td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>${Number(hotel.priceFrom || 0).toLocaleString()}</td>
									<td style={{ padding: '1rem', textTransform: 'capitalize' }}>{hotel.status}</td>
									<td style={{ padding: '0.75rem 1rem' }}>
										<select aria-label={`Change ${hotel.name} status`} value={hotel.status} disabled={savingHotelId === hotel._id} onChange={event => updateHotelStatus(hotel._id, event.target.value)} style={{ padding: '0.45rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
											<option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
										</select>
									</td>
								</tr>
							))}
							{!visibleHotels.length && <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hotels match these filters.</td></tr>}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default Hotels;
