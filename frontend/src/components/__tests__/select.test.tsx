import { render, screen } from '@testing-library/react';
import { Select } from '../select';

describe('Select', () => {
  it('renders the label', () => {
    render(<Select text="Catégorie" option={[]} />);
    expect(screen.getByText('Catégorie')).toBeInTheDocument();
  });

  it('renders the default placeholder option', () => {
    render(<Select option={[]} />);
    expect(screen.getByRole('option', { name: '--Veuillez choisir une option--' })).toBeInTheDocument();
  });

  it('renders a custom placeholder', () => {
    render(<Select option={[]} placeholder="-- Choisir --" />);
    expect(screen.getByRole('option', { name: '-- Choisir --' })).toBeInTheDocument();
  });

  it('renders all provided options', () => {
    render(<Select option={['PDF', 'PNG', 'JPG']} />);
    expect(screen.getByRole('option', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'PNG' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'JPG' })).toBeInTheDocument();
  });

  it('sets required attribute when required is true', () => {
    render(<Select option={[]} required />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('associates label with select via id', () => {
    render(<Select text="Type" option={[]} id="file-type" />);
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });
});
