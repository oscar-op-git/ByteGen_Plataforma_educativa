import {
  fetchCommentForPlantilla,
  postMainCommentApi,
  postReplyApi,
} from './commentService';

const globalAny = globalThis as any;

beforeEach(() => {
  globalAny.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

function mockFetchJsonOnce(status: number, body: any) {
  (globalAny.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Error',
    json: async () => body,
  });
}

describe('commentService', () => {
  test('fetchCommentForPlantilla devuelve null si comment es null', async () => {
    mockFetchJsonOnce(200, { comment: null });

    const result = await fetchCommentForPlantilla(123);

    expect(globalAny.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/comments/plantilla/123'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );

    expect(result).toBeNull();
  });

  test('fetchCommentForPlantilla mapea ids y respuestas a strings', async () => {
    mockFetchJsonOnce(200, {
      comment: {
        id: 1,
        authorName: 'Profesor',
        content: 'Comentario principal',
        createdAt: '2024-01-01T00:00:00.000Z',
        replies: [
          {
            id: 10,
            authorName: 'Alumno',
            content: 'Respuesta 1',
            createdAt: '2024-01-02T00:00:00.000Z',
          },
        ],
      },
    });

    const result = await fetchCommentForPlantilla('456');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('1');
    expect(result!.authorName).toBe('Profesor');
    expect(result!.replies).toHaveLength(1);
    expect(result!.replies[0].id).toBe('10');
    expect(result!.replies[0].authorName).toBe('Alumno');
  });

  test('fetchCommentForPlantilla lanza error cuando API responde error con message', async () => {
    mockFetchJsonOnce(400, {
      message: 'Algo salió mal',
    });

    await expect(fetchCommentForPlantilla(1)).rejects.toThrow('Algo salió mal');
  });

  test('postMainCommentApi mapea correctamente el comentario creado', async () => {
    mockFetchJsonOnce(201, {
      comment: {
        id: 7,
        authorName: 'Profesor',
        content: 'Nuevo comentario',
        createdAt: '2024-01-01T00:00:00.000Z',
        replies: [],
      },
    });

    const result = await postMainCommentApi(99, 'Nuevo comentario');

    expect(globalAny.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/comments/plantilla/99'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ content: 'Nuevo comentario' }),
      }),
    );

    expect(result.id).toBe('7');
    expect(result.content).toBe('Nuevo comentario');
    expect(result.replies).toEqual([]);
  });

  test('postReplyApi mapea correctamente la respuesta creada', async () => {
    mockFetchJsonOnce(201, {
      reply: {
        id: 33,
        authorName: 'Alumno',
        content: 'Respuesta nueva',
        createdAt: '2024-01-03T00:00:00.000Z',
      },
    });

    const result = await postReplyApi(7, 'Respuesta nueva');

    expect(globalAny.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/comments/7/replies'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ content: 'Respuesta nueva' }),
      }),
    );

    expect(result.id).toBe('33');
    expect(result.authorName).toBe('Alumno');
    expect(result.content).toBe('Respuesta nueva');
  });
});
