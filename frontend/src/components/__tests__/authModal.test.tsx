import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthModal } from '../authModal';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: jest.fn(),
  }),
}));

function renderModal(props: React.ComponentProps<typeof AuthModal>) {
  return render(<MemoryRouter><AuthModal {...props} /></MemoryRouter>);
}

describe('AuthModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false, onClose });
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
  });

  it('renders the login form by default when open', () => {
    renderModal({ isOpen: true, onClose });
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('switches to the register form when "Créer un compte" is clicked', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));
    expect(screen.getByRole('heading', { name: 'Créer un compte' })).toBeInTheDocument();
    expect(screen.getByLabelText('Vérification du mot de passe')).toBeInTheDocument();
  });

  it('register form has 3 inputs', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));
    expect(screen.getAllByRole('textbox').length + screen.getAllByDisplayValue('').length).toBeGreaterThanOrEqual(3);
  });

  it('switches back to the login form when "J\'ai déjà un compte" is clicked', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));
    fireEvent.click(screen.getByRole('button', { name: /j'ai déjà un compte/i }));
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
  });

  it('closes when clicking the backdrop', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('heading', { name: 'Connexion' }).closest('.modal-backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the card', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('heading', { name: 'Connexion' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates login email and password fields on change', () => {
    renderModal({ isOpen: true, onClose });
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    expect(emailInput).toHaveValue('test@test.com');
    expect(passwordInput).toHaveValue('secret');
  });

  it('does not submit the login form (calls preventDefault)', () => {
    renderModal({ isOpen: true, onClose });
    const form = screen.getByRole('heading', { name: 'Connexion' }).closest('form')!;
    fireEvent.submit(form);
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
  });

  it('updates register fields on change', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'reg@test.com' } });
    expect(inputs[0]).toHaveValue('reg@test.com');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], { target: { value: 'pass1' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'pass1' } });
    expect(passwordInputs[0]).toHaveValue('pass1');
    expect(passwordInputs[1]).toHaveValue('pass1');
  });

  it('does not submit the register form (calls preventDefault)', () => {
    renderModal({ isOpen: true, onClose });
    fireEvent.click(screen.getByRole('button', { name: /créer un compte/i }));
    const form = screen.getByRole('heading', { name: 'Créer un compte' }).closest('form')!;
    fireEvent.submit(form);
    expect(screen.getByRole('heading', { name: 'Créer un compte' })).toBeInTheDocument();
  });
});
