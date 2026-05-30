import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Telechargement } from '../Telechargement';

function renderWith(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/telechargement${search}`]}>
      <Telechargement />
    </MemoryRouter>
  );
}

describe('Telechargement', () => {

  describe('État protégé — sans mot de passe', () => {
    it('affiche le titre, le callout info et le bouton disabled', () => {
      renderWith('?protected=true&days=3');
      expect(screen.getByText('Télécharger un fichier')).toBeInTheDocument();
      expect(screen.getByText('Ce fichier expirera dans 3 jours.')).toBeInTheDocument();
      expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger/i })).toBeDisabled();
    });
  });

  describe('État protégé — avec mot de passe saisi', () => {
    it('active le bouton Télécharger après saisie', () => {
      renderWith('?protected=true&days=3');
      fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
        target: { value: 'secret123' },
      });
      expect(screen.getByRole('button', { name: /Télécharger/i })).not.toBeDisabled();
    });
  });

  describe('État non protégé — expire demain', () => {
    it('affiche le callout warning, pas de champ mot de passe, bouton actif', () => {
      renderWith('?protected=false&days=1');
      expect(screen.getByText('Ce fichier expirera demain.')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Mot de passe/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Télécharger/i })).not.toBeDisabled();
    });
  });

  describe('État expiré', () => {
    it('affiche seulement le callout d\'erreur, sans fichier ni bouton', () => {
      renderWith('?expired=true');
      expect(
        screen.getByText("Ce fichier n'est plus disponible en téléchargement car il a expiré.")
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Télécharger/i })).not.toBeInTheDocument();
      expect(screen.queryByText('IMG_9210')).not.toBeInTheDocument();
    });
  });

});
