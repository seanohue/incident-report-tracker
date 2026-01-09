import { Box, Tooltip, CircularProgress } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

export function BackendHealthStatus({ isHealthy, isChecking }) {
  if (isChecking) {
    return (
      <Box mb={2}>
        <Tooltip title="Checking backend status...">
          <CircularProgress size={24} />
        </Tooltip>
      </Box>
    );
  }

  if (!isHealthy) {
    return (
      <Box mb={2}>
        <Tooltip title="Backend is offline. Retrying every 30 seconds...">
          <Error color="error" sx={{ fontSize: 28 }} />
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box mb={2}>
      <Tooltip title="Backend is online">
        <CheckCircle color="success" sx={{ fontSize: 28 }} />
      </Tooltip>
    </Box>
  );
}

