import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';

// 🔹 mock de useNavigate
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// 🔹 mocks de servicios de auth del frontend
const mockGetSession = jest.fn();
const mockLogin = jest.fn();
const mockSignout = jest.fn();
const mockLoginWithGoogle = jest.fn();

jest.mock('../services/authService', () => ({
    getSession: (...args: any[]) => mockGetSession(...args),
    login: (...args: any[]) => mockLogin(...args),
    signout: (...args: any[]) => mockSignout(...args),
    loginWithGoogle: (...args: any[]) => mockLoginWithGoogle(...args),
}));

beforeEach(() => {
    jest.clearAllMocks();
    // por defecto, al montar el componente no hay sesión
    mockGetSession.mockResolvedValue(null);
});

describe('LoginForm', () => {
    test('muestra error si faltan campos al enviar', async () => {
        const { container } = render(<LoginForm />);

        // disparamos el submit del <form>
        const form = container.querySelector('form');
        expect(form).not.toBeNull();

        fireEvent.submit(form as HTMLFormElement);

        await waitFor(() => {
            expect(
                screen.getByText('Todos los campos son obligatorios'),
            ).toBeInTheDocument();
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });

    test('muestra error si la contraseña es demasiado corta', async () => {
        const { container } = render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText(/ingresa tu correo/i), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByPlaceholderText(/ingresa tu contraseña/i), {
            target: { value: '1234567' }, // < 8 caracteres
        });

        const form = container.querySelector('form');
        expect(form).not.toBeNull();

        fireEvent.submit(form as HTMLFormElement);

        await waitFor(() => {
            expect(
                screen.getByText('La contraseña debe tener al menos 8 caracteres'),
            ).toBeInTheDocument();
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });

    test('login exitoso redirige a /home cuando hay sesión', async () => {
        mockLogin.mockResolvedValue({});


        // 1ª llamada getSession: useEffect inicial → sin sesión
        // 2ª llamada getSession: después de login → con usuario
        mockGetSession
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ user: { id: '1', email: 'test@example.com' } });

        const { container } = render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText(/ingresa tu correo/i), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByPlaceholderText(/ingresa tu contraseña/i), {
            target: { value: 'Password1!' }, // cumple política de contraseña fuerte
        });

        const form = container.querySelector('form');
        expect(form).not.toBeNull();

        fireEvent.submit(form as HTMLFormElement);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                'test@example.com',
                'Password1!',
            );
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    test('login con error muestra mensaje de error', async () => {
        mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));

        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        const { container } = render(<LoginForm />);

        fireEvent.change(screen.getByPlaceholderText(/ingresa tu correo/i), {
            target: { value: 'test@example.com' },
        });

        fireEvent.change(screen.getByPlaceholderText(/ingresa tu contraseña/i), {
            target: { value: 'Password1!' },
        });

        const form = container.querySelector('form');
        expect(form).not.toBeNull();

        fireEvent.submit(form as HTMLFormElement);

        expect(
            await screen.findByText('Credenciales inválidas'),
        ).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
