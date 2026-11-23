import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { AuthProvider } from './context/AuthContext';

vi.mock('./api', () => ({
  fetchProfile: vi.fn(),
  fetchSprint: vi.fn(),
  fetchSprints: vi.fn().mockResolvedValue({ data: [] }),
  searchSprints: vi.fn().mockResolvedValue({ data: [] }),
  login: vi.fn(),
  register: vi.fn(),
  changePassword: vi.fn(),
  getErrorMessage: (error) => error?.message || 'Request failed',
}));

vi.mock('./socket', () => ({
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(),
}));

vi.mock('./components/RetroBoard', () => ({
  default: ({ sprint }) => <div>Retro board for {sprint.name}</div>,
}));

vi.mock('./services/tipsCache', () => ({
  fetchRetroTip: vi.fn().mockResolvedValue({
    tip: 'Keep action items small.',
    source: 'test',
    fromCache: false,
  }),
}));

import { fetchProfile, fetchSprint } from './api';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('product routes', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows marketing landing on / for guests', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: /^sprint retro$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
  });

  it('redirects /sprints to login without a token', async () => {
    renderAt('/sprints');
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('opens retro route after profile restore', async () => {
    localStorage.setItem('token', 'tok');
    fetchProfile.mockResolvedValue({
      data: { id: 1, email: 'a@test.local', role: 'member' },
    });
    fetchSprint.mockResolvedValue({
      data: {
        id: 7,
        name: 'Sprint 7',
        goal: 'Ship',
        status: 'active',
        startDate: '2026-01-01',
        endDate: '2026-01-14',
      },
    });

    renderAt('/sprints/7/retro?store=pg');

    await waitFor(() => {
      expect(fetchSprint).toHaveBeenCalledWith('7', 'pg');
    });
    expect(await screen.findByText(/Retro board for Sprint 7/i)).toBeInTheDocument();
  });

  it('renders 404 for unknown paths', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to sprints/i })).toHaveAttribute(
      'href',
      '/sprints',
    );
  });
});
