import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders with the correct label', () => {
    render(<Button label="Upload" />);
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Upload" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Upload" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button label="Upload" disabled onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with fullWidth class when fullWidth is true', () => {
    render(<Button label="Upload" fullWidth />);
    expect(screen.getByRole('button')).toHaveClass('btn--full');
  });

  it('renders with fixed class by default', () => {
    render(<Button label="Upload" />);
    expect(screen.getByRole('button')).toHaveClass('btn--fixed');
  });

  it('renders the icon when iconActivated is true', () => {
    render(<Button label="Upload" iconActivated />);
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('does not render the icon by default', () => {
    render(<Button label="Upload" />);
    expect(screen.getByRole('button').querySelector('svg')).toBeNull();
  });
});
