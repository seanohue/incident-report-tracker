import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../../App';

// Mock axios
jest.mock('axios');
axios.get.mockImplementation((url) => {
  if (url === '/api/health') {
    return Promise.resolve({ status: 200, data: { message: 'Backend is running!' } });
  }
  if (url === '/api/test/users') {
    return Promise.resolve({
      status: 200,
      data: [
        { id: 1, name: 'Alice Player', role: 'Player', banned: false },
        { id: 2, name: 'Bob Moderator', role: 'Moderator', banned: false },
        { id: 3, name: 'Charlie Admin', role: 'Admin', banned: false },
        { id: 4, name: 'Spectator User', role: 'Spectator', banned: false },
      ],
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

jest.mock('../../hooks/useBackendHealth', () => ({
  useBackendHealth: () => ({
    isHealthy: true,
    isChecking: false,
  }),
}));

jest.mock('../../hooks/useUsers', () => ({
  useUsers: () => ({
    users: [
      { id: 1, name: 'Alice Player', role: 'Player', banned: false },
      { id: 2, name: 'Bob Moderator', role: 'Moderator', banned: false },
      { id: 3, name: 'Charlie Admin', role: 'Admin', banned: false },
      { id: 4, name: 'Spectator User', role: 'Spectator', banned: false },
    ],
    loading: false,
  }),
}));

jest.mock('../../hooks/useReportReasons', () => ({
  useReportReasons: () => ({
    reasons: [],
    loading: false,
  }),
}));

jest.mock('../../hooks/useIncidents', () => ({
  useIncidents: () => ({
    incidents: [],
    loading: false,
    createIncident: jest.fn(),
    updateIncident: jest.fn(),
  }),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders app title', () => {
    render(<App />);
    expect(screen.getByText('Incident Report Tracking App')).toBeInTheDocument();
  });

  it('shows user select dropdown', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Select User:/)).toBeInTheDocument();
    });
  });

  it('displays Player dashboard when Player role is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Select User:/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/Select User:/), '1');

    await waitFor(() => {
      expect(screen.getByText('Submit a Report')).toBeInTheDocument();
    });
  });

  it('displays Moderator dashboard when Moderator role is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Select User:/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/Select User:/), '2');

    await waitFor(() => {
      expect(screen.getByText('Moderator Dashboard')).toBeInTheDocument();
    });
  });

  it('displays Admin dashboard when Admin role is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Select User:/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/Select User:/), '3');

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('shows error message for invalid role (Spectator)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Select User:/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/Select User:/), '4');

    await waitFor(() => {
      expect(
        screen.getByText('That role is not valid. Please contact an Administrator.')
      ).toBeInTheDocument();
    });
  });
});

