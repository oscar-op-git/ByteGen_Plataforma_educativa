import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  GoldenLayout,
  type LayoutConfig,
  type ComponentContainer,
  type JsonValue,
} from 'golden-layout';

import {
  fetchCommentForPlantilla,
  postMainCommentApi,
  postReplyApi,
} from "../services/commentService";



import type { Topic } from '../types/topic.types';
import { getSession } from '../services/authService';


import TextBlock from '../components/BloqueTexto';
import CodeBlock from '../components/BloqueCodigo';
import PdfBlock from '../components/BloqueDiapositivas';
import VideoBlock from '../components/BloqueVideo';
import TopicHeader from '../components/EncabezadoTopico';
import CodeOutput from '../components/SalidaCodigo';
import LessonNavigation from '../components/BotonesNavegacion';

import '../styles/Topico.css';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-light-theme.css';

// --- Tipos para el state de Golden Layout ---
type BlockState = {
  blockId: string;
};

function asBlockState(state: JsonValue | undefined): BlockState | undefined {
  if (
    !state ||
    typeof state !== 'object' ||
    Array.isArray(state) ||
    state === null
  ) {
    return undefined;
  }

  const candidate = state as { blockId?: unknown };

  if (typeof candidate.blockId === 'string') {
    return { blockId: candidate.blockId };
  }

  return undefined;
}

// --- Pyodide (reutilizado) ---
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<string>;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

