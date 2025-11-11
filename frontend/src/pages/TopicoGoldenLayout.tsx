import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  GoldenLayout,
  type LayoutConfig,
  type ComponentContainer,
  type JsonValue,
} from 'golden-layout';

import type { Topic } from '../types/topic.types';

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
      </div>
    </div>
  );
}

