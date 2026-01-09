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
import { CheckCircle, NotInterested } from '@mui/icons-material';
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
                startIcon={<CheckCircle />}
                onClick={() => handleResolve(incident.id, false)}
              >
                Resolve without ban
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<NotInterested />}
                onClick={() => handleResolve(incident.id, true)}
              >
                {incident.reportedUser ? `Ban ${incident.reportedUser.name}` : 'Ban'}
              </Button>
            </ButtonGroup>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h2" gutterBottom>
        Moderator Dashboard
      </Typography>

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
    </Container>
  );
}

