import { render, screen } from '@testing-library/react';
import { Footer } from '../footer';

describe('Footer', () => {
  it('renders the copyright text', () => {
    render(<Footer />);
    expect(screen.getByText('Copyright DataShare© 2025')).toBeInTheDocument();
  });

  it('does not have mobile-visible class by default', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).not.toHaveClass('footer--mobile-visible');
  });

  it('has mobile-visible class when showOnMobile is true', () => {
    render(<Footer showOnMobile />);
    expect(screen.getByRole('contentinfo')).toHaveClass('footer--mobile-visible');
  });
});
