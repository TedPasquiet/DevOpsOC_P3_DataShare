import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../header';

function renderHeader(props: React.ComponentProps<typeof Header> = {}) {
  return render(<MemoryRouter><Header {...props} /></MemoryRouter>);
}

describe('Header', () => {
  it('shows "Se connecter" when the user is logged out', () => {
    renderHeader({ loggedIn: false });
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('shows "Mon espace" when the user is logged in', () => {
    renderHeader({ loggedIn: true });
    expect(screen.getByRole('button', { name: /mon espace/i })).toBeInTheDocument();
  });

  it('calls onAuthClick when the auth button is clicked', () => {
    const handleAuthClick = jest.fn();
    renderHeader({ onAuthClick: handleAuthClick });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    expect(handleAuthClick).toHaveBeenCalledTimes(1);
  });
});
