import { render, screen } from '@testing-library/react';
import { Callout } from '../callout';

describe('Callout', () => {
  it('renders the label text', () => {
    render(<Callout label="Fichier trop volumineux" />);
    expect(screen.getByText('Fichier trop volumineux')).toBeInTheDocument();
  });

  it('defaults to info variant with status role', () => {
    render(<Callout label="Information" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses alert role for error variant', () => {
    render(<Callout variant="error" label="Erreur" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses alert role for warning variant', () => {
    render(<Callout variant="warning" label="Attention" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the icon with alt text', () => {
    render(<Callout variant="info" label="Info" />);
    expect(screen.getByAltText('blue circle with exclamation mark')).toBeInTheDocument();
  });

  it('renders the warning icon', () => {
    render(<Callout variant="warning" label="Warning" />);
    expect(screen.getByAltText('yellow triangle with exclamation mark')).toBeInTheDocument();
  });

  it('renders the error icon', () => {
    render(<Callout variant="error" label="Error" />);
    expect(screen.getByAltText('red hexagon with exclamation mark')).toBeInTheDocument();
  });
});
