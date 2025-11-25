import { render, screen, fireEvent } from '@testing-library/react';
import { RegisterPage } from './RegisterPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../components/Header', () => ({
  Header: ({ onLoginClick, onRegisterClick }: any) => (
    <div>
      <button onClick={onLoginClick}>login-header</button>
      <button onClick={onRegisterClick}>register-header</button>
    </div>
  ),
}));

jest.mock('../components/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form-mock" />,
}));

describe('RegisterPage', () => {
  test('renderiza Header y RegisterForm, y navega a /login desde Header', () => {
    render(<RegisterPage />);

    expect(screen.getByTestId('register-form-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByText('login-header'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
