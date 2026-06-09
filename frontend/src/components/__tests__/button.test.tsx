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
    expect(screen.getByRole('button').querySelector('img[alt="Téléverser"]')).toBeInTheDocument();
  });

  it('does not render the icon by default', () => {
    render(<Button label="Upload" />);
    expect(screen.getByRole('button').querySelector('img[alt="Téléverser"]')).toBeNull();
  });

  it('renders with type="submit" when type prop is submit', () => {
    render(<Button label="Upload" type="submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('defaults to type="button"', () => {
    render(<Button label="Upload" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders a custom icon node when icon prop is provided', () => {
    const customIcon = <span data-testid="custom-icon">★</span>;
    render(<Button label="Upload" icon={customIcon} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('does not render UploadCloud when a custom icon is provided alongside iconActivated', () => {
    const customIcon = <span data-testid="custom-icon">★</span>;
    render(<Button label="Upload" icon={customIcon} iconActivated />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeNull();
  });
});
