export function BackendHealthStatus({ isHealthy, isChecking }) {
  if (isChecking) {
    return (
      <div style={{ padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '1rem', color: '#856404' }}>
        Checking backend status...
      </div>
    );
  }

  if (!isHealthy) {
    return (
      <div style={{ padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem', color: '#721c24' }}>
        ⚠️ Backend is offline. Retrying every 30 seconds...
      </div>
    );
  }

  return (
    <div style={{ padding: '0.5rem', backgroundColor: '#d1e7dd', borderRadius: '4px', marginBottom: '1rem', color: '#0f5132' }}>
      ✓ Backend is online
    </div>
  );
}

