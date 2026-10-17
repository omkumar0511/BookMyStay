import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const initialForm = {
	name: '',
	propertyType: 'hotel',
	description: '',
	starRating: '3',
	priceFrom: '',
	street: '',
	city: '',
	state: '',
	country: '',
	zip: '',
	amenities: '',
	images: '',
	checkIn: '14:00',
	checkOut: '11:00',
	cancellation: 'moderate',
};

const inputStyle = {
	width: '100%',
	padding: '0.7rem 0.8rem',
	border: '1px solid var(--border)',
	borderRadius: '6px',
	background: 'var(--bg-surface)',
	color: 'var(--text-main)',
};

const HotelForm = () => {
	const { hotelId } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState(initialForm);
	const [loading, setLoading] = useState(Boolean(hotelId));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!hotelId) return;

		const fetchHotel = async () => {
			try {
				const response = await api.get(`/hotels/${hotelId}`);
				const hotel = response.data.data;
				setForm({
					name: hotel.name || '',
					propertyType: hotel.propertyType || 'hotel',
					description: hotel.description || '',
					starRating: String(hotel.starRating || 3),
					priceFrom: String(hotel.priceFrom || ''),
					street: hotel.address?.street || '',
					city: hotel.address?.city || '',
					state: hotel.address?.state || '',
					country: hotel.address?.country || '',
					zip: hotel.address?.zip || '',
					amenities: hotel.amenities?.join(', ') || '',
					images: hotel.images?.join(', ') || '',
					checkIn: hotel.policies?.checkIn || '14:00',
					checkOut: hotel.policies?.checkOut || '11:00',
					cancellation: hotel.policies?.cancellation || 'moderate',
				});
			} catch (requestError) {
				setError(requestError.response?.data?.message || 'Could not load this property.');
			} finally {
				setLoading(false);
			}
		};

		fetchHotel();
	}, [hotelId]);

	const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

	const handleSubmit = async event => {
		event.preventDefault();
		setSaving(true);
		setError('');
		const payload = {
			name: form.name,
			propertyType: form.propertyType,
			description: form.description,
			starRating: Number(form.starRating),
			priceFrom: Number(form.priceFrom),
			address: { street: form.street, city: form.city, state: form.state, country: form.country, zip: form.zip },
			amenities: form.amenities.split(',').map(value => value.trim()).filter(Boolean),
			images: form.images.split(',').map(value => value.trim()).filter(Boolean),
			policies: { checkIn: form.checkIn, checkOut: form.checkOut, cancellation: form.cancellation },
		};

		try {
			if (hotelId) {
				await api.put(`/hotels/${hotelId}`, payload);
			} else {
				await api.post('/hotels', payload);
			}
			navigate('/manager/hotels');
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not save this property.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p role="status">Loading property...</p>;

	return (
		<section style={{ maxWidth: '900px' }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
				<h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{hotelId ? 'Edit property' : 'Add property'}</h1>
				<Link to="/manager/hotels" className="btn-outline" style={{ padding: '0.6rem 0.9rem', borderRadius: '8px' }}>Cancel</Link>
			</header>
			{error && <p role="alert" style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>}
			<form className="card" onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Property name<input name="name" required value={form.name} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Property type<select name="propertyType" value={form.propertyType} onChange={updateField} style={inputStyle}><option value="hotel">Hotel</option><option value="resort">Resort</option><option value="hostel">Hostel</option><option value="villa">Villa</option><option value="apartment">Apartment</option><option value="boutique">Boutique</option></select></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Starting price per night<input name="priceFrom" type="number" min="0" required value={form.priceFrom} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Star rating<select name="starRating" value={form.starRating} onChange={updateField} style={inputStyle}><option value="1">1 star</option><option value="2">2 stars</option><option value="3">3 stars</option><option value="4">4 stars</option><option value="5">5 stars</option></select></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Street<input name="street" required value={form.street} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>City<input name="city" required value={form.city} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>State / region<input name="state" required value={form.state} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Country<input name="country" required value={form.country} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Postal code<input name="zip" required value={form.zip} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Check-in time<input name="checkIn" type="time" value={form.checkIn} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Check-out time<input name="checkOut" type="time" value={form.checkOut} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem' }}>Cancellation policy<select name="cancellation" value={form.cancellation} onChange={updateField} style={inputStyle}><option value="free">Free</option><option value="moderate">Moderate</option><option value="strict">Strict</option></select></label>
				<label style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>Description<textarea name="description" required rows="4" value={form.description} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>Amenities, separated by commas<input name="amenities" value={form.amenities} onChange={updateField} style={inputStyle} /></label>
				<label style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>Image URLs, separated by commas<input name="images" value={form.images} onChange={updateField} style={inputStyle} /></label>
				<div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
					<button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.7rem 1rem', borderRadius: '8px' }}>{saving ? 'Saving...' : hotelId ? 'Save changes' : 'Create property'}</button>
				</div>
			</form>
		</section>
	);
};

export default HotelForm;
