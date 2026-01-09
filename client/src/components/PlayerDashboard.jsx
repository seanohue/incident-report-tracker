import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Container,
  Chip,
} from '@mui/material';
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
    <Container maxWidth="lg">
      <Typography variant="h4" component="h2" gutterBottom>
        Submit a Report
      </Typography>
      
      <Box mb={2}>
        <Chip
          label={state.selectedUser.banned ? 'BANNED' : 'Active'}
          color={state.selectedUser.banned ? 'error' : 'success'}
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="report-reason-label">Report Reason</InputLabel>
              <Select
                labelId="report-reason-label"
                id="report-reason"
                value={reportReasonId || ''}
                onChange={(e) => setReportReasonId(e.target.value)}
                label="Report Reason"
                required
              >
                {reasons.map(reason => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.textKey}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="reported-user-label">Offending Player</InputLabel>
              <Select
                labelId="reported-user-label"
                id="reported-user"
                value={reportedUserId || ''}
                onChange={(e) => setReportedUserId(e.target.value)}
                label="Offending Player"
                required
              >
                {otherPlayers.map(player => (
                  <MenuItem key={player.id} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              id="details"
              label="Report Details"
              multiline
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting || reasonsLoading}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h5" component="h3" gutterBottom>
        My Reports
      </Typography>
      {incidentsLoading ? (
        <Typography>Loading incidents...</Typography>
      ) : myIncidents.length === 0 ? (
        <Typography>No reports submitted yet.</Typography>
      ) : (
        <Box>
          {myIncidents.map(incident => (
            <Card key={incident.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" component="div">
                    {incident.reportReason.textKey}
                  </Typography>
                  <Chip
                    label={
                      incident.resolved
                        ? incident.reportedUser?.banned
                          ? 'Resolved with ban'
                          : 'Resolved without banning'
                        : 'Unresolved'
                    }
                    color={
                      incident.resolved
                        ? incident.reportedUser?.banned
                          ? 'error'
                          : 'success'
                        : 'warning'
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                {incident.reportedUser && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reported player: {incident.reportedUser.name}
                  </Typography>
                )}
                <Typography variant="body1" paragraph>
                  {incident.details}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitted: {new Date(incident.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

