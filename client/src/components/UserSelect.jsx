import { FormControl, InputLabel, Select, MenuItem, Box, Chip, Typography, CircularProgress, Alert } from '@mui/material';
import { useUsers } from '../hooks/useUsers';
import { useApp } from '../context/AppContext';

const getRoleColor = (role) => {
  switch (role) {
    case 'Player':
      return 'warning'; // Yellow
    case 'Moderator':
      return 'primary'; // Blue
    case 'Admin':
      return 'secondary'; // Purple
    default:
      return 'default';
  }
};

export function UserSelect() {
  const { users, loading, error } = useUsers();
  const { state, dispatch } = useApp();

  const handleUserChange = (e) => {
    const userId = parseInt(e.target.value);
    const user = users.find(u => u.id === userId);
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (error) {
    return <Alert severity="error">Error loading users: {error}</Alert>;
  }

  return (
    <FormControl fullWidth sx={{ mb: 2, minWidth: 300 }}>
      <InputLabel id="user-select-label">Select User</InputLabel>
      <Select
        labelId="user-select-label"
        id="user-select"
        value={state.selectedUser?.id || ''}
        onChange={handleUserChange}
        label="Select User"
        renderValue={(value) => {
          const user = users.find(u => u.id === value);
          if (!user) return '';
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>{user.name}</Typography>
              <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
              {user.banned && <Chip label="BANNED" color="error" size="small" />}
            </Box>
          );
        }}
      >
        {users.map(user => (
          <MenuItem key={user.id} value={user.id}>
            <Box display="flex" alignItems="center" gap={1} width="100%">
              <Typography>{user.name}</Typography>
              <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
              {user.banned && <Chip label="BANNED" color="error" size="small" />}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}


