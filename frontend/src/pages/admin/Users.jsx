import { useContext, useEffect, useState } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Users = () => {
	const { user: currentUser } = useContext(AuthContext);
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState('');
	const [role, setRole] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [savingUserId, setSavingUserId] = useState('');

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await api.get('/users');
				setUsers(response.data.data);
			} catch (requestError) {
				setError(requestError.response?.data?.message || 'Could not load users.');
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

	const normalizedSearch = search.trim().toLowerCase();
	const visibleUsers = users.filter(user =>
		(role === 'all' || user.role === role) &&
		`${user.name} ${user.email}`.toLowerCase().includes(normalizedSearch)
	);

	const updateUser = async (userId, changes) => {
		setSavingUserId(userId);
		setError('');
		try {
			const response = await api.put(`/users/${userId}`, changes);
			setUsers(currentUsers => currentUsers.map(user => user._id === userId ? response.data.data : user));
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not update this account.');
		} finally {
			setSavingUserId('');
		}
	};

	return (
		<section>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
				<div>
					<h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Users</h1>
					<p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>{visibleUsers.length} of {users.length} accounts</p>
				</div>
				<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
					<input aria-label="Search users" placeholder="Search name or email" value={search} onChange={event => setSearch(event.target.value)} style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
					<select aria-label="Filter by role" value={role} onChange={event => setRole(event.target.value)} style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
						<option value="all">All roles</option>
						<option value="admin">Admin</option>
						<option value="manager">Manager</option>
						<option value="user">User</option>
					</select>
				</div>
			</header>

			{error && <p role="alert" style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>}
			{loading ? <p role="status">Loading users...</p> : (
				<div className="card" style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', minWidth: '850px', textAlign: 'left', borderCollapse: 'collapse' }}>
						<thead><tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
							<th style={{ padding: '1rem' }}>Name</th><th style={{ padding: '1rem' }}>Email</th><th style={{ padding: '1rem' }}>Role</th><th style={{ padding: '1rem' }}>Account</th><th style={{ padding: '1rem' }}>Joined</th><th style={{ padding: '1rem' }}>Manage</th>
						</tr></thead>
						<tbody>
							{visibleUsers.map(user => (
								<tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
									<td style={{ padding: '1rem', fontWeight: 600 }}>{user.name}</td>
									<td style={{ padding: '1rem' }}>{user.email}</td>
									<td style={{ padding: '1rem', textTransform: 'capitalize' }}>{user.role}</td>
									<td style={{ padding: '1rem', color: user.isActive ? '#166534' : '#991b1b' }}>{user.isActive ? 'Active' : 'Inactive'}</td>
									<td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
									<td style={{ padding: '0.75rem 1rem' }}>
										{user._id === currentUser?._id ? <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current admin</span> : (
											<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
												<select aria-label={`Change ${user.name}'s role`} value={user.role} disabled={savingUserId === user._id} onChange={event => updateUser(user._id, { role: event.target.value, isActive: user.isActive })} style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
													<option value="admin">Admin</option><option value="manager">Manager</option><option value="user">User</option>
												</select>
												<button type="button" className="btn-outline" disabled={savingUserId === user._id} onClick={() => updateUser(user._id, { role: user.role, isActive: !user.isActive })} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
													{savingUserId === user._id ? 'Saving...' : user.isActive ? 'Deactivate' : 'Activate'}
												</button>
											</div>
										)}
									</td>
								</tr>
							))}
							{!visibleUsers.length && <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users match these filters.</td></tr>}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default Users;
