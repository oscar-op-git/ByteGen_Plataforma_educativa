import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// mock de registerService
const mockRegister = jest.fn();

jest.mock('../services/authService', () => ({
  register: (...args: any[]) => mockRegister(...args),
}));

// Simplificamos componentes hijos para el test
jest.mock('./InputField', () => ({
  InputField: (props: any) => (
    <div>
      <label>{props.label}</label>
      <input
        data-testid={props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
      {props.error && <span data-testid={`${props.name}-error`}>{props.error}</span>}
    </div>
  ),
}));

jest.mock('./PasswordStrengthIndicator', () => ({
  PasswordStrengthIndicator: () => <div data-testid="pwd-strength" />,
}));

jest.mock('./SuccessMessage', () => ({
  SuccessMessage: ({ onReset }: { onReset: () => void }) => (
    <div>
      <p>Registro exitoso</p>
      <button onClick={onReset}>reset</button>
    </div>
  ),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('envía datos válidos a registerService', async () => {
    mockRegister.mockResolvedValue({});

    render(<RegisterForm />);

    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Oscar' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: 'Password1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        nombreCompleto: 'Oscar',
        email: 'test@example.com',
        password: 'Password1!',
      });
    });

    // y como mockeamos SuccessMessage, deberíamos verlo
    expect(screen.getByText('Registro exitoso')).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando registerService falla', async () => {
    mockRegister.mockRejectedValue(new Error('Email ya registrado'));

    const consoleSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});   // 👈 silencia console.error en este test

    render(<RegisterForm />);

    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'Oscar' },
    });
    fireEvent.change(screen.getByTestId('email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('password'), {
      target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByTestId('confirmPassword'), {
      target: { value: 'Password1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(
      await screen.findByText('Email ya registrado'),
    ).toBeInTheDocument();
    consoleSpy.mockRestore(); 
  });

  test('botón "Inicia sesión" navega a /login', () => {
    render(<RegisterForm />);

    fireEvent.click(
      screen.getByRole('button', { name: /inicia sesión/i }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
