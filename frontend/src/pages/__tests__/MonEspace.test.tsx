import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MonEspace } from '../MonEspace';
import { apiFetch } from '../../lib/api';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@datashare.fr', createdAt: '2025-01-01' },
    token: 'mock-token',
    logout: jest.fn(),
    loading: false,
  }),
}));

jest.mock('../../lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.Mock;

const MOCK_API_FILES = [
  {
    id: 1,
    token: 'token-1',
    originalName: 'IMG_9210_12312313131313213231.jpg',
    size: 2_600_000,
    mimeType: 'image/jpeg',
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    expired: false,
    passwordProtected: true,
    createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 2,
    token: 'token-2',
    originalName: 'compo2.mp3',
    size: 5_000_000,
    mimeType: 'audio/mpeg',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    expired: false,
    passwordProtected: false,
    createdAt: '2025-06-02T10:00:00Z',
  },
  {
    id: 3,
    token: 'token-3',
    originalName: 'vacances_ardeche.mp4',
    size: 100_000_000,
    mimeType: 'video/mp4',
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    expired: true,
    passwordProtected: false,
    createdAt: '2025-05-25T10:00:00Z',
  },
];

function mockFileList(files = MOCK_API_FILES) {
  mockApiFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => files,
  });
}

function mockDeleteOk() {
  mockApiFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
}

function renderPage(props: React.ComponentProps<typeof MonEspace> = {}) {
  return render(<MemoryRouter><MonEspace {...props} /></MemoryRouter>);
}

beforeEach(() => {
  mockFileList();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('MonEspace', () => {
  describe('file list', () => {
    it('renders all files by default', async () => {
      renderPage();
      expect(await screen.findByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });

    it('shows file size and send date', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      expect(screen.getAllByText(/Mo|Ko|Go/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Envoyé le/).length).toBeGreaterThan(0);
    });

    it('shows correct status labels for active files', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      expect(screen.getByText('Expire demain')).toBeInTheDocument();
      expect(screen.getAllByText(/Expire dans \d+ jours|Expire demain/).length).toBeGreaterThan(0);
    });

    it('shows expired message for expired file', async () => {
      renderPage();
      await screen.findByText('vacances_ardeche.mp4');
      expect(screen.getByText(/Ce fichier à expiré/)).toBeInTheDocument();
    });

    it('shows action buttons for active files', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      expect(screen.getAllByRole('button', { name: /Supprimer/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /Accéder/i }).length).toBeGreaterThan(0);
    });

    it('does not show action buttons for expired files', async () => {
      renderPage();
      await screen.findByText('vacances_ardeche.mp4');
      fireEvent.click(screen.getAllByText('Expiré')[0]);
      expect(screen.queryByRole('button', { name: /Supprimer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Accéder/i })).not.toBeInTheDocument();
    });
  });

  describe('filter', () => {
    it('shows only active files when Actifs filter is selected', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getByText('Actifs'));
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.queryByText('vacances_ardeche.mp4')).not.toBeInTheDocument();
    });

    it('shows only expired files when Expiré filter is selected', async () => {
      renderPage();
      await screen.findByText('vacances_ardeche.mp4');
      fireEvent.click(screen.getAllByText('Expiré')[0]);
      expect(screen.queryByText('IMG_9210_12312313131313213231.jpg')).not.toBeInTheDocument();
      expect(screen.queryByText('compo2.mp3')).not.toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });

    it('shows all files again when Tous filter is selected after filtering', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getByText('Actifs'));
      fireEvent.click(screen.getByText('Tous'));
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });
  });

  describe('delete confirmation', () => {
    it('shows confirmation dialog when Supprimer is clicked', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
      expect(screen.getByText('Supprimer ce fichier ?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    it('removes the file from list after confirming deletion', async () => {
      mockDeleteOk();
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
      fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
      await waitFor(() =>
        expect(screen.queryByText('IMG_9210_12312313131313213231.jpg')).not.toBeInTheDocument()
      );
    });

    it('cancels deletion and restores buttons', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
      fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
      expect(screen.queryByText('Supprimer ce fichier ?')).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Supprimer/i }).length).toBeGreaterThan(0);
    });
  });

  describe('sidebar', () => {
    it('sidebar is closed by default', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      expect(screen.getByRole('complementary', { hidden: true })).not.toHaveClass('sidebar--open');
    });

    it('opens sidebar when hamburger button is clicked', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      expect(screen.getByRole('complementary')).toHaveClass('sidebar--open');
    });

    it('closes sidebar when close button is clicked', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      fireEvent.click(screen.getByLabelText('Fermer le menu'));
      expect(screen.getByRole('complementary', { hidden: true })).not.toHaveClass('sidebar--open');
    });

    it('closes sidebar when overlay is clicked', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;
      fireEvent.click(overlay);
      expect(screen.getByRole('complementary', { hidden: true })).not.toHaveClass('sidebar--open');
    });
  });

  describe('user info', () => {
    it('renders the logged-in user email', async () => {
      renderPage();
      await screen.findByText('IMG_9210_12312313131313213231.jpg');
      expect(screen.getByText('test@datashare.fr')).toBeInTheDocument();
    });
  });
});
