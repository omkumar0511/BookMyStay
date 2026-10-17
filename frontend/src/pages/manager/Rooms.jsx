import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BedDouble, Plus, Pencil } from 'lucide-react';
import api from '../../api/axios';

const Rooms = () => {
	const { hotelId } = useParams();
	const [hotel, setHotel] = useState(null);
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [hotelResponse, roomsResponse] = await Promise.all([
					api.get(`/hotels/${hotelId}`),
					api.get(`/hotels/${hotelId}/rooms`),
				]);
				setHotel(hotelResponse.data.data);
				setRooms(roomsResponse.data.data);
			} catch (requestError) {
				setError(requestError.response?.data?.message || 'Could not load rooms for this property.');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [hotelId]);

	return (
		<section>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
				<div>
					<Link to="/manager/hotels" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>My Hotels</Link>
					<h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{hotel?.name || 'Property rooms'}</h1>
					<p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>{rooms.length} room types</p>
				</div>
				<Link to={`/manager/hotel/${hotelId}/rooms/new`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: '8px' }}>
					<Plus size={18} /> Add room
				</Link>
			</header>

			{error && <p role="alert" style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>}
			{loading ? <p role="status">Loading rooms...</p> : rooms.length === 0 ? (
				<div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
					<BedDouble size={30} style={{ margin: '0 auto 0.8rem', color: 'var(--text-muted)' }} />
					<h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No rooms yet</h2>
					<p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>Create a room type for guests to book.</p>
					<Link to={`/manager/hotel/${hotelId}/rooms/new`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', borderRadius: '8px' }}><Plus size={17} /> Add room</Link>
				</div>
			) : (
				<div className="card" style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', minWidth: '700px', textAlign: 'left', borderCollapse: 'collapse' }}>
						<thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}><th style={{ padding: '1rem' }}>Room</th><th style={{ padding: '1rem' }}>Number</th><th style={{ padding: '1rem' }}>Type</th><th style={{ padding: '1rem' }}>Capacity</th><th style={{ padding: '1rem' }}>Quantity</th><th style={{ padding: '1rem' }}>Price / night</th><th style={{ padding: '1rem' }}>Manage</th></tr></thead>
						<tbody>
							{rooms.map(room => (
								<tr key={room._id} style={{ borderBottom: '1px solid var(--border)' }}>
									<td style={{ padding: '1rem', fontWeight: 600 }}>{room.name}</td>
									<td style={{ padding: '1rem' }}>{room.roomNumber}</td>
									<td style={{ padding: '1rem', textTransform: 'capitalize' }}>{room.type}</td>
									<td style={{ padding: '1rem' }}>{room.capacity} guests</td>
									<td style={{ padding: '1rem' }}>{room.quantity}</td>
									<td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>${Number(room.pricePerNight).toLocaleString()}</td>
									<td style={{ padding: '0.75rem 1rem' }}><Link to={`/manager/hotel/${hotelId}/rooms/${room._id}/edit`} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.7rem', borderRadius: '6px' }}><Pencil size={16} /> Edit</Link></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default Rooms;
