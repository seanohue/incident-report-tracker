import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../../context/AppContext';
import { PlayerDashboard } from '../PlayerDashboard';

// Mock the hooks
const mockCreateIncident = jest.fn().mockResolvedValue({ success: true, data: {} });

jest.mock('../../hooks/useReportReasons', () => ({
  useReportReasons: () => ({
    reasons: [
      { id: 1, textKey: 'Inappropriate Communications' },
      { id: 2, textKey: 'Griefing' },
    ],
    loading: false,
  }),
}));

jest.mock('../../hooks/useIncidents', () => ({
  useIncidents: () => ({
    incidents: [
      {
        id: 1,
        reporterId: 1,
        reportReason: { textKey: 'Griefing' },
        details: 'Test incident',
        resolved: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
    loading: false,
    createIncident: mockCreateIncident,
  }),
}));

jest.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    users: [
      { id: 1, name: 'Alice Player', role: 'Player' },
      { id: 2, name: 'Dave Player', role: 'Player' },
    ],
    loading: false,
  }),
}));

jest.mock('../../hooks/useBackendHealth', () => ({
  useBackendHealth: () => ({
    isHealthy: true,
    isChecking: false,
  }),
}));

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

describe('PlayerDashboard', () => {
  const mockUser = {
    id: 1,
    name: 'Alice Player',
    role: 'Player',
    banned: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the submit report heading', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText('Submit a Report')).toBeInTheDocument();
  });

  it('shows account status', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText(/Account Status:/)).toBeInTheDocument();
  });

  it('renders report reason dropdown', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByLabelText(/Report Reason:/)).toBeInTheDocument();
  });

  it('renders offending player dropdown', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByLabelText(/Offending Player:/)).toBeInTheDocument();
  });

  it('renders report details textarea', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByLabelText(/Report Details:/)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByRole('button', { name: /Submit Report/i })).toBeInTheDocument();
  });

  it('submits form with expected data', async () => {
    const user = userEvent.setup();

    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    // Fill in the form
    await user.selectOptions(screen.getByLabelText(/Report Reason:/), '1');
    await user.selectOptions(screen.getByLabelText(/Offending Player:/), '2');
    await user.type(screen.getByLabelText(/Report Details:/), 'Test report details');

    // Submit
    await user.click(screen.getByRole('button', { name: /Submit Report/i }));

    await waitFor(() => {
      expect(mockCreateIncident).toHaveBeenCalledWith(1, 'Test report details', 2);
    });
  });

  it('displays user incidents', () => {
    render(
      <AppProvider>
        <TestWrapper user={mockUser}>
          <PlayerDashboard />
        </TestWrapper>
      </AppProvider>
    );

    expect(screen.getByText('My Reports')).toBeInTheDocument();
    expect(screen.getByText('Griefing')).toBeInTheDocument();
    expect(screen.getByText('Test incident')).toBeInTheDocument();
  });
});

