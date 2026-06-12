import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Telechargement } from '../Telechargement';

interface FileInfo {
  token: string;
  originalName: string;
  size: number;
  mimeType: string;
  expiresAt: string;
  expired: boolean;
  passwordProtected: boolean;
}

function mockInfoResponse(info: FileInfo) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(info),
  }) as jest.Mock;
}

function inDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function renderWith(token = 'abc123') {
  return render(
    <MemoryRouter initialEntries={[`/telechargement?token=${token}`]}>
      <Telechargement />
    </MemoryRouter>
  );
}

describe('Telechargement', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('État protégé — sans mot de passe', () => {
    it('affiche le titre, le callout info et le bouton disabled', async () => {
      mockInfoResponse({
        token: 'abc123',
        originalName: 'test.pdf',
        size: 1234,
        mimeType: 'application/pdf',
        expiresAt: inDays(2.5),
        expired: false,
        passwordProtected: true,
      });

      renderWith();

      expect(screen.getByText('Télécharger un fichier')).toBeInTheDocument();
      expect(await screen.findByText('Ce fichier expirera dans 3 jours.')).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger/i })).toBeDisabled();
    });
  });

  describe('État protégé — avec mot de passe saisi', () => {
    it('active le bouton Télécharger après saisie', async () => {
      mockInfoResponse({
        token: 'abc123',
        originalName: 'test.pdf',
        size: 1234,
        mimeType: 'application/pdf',
        expiresAt: inDays(2.5),
        expired: false,
        passwordProtected: true,
      });

      renderWith();

      const passwordInput = await screen.findByLabelText(/Mot de passe/i);
      fireEvent.change(passwordInput, { target: { value: 'secret123' } });

      expect(screen.getByRole('button', { name: /Télécharger/i })).not.toBeDisabled();
    });
  });

  describe('État non protégé — expire demain', () => {
    it('affiche le callout warning, pas de champ mot de passe, bouton actif', async () => {
      mockInfoResponse({
        token: 'abc123',
        originalName: 'test.pdf',
        size: 1234,
        mimeType: 'application/pdf',
        expiresAt: inDays(0.5),
        expired: false,
        passwordProtected: false,
      });

      renderWith();

      expect(await screen.findByText('Ce fichier expirera demain.')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Mot de passe/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger/i })).not.toBeDisabled();
    });
  });

  describe('État expiré', () => {
    it("affiche seulement le callout d'erreur, sans fichier ni bouton", async () => {
      mockInfoResponse({
        token: 'abc123',
        originalName: 'test.pdf',
        size: 1234,
        mimeType: 'application/pdf',
        expiresAt: inDays(-1),
        expired: true,
        passwordProtected: false,
      });

      renderWith();

      expect(
        await screen.findByText("Ce fichier n'est plus disponible en téléchargement car il a expiré.")
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Télécharger/i })).not.toBeInTheDocument();
    });
  });
});
