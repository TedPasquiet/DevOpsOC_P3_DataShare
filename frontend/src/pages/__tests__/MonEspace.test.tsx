import { render, screen, fireEvent } from '@testing-library/react';
import { MonEspace } from '../MonEspace';

describe('MonEspace', () => {
  describe('file list', () => {
    it('renders all files by default', () => {
      render(<MonEspace />);
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });

    it('shows correct status labels for active files', () => {
      render(<MonEspace />);
      expect(screen.getByText('Expire dans 2 jours')).toBeInTheDocument();
      expect(screen.getByText('Expire demain')).toBeInTheDocument();
    });

    it('shows expired message for expired file', () => {
      render(<MonEspace />);
      expect(screen.getByText(/Ce fichier à expiré/)).toBeInTheDocument();
    });

    it('shows action buttons for active files', () => {
      render(<MonEspace />);
      expect(screen.getAllByRole('button', { name: /Supprimer/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /Accéder/i }).length).toBeGreaterThan(0);
    });

    it('does not show action buttons for expired files', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getAllByText('Expiré')[0]);
      expect(screen.queryByRole('button', { name: /Supprimer/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Accéder/i })).not.toBeInTheDocument();
    });
  });

  describe('filter', () => {
    it('shows only active files when Actifs filter is selected', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getByText('Actifs'));
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.queryByText('vacances_ardeche.mp4')).not.toBeInTheDocument();
    });

    it('shows only expired files when Expiré filter is selected', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getAllByText('Expiré')[0]);
      expect(screen.queryByText('IMG_9210_12312313131313213231.jpg')).not.toBeInTheDocument();
      expect(screen.queryByText('compo2.mp3')).not.toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });

    it('shows all files again when Tous filter is selected after filtering', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getByText('Actifs'));
      fireEvent.click(screen.getByText('Tous'));
      expect(screen.getByText('IMG_9210_12312313131313213231.jpg')).toBeInTheDocument();
      expect(screen.getByText('compo2.mp3')).toBeInTheDocument();
      expect(screen.getByText('vacances_ardeche.mp4')).toBeInTheDocument();
    });
  });

  describe('sidebar', () => {
    it('sidebar is closed by default', () => {
      render(<MonEspace />);
      expect(screen.getByRole('complementary')).not.toHaveClass('sidebar--open');
    });

    it('opens sidebar when hamburger button is clicked', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      expect(screen.getByRole('complementary')).toHaveClass('sidebar--open');
    });

    it('closes sidebar when close button is clicked', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      fireEvent.click(screen.getByLabelText('Fermer le menu'));
      expect(screen.getByRole('complementary')).not.toHaveClass('sidebar--open');
    });

    it('closes sidebar when overlay is clicked', () => {
      render(<MonEspace />);
      fireEvent.click(screen.getByLabelText('Ouvrir le menu'));
      const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;
      fireEvent.click(overlay);
      expect(screen.getByRole('complementary')).not.toHaveClass('sidebar--open');
    });
  });

  describe('user info', () => {
    it('renders the default user name', () => {
      render(<MonEspace />);
      expect(screen.getByText('Claire Marie')).toBeInTheDocument();
    });

    it('renders a custom user name when provided', () => {
      render(<MonEspace userName="John Doe" />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
