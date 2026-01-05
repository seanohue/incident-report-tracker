import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Backend not connected'));

    // Fetch users
    axios.get('/api/test/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Incident Report Tracking App</h1>
      <p>{message}</p>

      <div style={{ marginTop: '2rem' }}>
        <label htmlFor="user-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Select User:
        </label>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <select
            id="user-select"
            value={selectedUser?.id || ''}
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
        )}

        {selectedUser && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h3>Selected User:</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.banned ? 'Banned' : 'Active'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
