import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../header';

describe('Header', () => {
  it('shows "Se connecter" when the user is logged out', () => {
    render(<Header loggedIn={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('Se connecter');
  });

  it('shows "Mon espace" when the user is logged in', () => {
    render(<Header loggedIn={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('Mon espace');
  });

  it('calls onAuthClick when the auth button is clicked', () => {
    const handleAuthClick = jest.fn();
    render(<Header onAuthClick={handleAuthClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleAuthClick).toHaveBeenCalledTimes(1);
  });
});
