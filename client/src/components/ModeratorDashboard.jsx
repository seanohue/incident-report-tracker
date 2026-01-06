import { useApp } from '../context/AppContext';
import { useIncidents } from '../hooks/useIncidents';
import { useUsers } from '../hooks/useUsers';

export function ModeratorDashboard() {
  const { state } = useApp();
  const { incidents, loading, updateIncident } = useIncidents();
  const { banUser } = useUsers();

  // Separate unresolved and resolved (by this moderator)
  const unresolved = incidents.filter(i => !i.resolved);
  const resolvedByMe = incidents.filter(
    i => i.resolved && i.resolverId === state.selectedUser.id
  );

  const handleResolve = async (incidentId, shouldBan = false) => {
    const updates = { resolved: true };
    
    // Resolve the incident first
    const result = await updateIncident(incidentId, updates);
    
    if (result.success) {
      if (shouldBan) {
        // Get the incident to find the reported user (not the reporter!)
        const incident = incidents.find(i => i.id === incidentId);
        if (incident && incident.reportedUserId) {
          const banResult = await banUser(incident.reportedUserId);
          if (banResult.success) {
            alert(`Report resolved and user banned.`);
          } else {
            alert(`Report resolved but failed to ban user: ${banResult.error}`);
          }
        } else {
          alert('Report resolved, but no user to ban.');
        }
      } else {
        alert('Report resolved without banning.');
      }
    }
  };

  const IncidentCard = ({ incident }) => {
    // Determine resolution status
    let resolutionStatus = null;
    if (incident.resolved) {
      if (incident.reportedUser?.banned) {
        resolutionStatus = 'Resolved with ban';
      } else {
        resolutionStatus = 'Resolved without banning';
      }
    }

    return (
      <div
        style={{
          padding: '1rem',
          marginBottom: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: '#333'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <strong style={{ color: '#333' }}>{incident.reportReason.textKey}</strong>
          {resolutionStatus && (
            <span style={{ 
              color: resolutionStatus === 'Resolved with ban' ? 'red' : '#28a745', 
              fontWeight: 'bold' 
            }}>
              {resolutionStatus}
            </span>
          )}
        </div>
        <p style={{ margin: '0.5rem 0', color: '#333' }}>{incident.details}</p>
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          <div>Reported by: {incident.reporter.name}</div>
          {incident.reportedUser && (
            <div>Reported player: {incident.reportedUser.name}</div>
          )}
          <div>Submitted: {new Date(incident.createdAt).toLocaleString()}</div>
        </div>
      {!incident.resolved && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleResolve(incident.id, false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Resolve without ban
          </button>
          <button
            onClick={() => handleResolve(incident.id, true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {incident.reportedUser ? `Ban ${incident.reportedUser.name}` : 'Ban'}
          </button>
        </div>
      )}
      </div>
    );
  };

  return (
    <div>
      <h2>Moderator Dashboard</h2>

      <div style={{ marginTop: '2rem' }}>
        <h3>Unresolved Reports</h3>
        {loading ? (
          <p>Loading incidents...</p>
        ) : unresolved.length === 0 ? (
          <p>No unresolved reports.</p>
        ) : (
          <div>
            {unresolved.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Resolved by Me</h3>
        {resolvedByMe.length === 0 ? (
          <p>No reports resolved yet.</p>
        ) : (
          <div>
            {resolvedByMe.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

