import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MonEspace } from '../MonEspace';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@datashare.fr', createdAt: '2025-01-01' },
    token: 'mock-token',
    logout: jest.fn(),
    loading: false,
  }),
}));

function renderPage(props: React.ComponentProps<typeof MonEspace> = {}) {
  return render(<MemoryRouter><MonEspace {...props} /></MemoryRouter>);
}

describe('MonEspace', () => {
  describe('file list', () => {
    it('renders all files by default', () => {
      renderPage();
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });

    it('shows correct status labels for active files', () => {
      renderPage();
      expect(screen.getByText('Expire dans 2 jours')).toBeInTheDocument();
      expect(screen.getByText('Expire demain')).toBeInTheDocument();
    });

    it('shows expired message for expired file', () => {
      renderPage();
      expect(screen.getByText(/Ce fichier à expiré/)).toBeInTheDocument();
    });

    it('shows action buttons for active files', () => {
      renderPage();
      expect(screen.getAllByRole('button', { name: /Supprimer/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /Accéder/i }).length).toBeGreaterThan(0);
    });

    it('does not show action buttons for expired files', () => {
      renderPage();
      fireEvent.click(screen.getAllByText('Expiré')[0]);
      expect(screen.queryByRole('button', { name: /Supprimer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Accéder/i })).not.toBeInTheDocument();
    });
  });

  describe('delete confirmation', () => {
    it('shows confirmation dialog when Supprimer is clicked', () => {
      renderPage();
      fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
      expect(screen.getByText('Supprimer ce fichier ?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    it('removes the file after confirming deletion', () => {
      renderPage();
      fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
      fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));
      expect(screen.queryByText('IMG_9210_12312313131313213231.jpg')).not.toBeInTheDocument();
    });

    it('cancels deletion and restores buttons', () => {
      renderPage();
      fireEvent.click(screen.getAllByRole('button', { name: /Supprimer/i })[0]);
      fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
      expect(screen.queryByText('Supprimer ce fichier ?')).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Supprimer/i }).length).toBeGreaterThan(0);
    });
  });

  describe('filter', () => {
    it('shows only active files when Actifs filter is selected', () => {
      renderPage();
      fireEvent.click(screen.getByText('Actifs'));
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.queryByText('vacances_ardeche.mp4')).not.toBeInTheDocument();
    });

    it('shows only expired files when Expiré filter is selected', () => {
      renderPage();
      fireEvent.click(screen.getAllByText('Expiré')[0]);
      expect(screen.queryByText('IMG_9210_12312313131313213231.jpg')).not.toBeInTheDocument();
      expect(screen.queryByText('compo2.mp3')).not.toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });

    it('shows all files again when Tous filter is selected after filtering', () => {
      renderPage();
      fireEvent.click(screen.getByText('Actifs'));
      fireEvent.click(screen.getByText('Tous'));
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });
  });

  describe('sidebar', () => {
    it('sidebar is closed by default', () => {
      renderPage();
      expect(screen.getByRole('complementary', { hidden: true })).not.toHaveClass('sidebar--open');
    });

    it('opens sidebar when hamburger button is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      expect(screen.getByRole('complementary')).toHaveClass('sidebar--open');
    });

    it('closes sidebar when close button is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      fireEvent.click(screen.getByLabelText('Fermer le menu'));
      expect(screen.getByRole('complementary', { hidden: true })).not.toHaveClass('sidebar--open');
    });

    it('closes sidebar when overlay is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;
      fireEvent.click(overlay);
      expect(screen.getByRole('complementary', { hidden: true })).not.toHaveClass('sidebar--open');
    });
  });

  describe('user info', () => {
    it('renders the logged-in user email', () => {
      renderPage();
      expect(screen.getByText('test@datashare.fr')).toBeInTheDocument();
    });
  });
});
