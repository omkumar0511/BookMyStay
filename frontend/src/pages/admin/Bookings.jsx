import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Bookings = () => {
	const [bookings, setBookings] = useState([]);
	const [status, setStatus] = useState('all');
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [savingBookingId, setSavingBookingId] = useState('');

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const response = await api.get('/bookings');
				setBookings(response.data.data);
			} catch (requestError) {
				setError(requestError.response?.data?.message || 'Could not load bookings.');
			} finally {
				setLoading(false);
			}
		};
		fetchBookings();
	}, []);

	const query = search.trim().toLowerCase();
	const visibleBookings = bookings.filter(booking =>
		(status === 'all' || booking.status === status) &&
		`${booking.bookingRef} ${booking.hotel?.name} ${booking.user?.name} ${booking.user?.email}`.toLowerCase().includes(query)
	);

	const updateBookingStatus = async (bookingId, nextStatus) => {
		setSavingBookingId(bookingId);
		setError('');
		try {
			const response = await api.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
			setBookings(currentBookings => currentBookings.map(booking => booking._id === bookingId ? { ...booking, ...response.data.data } : booking));
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not update booking status.');
		} finally {
			setSavingBookingId('');
		}
	};

	return (
		<section>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
				<div>
					<h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Bookings</h1>
					<p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>{visibleBookings.length} of {bookings.length} reservations</p>
				</div>
				<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
					<input aria-label="Search bookings" placeholder="Search reference, guest, hotel" value={search} onChange={event => setSearch(event.target.value)} style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
					<select aria-label="Filter by booking status" value={status} onChange={event => setStatus(event.target.value)} style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
						<option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
					</select>
				</div>
			</header>

			{error && <p role="alert" style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>}
			{loading ? <p role="status">Loading bookings...</p> : (
				<div className="card" style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', minWidth: '950px', textAlign: 'left', borderCollapse: 'collapse' }}>
						<thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
							<th style={{ padding: '1rem' }}>Reference</th><th style={{ padding: '1rem' }}>Guest</th><th style={{ padding: '1rem' }}>Hotel</th><th style={{ padding: '1rem' }}>Stay</th><th style={{ padding: '1rem' }}>Amount</th><th style={{ padding: '1rem' }}>Payment</th><th style={{ padding: '1rem' }}>Status</th><th style={{ padding: '1rem' }}>Manage</th>
						</tr></thead>
						<tbody>
							{visibleBookings.map(booking => (
								<tr key={booking._id} style={{ borderBottom: '1px solid var(--border)' }}>
									<td style={{ padding: '1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{booking.bookingRef}</td>
									<td style={{ padding: '1rem' }}>{booking.user?.name || booking.guestDetails?.fullName}<br /><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{booking.user?.email || booking.guestDetails?.email}</span></td>
									<td style={{ padding: '1rem' }}>{booking.hotel?.name || 'Hotel unavailable'}</td>
									<td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()}</td>
									<td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>${Number(booking.totalPrice || 0).toLocaleString()}</td>
									<td style={{ padding: '1rem', textTransform: 'capitalize' }}>{booking.paymentStatus}</td>
									<td style={{ padding: '1rem', textTransform: 'capitalize' }}>{booking.status}</td>
									<td style={{ padding: '0.75rem 1rem' }}>
										<select aria-label={`Change ${booking.bookingRef} status`} value={booking.status} disabled={savingBookingId === booking._id} onChange={event => updateBookingStatus(booking._id, event.target.value)} style={{ padding: '0.45rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
											<option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
										</select>
									</td>
								</tr>
							))}
							{!visibleBookings.length && <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings match these filters.</td></tr>}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default Bookings;
