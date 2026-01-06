import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '../../context/AppContext';
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
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByText('Submit a Report')).toBeInTheDocument();
  });

  it('shows account status', () => {
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByText(/Account Status:/)).toBeInTheDocument();
  });

  it('renders report reason dropdown', () => {
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByLabelText(/Report Reason:/)).toBeInTheDocument();
  });

  it('renders offending player dropdown', () => {
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByLabelText(/Offending Player:/)).toBeInTheDocument();
  });

  it('renders report details textarea', () => {
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByLabelText(/Report Details:/)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByRole('button', { name: /Submit Report/i })).toBeInTheDocument();
  });

  it('submits form with expected data', async () => {
    const user = userEvent.setup();

    renderWithUser(<PlayerDashboard />, mockUser);

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
    renderWithUser(<PlayerDashboard />, mockUser);

    expect(screen.getByText('My Reports')).toBeInTheDocument();
    // Use getAllByText since "Griefing" appears in both dropdown and incident list
    const griefingElements = screen.getAllByText('Griefing');
    expect(griefingElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Test incident')).toBeInTheDocument();
  });
});