// --- Mock de tópico solo para esta vista (sin backend aún) ---
const mockTopic: Topic = {
  id: '1',
  title: 'Introducción a Python',
  variant: 'basic',
  blocks: [
    {
      id: '1',
      type: 'text',
      content:
        'Python es un lenguaje de programación interpretado, fácil de leer y escribir. Es ideal para aprender a programar.',
    },
    {
      id: '2',
      type: 'code',
      content: 'print("Hola desde Python!")',
      language: 'python',
    },
    {
      id: '3',
      type: 'slides',
      content: JSON.stringify({
        pdfUrl: '/documentos/1P_Tema 1-1.pdf',
        totalPages: 18,
        startPage: 1,
        audioUrl: '/documentos/KAL EL NO.mp3',
        transcript: [
          { start: 0, end: 8, text: 'Bienvenido/a a la lección.' },
          {
            start: 8,
            end: 20,
            text: 'Python es legible, versátil y tiene una comunidad enorme.',
          },
          {
            start: 20,
            end: 35,
            text: 'Revisaremos tipos de datos básicos y cómo ejecutar código.',
          },
        ],
      }),
    },
    {
      id: '4',
      type: 'video',
      content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
  ],
};

export default function TopicoGoldenLayout() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estado de navegación
  const [currentLesson, setCurrentLesson] = useState(1);

  // Pyodide y ejecución
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const isExecutingRef = useRef(false);

  // Root y mensaje actual de la ventana de salida
  const outputRootRef = useRef<Root | null>(null);
  const outputMessageRef = useRef<string>('⏳ Cargando intérprete de Python...');

  // Helper para actualizar la ventana de salida
  const updateOutput = useCallback((msg: string) => {
    outputMessageRef.current = msg;
    const root = outputRootRef.current;
    if (root) {
      root.render(<CodeOutput output={msg} />);
    }
  }, []);

  // Cargar Pyodide al montar el componente
  useEffect(() => {
    const loadPyodideInstance = async () => {
      try {
        updateOutput('⏳ Cargando intérprete de Python...');
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        });
        pyodideRef.current = pyodideInstance;
        updateOutput(
          '✓ Intérprete de Python listo. Ejecuta un bloque de código para comenzar.',
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';
        updateOutput(`✗ Error al cargar Python: ${errorMessage}`);
      }
    };

    loadPyodideInstance();
  }, [updateOutput]);

  // Navegación de lecciones (reutilizado)
  const handlePrevious = () => {
    if (currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const handleNext = () => {
    const totalLessons = 10;
    if (currentLesson < totalLessons) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  // Inicialización de Golden Layout (una sola vez)
  useEffect(() => {
    if (!containerRef.current) return;

    const layout = new GoldenLayout(containerRef.current);

    const getBlock = (blockId: string) =>
      mockTopic.blocks.find((b) => b.id === blockId);

    // 1) Bloque de texto
    layout.registerComponentFactoryFunction(
      'text-block',
      (container: ComponentContainer, state: JsonValue | undefined) => {
        const blockState = asBlockState(state);
        if (!blockState) return;

        const block = getBlock(blockState.blockId);
        if (!block) return;

        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

        root.render(<TextBlock content={block.content} />);

        container.on('destroy', () => {
          root.unmount();
        });
      },
    );

    // 2) Bloque de código (con Pyodide integrado a través de refs)
    layout.registerComponentFactoryFunction(
      'code-block',
      (container: ComponentContainer, state: JsonValue | undefined) => {
        const blockState = asBlockState(state);
        if (!blockState) return;

        const block = getBlock(blockState.blockId);
        if (!block) return;

        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

        const executeCode = async (code: string) => {
          const pyodide = pyodideRef.current;
          if (!pyodide || isExecutingRef.current) return;

          isExecutingRef.current = true;
          updateOutput('⏳ Ejecutando código...');

          try {
            // Redirigir stdout a un buffer
            await pyodide.runPythonAsync(
              `
import sys
from io import StringIO
sys.stdout = StringIO()
`,
            );

            // Ejecutar el código del usuario
            await pyodide.runPythonAsync(code);

            // Obtener la salida capturada
            const stdout = await pyodide.runPythonAsync(
              'sys.stdout.getvalue()',
            );

            if (stdout && stdout.trim()) {
              updateOutput(`✓ Código ejecutado correctamente\n\n${stdout}`);
            } else {
              updateOutput(
                '✓ Código ejecutado correctamente\n\n(Sin salida)',
              );
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Error desconocido';
            updateOutput(`✗ Error de Python:\n\n${errorMessage}`);
          } finally {
            isExecutingRef.current = false;
          }
        };

        root.render(
          <CodeBlock
            content={block.content}
            language={block.language}
            blockId={block.id}
            onExecute={executeCode}
            isExecuting={isExecutingRef.current}
          />,
        );

        container.on('destroy', () => {
          root.unmount();
        });
      },
    );

    // 3) Bloque de diapositivas (PDF + audio + transcript)
    layout.registerComponentFactoryFunction(
      'slides-block',
      (container: ComponentContainer, state: JsonValue | undefined) => {
        const blockState = asBlockState(state);
        if (!blockState) return;

        const block = getBlock(blockState.blockId);
        if (!block) return;

        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

        root.render(<PdfBlock content={block.content} />);

        container.on('destroy', () => {
          root.unmount();
        });
      },
    );

    // 4) Bloque de video
    layout.registerComponentFactoryFunction(
      'video-block',
      (container: ComponentContainer, state: JsonValue | undefined) => {
        const blockState = asBlockState(state);
        if (!blockState) return;

        const block = getBlock(blockState.blockId);
        if (!block) return;

        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

        root.render(
          <VideoBlock
            urlOrId={block.content}
            title="Video de apoyo"
          />,
        );

        container.on('destroy', () => {
          root.unmount();
        });
      },
    );

    // 5) Bloque de salida de código (dentro de Golden Layout)
    layout.registerComponentFactoryFunction(
      'output-block',
      (container: ComponentContainer) => {
        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

        // Guardamos el root para poder re-renderizar cuando cambie la salida
        outputRootRef.current = root;

        root.render(
          <CodeOutput output={outputMessageRef.current} />,
        );

        container.on('destroy', () => {
          root.unmount();
          if (outputRootRef.current === root) {
            outputRootRef.current = null;
          }
        });
      },
    );

    const layoutConfig: LayoutConfig = {
      root: {
        type: 'column',
        content: [
          {
            type: 'row',
            content: [
              {
                type: 'column',
                content: [
                  {
                    type: 'component',
                    componentType: 'text-block',
                    title: 'Teoría',
                    componentState: { blockId: '1' },
                  },
                  {
                    type: 'stack',
                    content: [
                      {
                        type:'component',
                        componentType: 'code-block',
                        title: 'Código',
                        componentState: { blockId: '2' },
                      },
                      {
                        type: 'component',
                        componentType: 'output-block',
                        title: 'Salida de código',
                        componentState: {},
                      },
                    ]
                    
                  },
                ],
              },
              {
                type: 'stack',
                content: [
                  {
                    type: 'component',
                    componentType: 'slides-block',
                    title: 'Diapositivas',
                    componentState: { blockId: '3' },
                  },
                  {
                    type: 'component',
                    componentType: 'video-block',
                    title: 'Video',
                    componentState: { blockId: '4' },
                  },
                ],
              },
            ],
          },
          
        ],
      },
    };

    layout.loadLayout(layoutConfig);

    return () => {
      layout.destroy();
    };
  }, [updateOutput]);

  type UserSession = {
    id: string;
    email?: string | null;
    name?: string | null;
    isAdmin?: boolean;
    roleId?: number | null;
    roleName?: string | null;
  };


  type Comment = {
    id: string;
    authorName: string;
    authorRole?: number;
    content: string;
    createdAt: string;
    replies: Array<{
      id: string;
      authorName: string;
      authorRole?: number;
      content: string;
      createdAt: string;
    }>;
  };

function CommentSection({ topicId }: { topicId: string }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [mainText, setMainText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return "Ocurrió un error inesperado.";
  };

  useEffect(() => {
    console.log("[CommentSection] session:", session);
  }, [session]);

  const ALLOWED_ROLES = [1, 2, 4]; // Ejemplo: 1 = Admin, 3 = Docente


    useEffect(() => {
      ;(async () => {
        try {
          const s = await getSession();
          setSession(s?.user ?? null);
        } catch {
          setSession(null);
        }
      })();

      (async () => {
        try {
          const data = await fetchCommentForPlantilla(topicId);
          setComments(data ? [data] : []);
        } catch (error: unknown) {
          console.error("Error al cargar comentarios:", error);
          setComments([]);
        }
      })();
    }, [topicId]);



  const userCanInteract = () => {
    if (!session) {
      console.log("[CommentSection] userCanInteract => false (no session)");
      return false;
    }

    if (session.isAdmin) {
      console.log("[CommentSection] userCanInteract => true (isAdmin)");
      return true;
    }

    const r = session.roleId ?? undefined;
    const can = r !== undefined && ALLOWED_ROLES.includes(r);

    console.log("[CommentSection] roleId:", r, "allowed:", can);

    return can;
  };



  const handlePostMain = async () => {
    if (!userCanInteract() || !mainText.trim()) return;
    if (comments.length > 0) {
      alert(
        "Ya existe un comentario principal. Solo se permiten respuestas al comentario principal."
      );
      return;
    }

    try {
      const created = await postMainCommentApi(topicId, mainText.trim());

      const newComment: Comment = {
        id: created.id,
        authorName: created.authorName,
        content: created.content,
        createdAt: created.createdAt,
        replies: created.replies ?? [],
      };

      setComments([newComment]);
      setMainText("");
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };


  const handlePostReply = async (parentId: string) => {
    if (!userCanInteract() || !replyText.trim()) return;

    try {
      const created = await postReplyApi(parentId, replyText.trim());

      const newReply = {
        id: created.id,
        authorName: created.authorName,
        content: created.content,
        createdAt: created.createdAt,
      };

      const next = comments.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, newReply] } : c
      );

      setComments(next);
      setReplyText("");
      setReplyingToId(null);
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const mainExists = comments.length > 0;

  return (
    <div className="mt-10 border-t border-gray-200 pt-6">
      <h3 className="text-xl font-semibold mb-4">Comentarios</h3>

      {!mainExists ? (
        <div>
          {userCanInteract() ? (
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">
                Publicar comentario principal (solo 1 permitido)
              </label>
              <textarea
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                placeholder="Escribe aquí el comentario principal..."
              />
              <button
                onClick={handlePostMain}
                className="self-start bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                Publicar
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              <p>
                Solo usuarios con rol permitido pueden publicar el comentario
                principal y responder.
              </p>
              <a
                href="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Inicia sesión
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-gray-800">
                  {c.authorName}{' '}
                  {c.authorRole ? (
                    <span className="text-sm text-gray-500">
                      (rol {c.authorRole})
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                {c.content}
              </p>

              {/* Respuestas */}
              <div className="mt-4 border-t border-gray-200 pt-3">
                <h4 className="font-medium text-gray-700">Respuestas</h4>
                <div className="mt-2 space-y-3">
                  {c.replies.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Aún no hay respuestas.
                    </p>
                  ) : (
                    c.replies.map((r) => (
                      <div
                        key={r.id}
                        className="border border-gray-100 bg-white p-3 rounded-md shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {r.authorName}{' '}
                            {r.authorRole ? (
                              <span className="text-sm text-gray-500">
                                (rol {r.authorRole})
                              </span>
                            ) : null}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{r.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Caja de respuesta */}
                {userCanInteract() && (
                  <div className="mt-3">
                    {replyingToId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                          placeholder="Escribe tu respuesta..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePostReply(c.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                          >
                            Enviar
                          </button>
                          <button
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText('');
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingToId(c.id)}
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        Responder
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

  return (
    <div className="topic-lesson-container">
      <div className="topic-lesson-wrapper">
        <TopicHeader title={mockTopic.title} lessonNumber={currentLesson} />

        <div
          className="topic-golden-layout-container"
          style={{
            marginTop: '1rem',
            height: '60vh',
            border: '1px solid #ccc',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            ref={containerRef}
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </div>

        <LessonNavigation
          currentLesson={currentLesson}
          totalLessons={10}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <div className="mt-10">
          <CommentSection topicId={mockTopic.id} />
        </div>

      </div>
    </div>
  );
}

