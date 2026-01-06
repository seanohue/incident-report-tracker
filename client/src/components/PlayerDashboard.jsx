import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useReportReasons } from '../hooks/useReportReasons';
import { useIncidents } from '../hooks/useIncidents';
import { useUsers } from '../hooks/useUsers';

export function PlayerDashboard() {
  const { state } = useApp();
  const { reasons, loading: reasonsLoading } = useReportReasons();
  const { incidents, loading: incidentsLoading, createIncident } = useIncidents();
  const { users } = useUsers();
  
  const [reportReasonId, setReportReasonId] = useState('');
  const [reportedUserId, setReportedUserId] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter to only show other players (not the current user)
  const otherPlayers = users.filter(u => u.role === 'Player' && u.id !== state.selectedUser.id);

  // Filter to only show this user's incidents
  const myIncidents = incidents.filter(i => i.reporterId === state.selectedUser.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportReasonId || !reportedUserId || !details.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const result = await createIncident(parseInt(reportReasonId), details, parseInt(reportedUserId));
    setSubmitting(false);

    if (result.success) {
      setDetails('');
      setReportReasonId('');
      setReportedUserId('');
      alert('Report submitted successfully.');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div>
      <h2>Submit a Report</h2>
      <p style={{ fontWeight: 'bold', color: state.selectedUser.banned ? 'red' : 'green' }}>
        Account Status: {state.selectedUser.banned ? 'BANNED' : 'Active'}
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="report-reason" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Report Reason:
          </label>
          <select
            id="report-reason"
            value={reportReasonId}
            onChange={(e) => setReportReasonId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">-- Select a reason --</option>
            {reasons.map(reason => (
              <option key={reason.id} value={reason.id}>
                {reason.textKey}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="reported-user" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Offending Player:
          </label>
          <select
            id="reported-user"
            value={reportedUserId}
            onChange={(e) => setReportedUserId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">-- Select a player --</option>
            {otherPlayers.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="details" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Report Details:
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || reasonsLoading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3>My Reports</h3>
        {incidentsLoading ? (
          <p>Loading incidents...</p>
        ) : myIncidents.length === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          <div>
            {myIncidents.map(incident => (
              <div
                key={incident.id}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: incident.resolved ? '#f0f0f0' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#333' }}>{incident.reportReason.textKey}</strong>
                  <span style={{ 
                    color: incident.resolved 
                      ? (incident.reportedUser?.banned ? 'red' : 'green')
                      : 'red', 
                    fontWeight: 'bold' 
                  }}>
                    {incident.resolved ? (
                      incident.reportedUser?.banned ? 'Resolved with ban' : 'Resolved without banning'
                    ) : 'Unresolved'}
                  </span>
                </div>
                {incident.reportedUser && (
                  <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    Reported player: {incident.reportedUser.name}
                  </div>
                )}
                <p style={{ margin: '0.5rem 0', color: '#333' }}>{incident.details}</p>
                <small style={{ color: '#666' }}>
                  Submitted: {new Date(incident.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

