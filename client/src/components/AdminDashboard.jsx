import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  ButtonGroup,
} from '@mui/material';
import { useApp } from '../context/AppContext';
import { useIncidents } from '../hooks/useIncidents';
import { useUsers } from '../hooks/useUsers';

export function AdminDashboard() {
  const { state } = useApp();
  const { incidents, loading, updateIncident, refetch: refetchIncidents } = useIncidents();
  const { banUser, unbanUser, users, loading: usersLoading } = useUsers();

  // Separate unresolved and resolved
  const unresolved = incidents.filter(i => !i.resolved);
  const resolvedByMe = incidents.filter(
    i => i.resolved && i.resolverId === state.selectedUser.id
  );
  const resolvedByOthers = incidents.filter(
    i => i.resolved && i.resolverId !== state.selectedUser.id
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

  const handleReopen = async (incidentId) => {
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) return;

    // Unresolve the incident
    const result = await updateIncident(incidentId, { resolved: false });
    
    if (result.success) {
      // If the reported user is banned, unban them
      if (incident.reportedUser?.banned && incident.reportedUserId) {
        const unbanResult = await unbanUser(incident.reportedUserId);
        if (unbanResult.success) {
          // Refetch incidents to get updated user banned status
          await refetchIncidents();
          alert('Report reopened and user unbanned.');
        } else {
          alert(`Report reopened but failed to unban user: ${unbanResult.error}`);
        }
      } else {
        alert('Report reopened.');
      }
    }
  };

  const IncidentCard = ({ incident }) => {
    const resolutionStatus = incident.resolved
      ? incident.reportedUser?.banned
        ? 'Resolved with ban'
        : 'Resolved without banning'
      : null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div">
              {incident.reportReason.textKey}
            </Typography>
            {resolutionStatus && (
              <Chip
                label={resolutionStatus}
                color={resolutionStatus === 'Resolved with ban' ? 'error' : 'success'}
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          <Typography variant="body1" paragraph>
            {incident.details}
          </Typography>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Reported by: {incident.reporter.name}
            </Typography>
            {incident.reportedUser && (
              <Typography variant="body2" color="text.secondary">
                Reported player: {incident.reportedUser.name}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Submitted: {new Date(incident.createdAt).toLocaleString()}
            </Typography>
          </Box>
          {!incident.resolved && (
            <ButtonGroup>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleResolve(incident.id, false)}
              >
                Resolve without ban
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleResolve(incident.id, true)}
              >
                {incident.reportedUser ? `Ban ${incident.reportedUser.name}` : 'Ban'}
              </Button>
            </ButtonGroup>
          )}
          {incident.resolved && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleReopen(incident.id)}
            >
              Re-open Report
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Filter to only show players
  const players = users.filter(u => u.role === 'Player');

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h2" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box mt={4}>
        <Typography variant="h5" component="h3" gutterBottom>
          All Players
        </Typography>
        {usersLoading ? (
          <Typography>Loading players...</Typography>
        ) : players.length === 0 ? (
          <Typography>No players found.</Typography>
        ) : (
          <Box>
            {players.map(player => (
              <Card key={player.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" component="div">
                        {player.name || player.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {player.email} •{' '}
                        {player.banned ? (
                          <Chip label="BANNED" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                        ) : (
                          <Chip label="Active" color="success" size="small" />
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      {player.banned ? (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={async () => {
                            const result = await unbanUser(player.id);
                            if (result.success) {
                              alert(`${player.name || player.email} has been unbanned.`);
                            } else {
                              alert(`Failed to unban: ${result.error}`);
                            }
                          }}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={async () => {
                            const result = await banUser(player.id);
                            if (result.success) {
                              alert(`${player.name || player.email} has been banned.`);
                            } else {
                              alert(`Failed to ban: ${result.error}`);
                            }
                          }}
                        >
                          Ban
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Box mt={4}>
        <Typography variant="h5" component="h3" gutterBottom>
          Unresolved Reports
        </Typography>
        {loading ? (
          <Typography>Loading incidents...</Typography>
        ) : unresolved.length === 0 ? (
          <Typography>No unresolved reports.</Typography>
        ) : (
          <Box>
            {unresolved.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </Box>
        )}
      </Box>

      <Box mt={4}>
        <Typography variant="h5" component="h3" gutterBottom>
          Resolved by Me
        </Typography>
        {resolvedByMe.length === 0 ? (
          <Typography>No reports resolved yet.</Typography>
        ) : (
          <Box>
            {resolvedByMe.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </Box>
        )}
      </Box>

      <Box mt={4}>
        <Typography variant="h5" component="h3" gutterBottom>
          Resolved by Others
        </Typography>
        {resolvedByOthers.length === 0 ? (
          <Typography>No reports resolved by others.</Typography>
        ) : (
          <Box>
            {resolvedByOthers.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}
