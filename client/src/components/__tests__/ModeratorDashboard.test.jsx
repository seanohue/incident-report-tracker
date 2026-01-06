import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '../../context/AppContext';
import { ModeratorDashboard } from '../ModeratorDashboard';

// Helper to render with user in context - sets initial state
function renderWithUser(component, user) {
  const TestProvider = ({ children }) => {
    const [state, dispatch] = React.useReducer(
      (state, action) => {
        switch (action.type) {
          case 'SET_SELECTED_USER':
            return { ...state, selectedUser: action.payload };
          case 'SET_BACKEND_HEALTH':
            return {
              ...state,
              backendHealth: {
                isHealthy: action.payload.isHealthy,
                isChecking: action.payload.isChecking ?? state.backendHealth.isChecking,
              },
            };
          default:
            return state;
        }
      },
      {
        selectedUser: user,
        backendHealth: { isHealthy: true, isChecking: false },
      }
    );

    return (
      <AppContext.Provider value={{ state, dispatch }}>
        {children}
      </AppContext.Provider>
    );
  };

  return render(<TestProvider>{component}</TestProvider>);
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
    renderWithUser(<ModeratorDashboard />, mockUser);

    expect(screen.getByText('Moderator Dashboard')).toBeInTheDocument();
  });

  it('shows unresolved reports section', () => {
    renderWithUser(<ModeratorDashboard />, mockUser);

    expect(screen.getByText('Unresolved Reports')).toBeInTheDocument();
  });

  it('shows resolved by me section', () => {
    renderWithUser(<ModeratorDashboard />, mockUser);

    expect(screen.getByText('Resolved by Me')).toBeInTheDocument();
  });

  it('displays unresolved incidents', () => {
    renderWithUser(<ModeratorDashboard />, mockUser);

    expect(screen.getByText('Griefing')).toBeInTheDocument();
    expect(screen.getByText('Test incident')).toBeInTheDocument();
  });

  it('renders resolve and ban buttons for unresolved incidents', () => {
    renderWithUser(<ModeratorDashboard />, mockUser);

    // Use getAllByRole since there might be multiple buttons, but we just need to verify they exist
    const resolveButtons = screen.getAllByRole('button', { name: /Resolve without ban/i });
    expect(resolveButtons.length).toBeGreaterThan(0);
    const banButtons = screen.getAllByRole('button', { name: /Ban/i });
    expect(banButtons.length).toBeGreaterThan(0);
  });
});

