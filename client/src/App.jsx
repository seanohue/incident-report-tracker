import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import { useBackendHealth } from './hooks/useBackendHealth';
import { useTheme } from './hooks/useTheme';
import { BackendHealthStatus } from './components/BackendHealthStatus';
import { UserSelect } from './components/UserSelect';
import { PlayerDashboard } from './components/PlayerDashboard';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const { isHealthy, isChecking } = useBackendHealth();
  const { state } = useApp();

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Incident Report Tracking App</h1>
      
      <BackendHealthStatus isHealthy={isHealthy} isChecking={isChecking} />
      
      <UserSelect />

      {state.selectedUser && (
        <div style={{ marginTop: '2rem' }}>
          {state.selectedUser.role === 'Player' && <PlayerDashboard />}
          {state.selectedUser.role === 'Moderator' && <ModeratorDashboard />}
          {state.selectedUser.role === 'Admin' && <AdminDashboard />}
          {!['Player', 'Moderator', 'Admin'].includes(state.selectedUser.role) && (
            <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
              That role is not valid. Please contact an Administrator.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
