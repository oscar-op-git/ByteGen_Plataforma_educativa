import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  GoldenLayout,
  type LayoutConfig,
  type ComponentContainer,
  type JsonValue,
} from 'golden-layout';

import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import type { Topic } from '../types/topic.types';
import { getPlantillas } from '../services/plantillaService';

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


// -----------------------------
//   Componente principal viewer
// -----------------------------

export default function TopicoGoldenLayout() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { plantillaId } = useParams<{ plantillaId?: string }>();

  const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(true);

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

  // Cargar tópico desde la tabla plantilla
  useEffect(() => {
    let mounted = true;

    async function loadTopic() {
      try {
        setLoadingTopic(true);
        const plantillas = await getPlantillas();

        if (!mounted) return;

        const idNum = plantillaId ? Number(plantillaId) : NaN;
        const selected =
          plantillas.find((p: any) => p.id_plantilla === idNum) ??
          plantillas[0];

        if (!selected) {
          toast.error('No se encontró ninguna plantilla para este tópico');
          setTopic(null);
          return;
        }

        // Guardamos el id de la plantilla seleccionada (para el botón Editar)
        setSelectedPlantillaId(selected.id_plantilla);

        // Interpretamos plantilla.json como Topic
        let json = selected.json as any;
        if (!json || typeof json !== 'object') {
          json = {};
        }

        const topicFromJson: Topic = {
          id: String(json.id ?? selected.id_plantilla),
          title: json.title ?? selected.nombre ?? 'Tópico sin título',
          variant: json.variant ?? 'basic',
          blocks: Array.isArray(json.blocks) ? json.blocks : [],
        };

        if (!topicFromJson.blocks || topicFromJson.blocks.length === 0) {
          topicFromJson.blocks = [
            {
              id: 'fallback-1',
              type: 'text',
              content:
                'Esta plantilla no tiene bloques configurados aún.',
            },
          ];
        }

        setTopic(topicFromJson);
      } catch (error) {
        console.error('Error cargando plantilla para tópico:', error);
        toast.error('Error al cargar el tópico');
        setTopic(null);
      } finally {
        if (mounted) {
          setLoadingTopic(false);
        }
      }
    }

    loadTopic();

    return () => {
      mounted = false;
    };
  }, [plantillaId]);

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

  // Navegación de lecciones
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

  // Inicialización de Golden Layout (depende de que tengamos topic)
  useEffect(() => {
    if (!containerRef.current || !topic) return;

    const layout = new GoldenLayout(containerRef.current);

    const getBlock = (blockId: string) =>
      topic.blocks.find((b) => b.id === blockId);

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

    // 2) Bloque de código (con Pyodide integrado)
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
            await pyodide.runPythonAsync(
              `
import sys
from io import StringIO
sys.stdout = StringIO()
`,
            );

            await pyodide.runPythonAsync(code);
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

    // 3) Bloque de diapositivas
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
            title={topic.title || 'Video'}
          />,
        );

        container.on('destroy', () => {
          root.unmount();
        });
      },
    );

    // 5) Bloque de salida de código
    layout.registerComponentFactoryFunction(
      'output-block',
      (container: ComponentContainer) => {
        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

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

    // --- Construcción dinámica del layout según los bloques ---

    const textBlocks = topic.blocks.filter((b) => b.type === 'text');
    const codeBlock = topic.blocks.find((b) => b.type === 'code');
    const slidesBlock = topic.blocks.find((b) => b.type === 'slides');
    const videoBlock = topic.blocks.find((b) => b.type === 'video');

    const firstBlockId = (topic.blocks[0] && topic.blocks[0].id) || 'fallback-1';

    // Left column: textos (uno o varios) + código/salida
    const leftColumnContent: any[] = [];

    if (textBlocks.length > 0) {
      // Stack de todas las ventanas de texto como tabs
      leftColumnContent.push({
        type: 'stack',
        content: textBlocks.map((b, index) => ({
          type: 'component',
          componentType: 'text-block',
          title: b.id || `Texto ${index + 1}`,
          componentState: { blockId: b.id },
        })),
      });
    } else {
      // Fallback a un solo text-block
      leftColumnContent.push({
        type: 'component',
        componentType: 'text-block',
        title: 'Teoría',
        componentState: { blockId: firstBlockId },
      });
    }

    // Stack de código + salida de código
    leftColumnContent.push({
      type: 'stack',
      content: [
        ...(codeBlock
          ? [
              {
                type: 'component',
                componentType: 'code-block',
                title: 'Código',
                componentState: { blockId: codeBlock.id },
              } as const,
            ]
          : []),
        {
          type: 'component',
          componentType: 'output-block',
          title: 'Salida de código',
          componentState: {},
        },
      ],
    });

    // Right column: slides y/o video
    const rightStackContent: any[] = [];

    if (slidesBlock) {
      rightStackContent.push({
        type: 'component',
        componentType: 'slides-block',
        title: 'Diapositivas',
        componentState: { blockId: slidesBlock.id },
      });
    }

    if (videoBlock) {
      rightStackContent.push({
        type: 'component',
        componentType: 'video-block',
        title: 'Video',
        componentState: { blockId: videoBlock.id },
      });
    }

    const layoutConfig: LayoutConfig = {
      root: {
        type: 'column',
        content: [
          {
            type: 'row',
            content: [
              {
                type: 'column',
                content: leftColumnContent,
              },
              {
                type: 'stack',
                content: rightStackContent,
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
  }, [topic, updateOutput]);

  if (loadingTopic) {
    return (
      <div className="topic-lesson-container">
        <div className="topic-lesson-wrapper">
          <p>Cargando tópico...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-lesson-container">
        <div className="topic-lesson-wrapper">
          <p>No se pudo cargar el tópico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-lesson-container">
      <div className="topic-lesson-wrapper">
        <div className="flex items-center justify-between mb-2">
          <TopicHeader title={topic.title} lessonNumber={currentLesson} />

          {selectedPlantillaId && (
            <button
              type="button"
              onClick={() => navigate(`/topic/editor/${selectedPlantillaId}`)}
              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Editar plantilla
            </button>
          )}
        </div>

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
