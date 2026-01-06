import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider, useApp } from '../../context/AppContext';
import { ModeratorDashboard } from '../ModeratorDashboard';

// Helper component to set user in context
function TestWrapper({ children, user }) {
  const { dispatch } = useApp();
  React.useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_SELECTED_USER', payload: user });
    }
  }, [user, dispatch]);
  return children;
}

jest.mock('../../hooks/useIncidents', () => ({
  useIncidents: () => ({
    incidents: [
      {
        id: 1,
        reporterId: 1,
        reporter: { id: 1, name: 'Alice Player' },
        reportedUser: { id: 2, name: 'Dave Player' },
        reportReason: { textKey: 'Griefing' },
        details: 'Test incident',
        resolved: false,
        resolverId: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        reporterId: 1,
        reporter: { id: 1, name: 'Alice Player' },
        reportedUser: { id: 2, name: 'Dave Player' },
        reportReason: { textKey: 'Cheating' },
        details: 'Resolved incident',
        resolved: true,
        resolverId: 3,
        createdAt: '2024-01-02T00:00:00Z',
      },
    ],
    loading: false,
    updateIncident: jest.fn().mockResolvedValue({ success: true, data: {} }),
  }),
}));

jest.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    users: [],
    banUser: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('../../hooks/useBackendHealth', () => ({
  useBackendHealth: () => ({
    isHealthy: true,
    isChecking: false,
  }),
}));

describe('ModeratorDashboard', () => {
  const mockUser = {
    id: 3,
    name: 'Bob Moderator',
    role: 'Moderator',
  };

  it('renders moderator dashboard heading', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <ModeratorDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText('Moderator Dashboard')).toBeInTheDocument();
  });

  it('shows unresolved reports section', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <ModeratorDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText('Unresolved Reports')).toBeInTheDocument();
  });

  it('shows resolved by me section', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <ModeratorDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText('Resolved by Me')).toBeInTheDocument();
  });

  it('displays unresolved incidents', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <ModeratorDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText('Griefing')).toBeInTheDocument();
    expect(screen.getByText('Test incident')).toBeInTheDocument();
  });

  it('renders resolve and ban buttons for unresolved incidents', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <ModeratorDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByRole('button', { name: /Resolve without ban/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ban/i })).toBeInTheDocument();
  });
});

