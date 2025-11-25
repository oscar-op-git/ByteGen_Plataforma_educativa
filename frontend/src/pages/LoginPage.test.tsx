
import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPages';

// mockeamos LoginForm para que sea un placeholder simple
jest.mock('../components/LoginForm', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form-mock">LOGIN_FORM</div>,
}));

describe('LoginPage', () => {
  test('renderiza título y el formulario de login', () => {
    render(<LoginPage />);

    expect(screen.getByText('EduMasterCrack')).toBeInTheDocument();
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByTestId('login-form-mock')).toBeInTheDocument();
  });
});
