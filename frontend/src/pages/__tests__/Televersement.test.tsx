import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Televersement } from '../Televersement';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    token: null,
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
  }),
}));

function renderPage() {
  return render(<MemoryRouter><Televersement /></MemoryRouter>);
}

function selectFile(size: number) {
  const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
  Object.defineProperty(file, 'size', { value: size });
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

describe('Televersement', () => {
  describe('idle state', () => {
    it('renders the prompt text and the upload button', () => {
      renderPage();
      expect(screen.getByText('Tu veux partager un fichier ?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Téléverser un fichier' })).toBeInTheDocument();
    });

    it('clicking the upload button opens the file picker without navigating away', () => {
      renderPage();
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = jest.spyOn(input, 'click');

      fireEvent.click(screen.getByRole('button', { name: 'Téléverser un fichier' }));

      expect(clickSpy).toHaveBeenCalled();
      expect(screen.getByText('Tu veux partager un fichier ?')).toBeInTheDocument();
    });
  });

  describe('header auth', () => {
    it('opens the auth modal when clicking "Se connecter" instead of navigating away', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
      expect(screen.getByText('Tu veux partager un fichier ?')).toBeInTheDocument();
    });
  });

  describe('form state', () => {
    it('shows the file name, an enabled "Téléverser" button and a "Changer" button after selecting a valid file', () => {
      renderPage();
      selectFile(500_000_000);

      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Téléverser/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /Changer/i })).toBeInTheDocument();
    });
  });

  describe('form state with oversized file', () => {
    it('shows the error message and disables the "Téléverser" button', () => {
      renderPage();
      selectFile(2_000_000_000);

      expect(screen.getByText('La taille des fichiers est limitée à 1 Go')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Téléverser/i })).toBeDisabled();
    });
  });

  describe('success state', () => {
    it('shows the success message and a datashare link after clicking "Téléverser"', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ token: 'abc123', download_url: '/files/abc123' }),
      }) as jest.Mock;

      renderPage();
      selectFile(500_000_000);
      fireEvent.click(screen.getByRole('button', { name: /Téléverser/i }));

      expect(
        await screen.findByText('Félicitations, ton fichier sera conservé chez nous pendant une semaine !')
      ).toBeInTheDocument();

      const link = screen.getByText(/^http:\/\/localhost\/telechargement\?token=/);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', expect.stringMatching(/^http:\/\/localhost\/telechargement\?token=abc123$/));

      jest.restoreAllMocks();
    });
  });
});
