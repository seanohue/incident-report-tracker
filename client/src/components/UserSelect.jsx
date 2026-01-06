import { useUsers } from '../hooks/useUsers';
import { useApp } from '../context/AppContext';

export function UserSelect() {
  const { users, loading, error } = useUsers();
  const { state, dispatch } = useApp();

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    const user = users.find(u => u.id === userId);
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error loading users: {error}</p>;
  }

  return (
    <div>
      <label htmlFor="user-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Select User:
      </label>
      <select
        id="user-select"
        value={state.selectedUser?.id || ''}
        onChange={handleUserChange}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          minWidth: '300px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      >
        <option value="">-- Select a user --</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role}){user.banned ? ' [BANNED]' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

