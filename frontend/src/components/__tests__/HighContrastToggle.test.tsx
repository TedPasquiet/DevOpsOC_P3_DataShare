import { render, screen, fireEvent } from '@testing-library/react';
import { HighContrastToggle } from '../HighContrastToggle';

const LS_KEY = 'ds-high-contrast';

describe('HighContrastToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-high-contrast');
  });

  it('renders inactive by default', () => {
    render(<HighContrastToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveClass('hc-toggle--active');
    expect(document.documentElement).not.toHaveAttribute('data-high-contrast');
  });

  it('activates high contrast on click and persists the preference', () => {
    render(<HighContrastToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveClass('hc-toggle--active');
    expect(document.documentElement).toHaveAttribute('data-high-contrast', '');
    expect(localStorage.getItem(LS_KEY)).toBe('1');
  });

  it('deactivates high contrast on a second click', () => {
    render(<HighContrastToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement).not.toHaveAttribute('data-high-contrast');
    expect(localStorage.getItem(LS_KEY)).toBe('0');
  });

  it('restores the preference from localStorage on mount', () => {
    localStorage.setItem(LS_KEY, '1');

    render(<HighContrastToggle />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('data-high-contrast', '');
  });

  it('updates the accessible label depending on the state', () => {
    render(<HighContrastToggle />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Activer le contraste élevé');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-label', 'Désactiver le contraste élevé');
  });
});
