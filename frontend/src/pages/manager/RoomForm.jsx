import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const initialForm = {
	name: '', roomNumber: '', type: 'single', pricePerNight: '', capacity: '1', beds: '1', quantity: '1', description: '',
};

const inputStyle = {
	width: '100%', padding: '0.7rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px',
	background: 'var(--bg-surface)', color: 'var(--text-main)',
};

const RoomForm = () => {
	const { hotelId, roomId } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState(initialForm);
	const [loading, setLoading] = useState(Boolean(roomId));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!roomId) return;

		const fetchRoom = async () => {
			try {
				const response = await api.get(`/hotels/${hotelId}/rooms`);
				const room = response.data.data.find(item => item._id === roomId);
				if (!room) throw new Error('Room not found.');
				setForm({
					name: room.name || '', roomNumber: room.roomNumber || '', type: room.type || 'single',
					pricePerNight: String(room.pricePerNight || ''), capacity: String(room.capacity || 1),
					beds: String(room.beds || 1), quantity: String(room.quantity || 1), description: room.description || '',
				});
			} catch (requestError) {
				setError(requestError.response?.data?.message || requestError.message || 'Could not load this room.');
			} finally {
				setLoading(false);
			}
		};
		fetchRoom();
	}, [hotelId, roomId]);

	const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

	const handleSubmit = async event => {
		event.preventDefault();
		setSaving(true);
		setError('');
		const payload = {
			...form,
			pricePerNight: Number(form.pricePerNight),
			capacity: Number(form.capacity),
			beds: Number(form.beds),
			quantity: Number(form.quantity),
		};
		try {
			if (roomId) await api.put(`/rooms/${roomId}`, payload);
			else await api.post(`/hotels/${hotelId}/rooms`, payload);
			navigate(`/manager/hotel/${hotelId}/rooms`);
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not save this room.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p role="status">Loading room...</p>;

	return (
		<section style={{ maxWidth: '760px' }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
				<h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{roomId ? 'Edit room' : 'Add room'}</h1>
				<Link to={`/manager/hotel/${hotelId}/rooms`} className="btn-outline" style={{ padding: '0.6rem 0.9rem', borderRadius: '8px' }}>Cancel</Link>
			</header>
			{error && <p role="alert" style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>}
			<form className="card" onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '1rem' }}>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Room name<input name="name" required value={form.name} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Room number<input name="roomNumber" required value={form.roomNumber} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Room type<select name="type" value={form.type} onChange={updateField} style={inputStyle}><option value="single">Single</option><option value="double">Double</option><option value="deluxe">Deluxe</option><option value="suite">Suite</option><option value="dorm">Dorm</option></select></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Price per night<input name="pricePerNight" type="number" min="0" required value={form.pricePerNight} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Guest capacity<input name="capacity" type="number" min="1" required value={form.capacity} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Beds<input name="beds" type="number" min="1" required value={form.beds} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Available units<input name="quantity" type="number" min="1" required value={form.quantity} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>Description<textarea name="description" rows="3" value={form.description} onChange={updateField} style={inputStyle} /></label>
				<div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.7rem 1rem', borderRadius: '8px' }}>{saving ? 'Saving...' : roomId ? 'Save changes' : 'Create room'}</button></div>
			</form>
		</section>
	);
};

export default RoomForm;
