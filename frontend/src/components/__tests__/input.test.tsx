import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('renders the label', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates label with input via id', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders the placeholder', () => {
    render(<Input placeHolder="exemple@email.com" />);
    expect(screen.getByPlaceholderText('exemple@email.com')).toBeInTheDocument();
  });

  it('renders correct input type', () => {
    render(<Input id="pwd" label="Mot de passe" type="password" />);
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password');
  });

  it('displays the current value', () => {
    render(<Input value="test@email.com" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test@email.com')).toBeInTheDocument();
  });

  it('calls onChange when the user types', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('defaults to type text', () => {
    render(<Input id="name" label="Nom" />);
    expect(screen.getByLabelText('Nom')).toHaveAttribute('type', 'text');
  });
});
