// frontend/src/pages/TopicoEditorLayout.test.tsx
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

// Importamos el componente
import TopicoEditorLayout from './TopicoEditorLayout';

// Mock de react-router-dom: useParams + useNavigate
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => jest.fn(),
  };
});

// Mock de toast para que no reviente
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// Mock de servicios que usa el componente
jest.mock('../services/authService', () => ({
  getSession: jest.fn().mockResolvedValue({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: true,
      roleId: 1,
      roleName: 'admin',
    },
  }),
}));

jest.mock('../services/commentService', () => ({
  fetchCommentForPlantilla: jest.fn().mockResolvedValue(null),
  postMainCommentApi: jest.fn(),
  postReplyApi: jest.fn(),
}));

const originalError = console.error;

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    const [first] = args;

    // Ignorar SOLO el warning de React + GoldenLayout
    if (
      typeof first === 'string' &&
      first.includes('Attempted to synchronously unmount a root while React was already rendering')
    ) {
      return;
    }

    // Para el resto de errores, seguir mostrando
    originalError(...args);
  });
});

afterAll(() => {
  (console.error as any).mockRestore?.();
});

describe('TopicoEditorLayout', () => {
  test('renderiza el layout básico del tópico', async () => {
    render(
      <MemoryRouter>
        <TopicoEditorLayout />
      </MemoryRouter>,
    );

    // Título principal
    expect(
      await screen.findByText(/Editor de layout de tópico/i),
    ).toBeInTheDocument();

    // Botones de la barra lateral
    expect(
      screen.getByText('+ Añadir ventana'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Guardar nueva plantilla'),
    ).toBeInTheDocument();

    // Texto que describe el uso de recursos
    expect(
      screen.getByText(/Tipos de recurso/i),
    ).toBeInTheDocument();
  });
});
