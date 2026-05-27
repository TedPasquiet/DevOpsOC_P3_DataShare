import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders all options', () => {
    render(<Switch options={['Oui', 'Non']} />);
    expect(screen.getByText('Oui')).toBeInTheDocument();
    expect(screen.getByText('Non')).toBeInTheDocument();
  });

  it('activates the first option by default', () => {
    render(<Switch options={['Oui', 'Non']} />);
    expect(screen.getByText('Oui')).toHaveClass('activated');
    expect(screen.getByText('Non')).toHaveClass('disactivated');
  });

  it('switches active option on click', () => {
    render(<Switch options={['Oui', 'Non']} />);
    fireEvent.click(screen.getByText('Non'));
    expect(screen.getByText('Non')).toHaveClass('activated');
    expect(screen.getByText('Oui')).toHaveClass('disactivated');
  });

  it('calls onChange with the selected option', () => {
    const handleChange = jest.fn();
    render(<Switch options={['Oui', 'Non']} onChange={handleChange} />);
    fireEvent.click(screen.getByText('Non'));
    expect(handleChange).toHaveBeenCalledWith('Non');
  });

  it('calls onChange when clicking the already-active option', () => {
    const handleChange = jest.fn();
    render(<Switch options={['Oui', 'Non']} onChange={handleChange} />);
    fireEvent.click(screen.getByText('Oui'));
    expect(handleChange).toHaveBeenCalledWith('Oui');
  });

  it('works with more than 2 options', () => {
    render(<Switch options={['A', 'B', 'C']} />);
    expect(screen.getByText('A')).toHaveClass('activated');
    fireEvent.click(screen.getByText('C'));
    expect(screen.getByText('C')).toHaveClass('activated');
    expect(screen.getByText('A')).toHaveClass('disactivated');
  });
});
