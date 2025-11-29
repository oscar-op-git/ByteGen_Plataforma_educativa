import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  GoldenLayout,
  type LayoutConfig,
  type ComponentContainer,
  type JsonValue,
} from 'golden-layout';

import { DndContext, type DragEndEvent, useDroppable, useDraggable } from '@dnd-kit/core';

import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import CodeBlock from '../components/BloqueCodigo';
import PdfBlock from '../components/BloqueDiapositivas';
import VideoBlock from '../components/BloqueVideo';
import TopicHeader from '../components/EncabezadoTopico';
import CodeOutput from '../components/SalidaCodigo';
import LessonNavigation from '../components/BotonesNavegacion';

import type { Topic, ContentBlock } from '../types/topic.types';

import '../styles/Topico.css';
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-light-theme.css';

// ---------------- Config API ----------------
const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ---------------- Tipos base ----------------

type PanelType = 'text' | 'code' | 'slides' | 'video' | 'output';

interface PanelSettings {
  textContent?: string;
  codeContent?: string;
  pdfUrl?: string;
  videoUrl?: string;
}

interface EditorPanel {
  id: string;
  title: string;
  type: PanelType | null; // tipo de recurso asignado (vacío al inicio)
  settings: PanelSettings;
}

type PanelState = {
  panelId: string;
};

function asPanelState(state: JsonValue | undefined): PanelState | undefined {
  if (
    !state ||
    typeof state !== 'object' ||
    Array.isArray(state) ||
    state === null
  ) {
    return undefined;
  }

  const candidate = state as { panelId?: unknown };

  if (typeof candidate.panelId === 'string') {
    return { panelId: candidate.panelId };
  }

  return undefined;
}

// Recursos “tipo” que el docente puede arrastrar
const RESOURCE_TYPES: { id: PanelType; label: string }[] = [
  { id: 'text', label: 'Texto' },
  { id: 'code', label: 'Código' },
  { id: 'slides', label: 'Diapositivas' },
  { id: 'video', label: 'Video' },
  { id: 'output', label: 'Salida de código' },
];

// ---------------- Pyodide ----------------

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<string>;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

// ---------------- Componentes auxiliares (DnD) ----------------

type DraggableResourceProps = {
  id: string;
  label: string;
};

function DraggableResource({ id, label }: DraggableResourceProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
        position: 'relative',
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-move rounded border bg-slate-50 px-2 py-1 text-xs hover:bg-slate-100"
    >
      {label}
    </div>
  );
}

type EditorResourceListProps = {
  onInfoClick?: () => void;
};

function EditorResourceList({ onInfoClick }: EditorResourceListProps) {
  return (
    <div className="flex flex-col gap-2 rounded border bg-white p-2">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tipos de recurso</h3>
        {onInfoClick && (
          <button
            type="button"
            onClick={onInfoClick}
            className="text-[11px] text-blue-600 underline"
          >
            Ayuda
          </button>
        )}
      </div>
      {RESOURCE_TYPES.map((res) => (
        <DraggableResource
          key={res.id}
          id={`res-${res.id}`}
          label={res.label}
        />
      ))}
      <p className="mt-1 text-[11px] text-slate-500">
        Arrastra un tipo de recurso y suéltalo sobre una ventana para asignarlo.
      </p>
    </div>
  );
}

type PanelListProps = {
  panels: EditorPanel[];
  onTitleChange: (panelId: string, newTitle: string) => void;
};

function PanelListEditor({ panels, onTitleChange }: PanelListProps) {
  return (
    <div className="flex flex-col gap-2 rounded border bg-white p-2">
      <h3 className="mb-1 text-sm font-semibold">Ventanas del layout</h3>
      {panels.map((panel) => (
        <PanelCard
          key={panel.id}
          panel={panel}
          onTitleChange={onTitleChange}
        />
      ))}
    </div>
  );
}

type PanelCardProps = {
  panel: EditorPanel;
  onTitleChange: (panelId: string, newTitle: string) => void;
};

function PanelCard({ panel, onTitleChange }: PanelCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: panel.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(panel.id, e.target.value);
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded border p-2 text-xs ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <div className="mb-1 text-[11px] font-semibold text-slate-700">
        Ventana
      </div>
      <input
        type="text"
        value={panel.title}
        onChange={handleChange}
        placeholder="Nombre de la ventana..."
        className="w-full rounded border px-1 py-[2px] text-[11px]"
      />
      <div className="mt-1 text-[11px] text-slate-700">
        {panel.type ? (
          <>Tipo asignado: {panel.type}</>
        ) : (
          <>Sin tipo de recurso. Arrastra uno desde la lista de recursos.</>
        )}
      </div>
    </div>
  );
}

// ---------------- Helpers Topic <-> Panels ----------------

function buildTopicFromPanels(
  panels: EditorPanel[],
  title: string,
): Topic {
  const blocks: ContentBlock[] = panels
    .filter((p) => p.type && p.type !== 'output') // ignoramos paneles solo de salida
    .map((p) => {
      if (p.type === 'text') {
        return {
          id: p.id,
          type: 'text' as const,
          content: p.settings.textContent ?? '',
        };
      }
      if (p.type === 'code') {
        return {
          id: p.id,
          type: 'code' as const,
          content: p.settings.codeContent ?? '',
          language: 'python',
        };
      }
      if (p.type === 'slides') {
        return {
          id: p.id,
          type: 'slides' as const,
          content: JSON.stringify({
            pdfUrl: p.settings.pdfUrl ?? '',
          }),
        };
      }
      if (p.type === 'video') {
        return {
          id: p.id,
          type: 'video' as const,
          content: p.settings.videoUrl ?? '',
        };
      }
      // fallback
      return {
        id: p.id,
        type: 'text' as const,
        content: '',
      };
    });

  return {
    id: 'topic-1',             // el backend no usa este id para la BD
    title: title || 'Tópico sin título',
    variant: 'basic',          // podrías inferirla según tipos de bloque
    blocks,
  };
}

function buildPanelsFromTopic(topic: Topic): EditorPanel[] {
  if (!topic.blocks || topic.blocks.length === 0) {
    return [
      {
        id: 'panel-1',
        title: '',
        type: null,
        settings: {},
      },
    ];
  }

  return topic.blocks.map((b, index) => {
    const base: EditorPanel = {
      id: b.id ?? `panel-${index + 1}`,
      title: b.type === 'text'
        ? `Texto ${index + 1}`
        : b.type === 'code'
        ? `Código ${index + 1}`
        : b.type === 'slides'
        ? `Diapositivas ${index + 1}`
        : b.type === 'video'
        ? `Video ${index + 1}`
        : `Bloque ${index + 1}`,
      type: b.type as PanelType,
      settings: {},
    };

    if (b.type === 'text') {
      base.settings.textContent = b.content ?? '';
    } else if (b.type === 'code') {
      base.settings.codeContent = b.content ?? '';
    } else if (b.type === 'slides') {
      try {
        const parsed = JSON.parse(b.content ?? '{}');
        base.settings.pdfUrl = parsed.pdfUrl ?? '';
      } catch {
        base.settings.pdfUrl = '';
      }
    } else if (b.type === 'video') {
      base.settings.videoUrl = b.content ?? '';
    }

    return base;
  });
}

// ---------------- Componente principal: modo editor ----------------

export default function TopicoEditorLayout() {
  const { plantillaId } = useParams<{ plantillaId?: string }>();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const goldenLayoutRef = useRef<GoldenLayout | null>(null);

  // Estado de navegación
  const [currentLesson, setCurrentLesson] = useState(1);

  // Estado de "metadatos" de la plantilla/tópico
  const [plantillaName, setPlantillaName] = useState('');
  const [topicTitle, setTopicTitle] = useState('Tópico sin título');

  // Lista dinámica de paneles
  const [panels, setPanels] = useState<EditorPanel[]>([
    {
      id: 'panel-1',
      title: '',
      type: null,
      settings: {},
    },
  ]);

  // Ref para acceder a los paneles dentro de Golden Layout
  const panelsRef = useRef<EditorPanel[]>(panels);
  useEffect(() => {
    panelsRef.current = panels;
  }, [panels]);

  // Pyodide y salida de código
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const isExecutingRef = useRef(false);

  // Varios paneles pueden ser de tipo "output"
  const outputRootsRef = useRef<Root[]>([]);
  const outputMessageRef = useRef<string>('⏳ Cargando intérprete de Python...');

  const updateOutput = useCallback((msg: string) => {
    outputMessageRef.current = msg;
    const roots = outputRootsRef.current;
    roots.forEach((root) => {
      root.render(<CodeOutput output={msg} />);
    });
  }, []);

  // Cargar Pyodide
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

  // Si venimos con /topic/editor/:plantillaId, cargamos la plantilla existente
  useEffect(() => {
    if (!plantillaId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/plantillas/${plantillaId}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Error al cargar plantilla (${res.status})`);
        }

        const data = await res.json();

        const json = (data.json ?? {}) as any;

        const topic: Topic = {
          id: String(json.id ?? data.id_plantilla),
          title: json.title ?? data.nombre ?? 'Tópico sin título',
          variant: json.variant ?? 'basic',
          blocks: Array.isArray(json.blocks) ? json.blocks : [],
        };

        setPlantillaName(data.nombre ?? '');
        setTopicTitle(topic.title);
        setPanels(buildPanelsFromTopic(topic));
      } catch (err: any) {
        console.error('Error cargando plantilla en editor:', err);
        toast.error(err?.message || 'No se pudo cargar la plantilla');
      }
    })();
  }, [plantillaId]);

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

  // Añadir un nuevo panel vacío
  const handleAddPanel = () => {
    setPanels((prev) => {
      const nextIndex = prev.length + 1;
      return [
        ...prev,
        {
          id: `panel-${nextIndex}`,
          title: '',
          type: null,
          settings: {},
        },
      ];
    });
  };

  // Cambiar el nombre de un panel
  const handlePanelTitleChange = (panelId: string, newTitle: string) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === panelId ? { ...p, title: newTitle } : p,
      ),
    );
  };

  // DnD: asignar tipo de recurso a un panel
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id.toString(); // "res-text"
    const panelId = over.id.toString(); // "panel-1", "panel-2", etc.

    if (!draggedId.startsWith('res-')) return;

    const typeId = draggedId.replace('res-', '') as PanelType;

    setPanels((prev) =>
      prev.map((p) =>
        p.id === panelId ? { ...p, type: typeId } : p,
      ),
    );
  };

  // Construir LayoutConfig a partir de los paneles
  const buildLayoutConfig = useCallback(
    (currentPanels: EditorPanel[]): LayoutConfig => {
      const panelComponents = currentPanels.map((panel) => ({
        type: 'component' as const,
        componentType: 'panel',
        title: panel.title || 'Ventana sin título',
        componentState: { panelId: panel.id },
      }));

      return {
        root: {
          type: 'stack',
          content:
            panelComponents.length > 0
              ? panelComponents
              : [
                  {
                    type: 'component',
                    componentType: 'panel',
                    title: 'Sin ventanas',
                    componentState: { panelId: '' },
                  },
                ],
        },
      };
    },
    [],
  );

  // Inicializar Golden Layout una vez
  useEffect(() => {
    if (!containerRef.current) return;

    const layout = new GoldenLayout(containerRef.current);
    goldenLayoutRef.current = layout;

    // Componente genérico de panel
    layout.registerComponentFactoryFunction(
      'panel',
      (container: ComponentContainer, state: JsonValue | undefined) => {
        const panelState = asPanelState(state);
        const panel = panelState
          ? panelsRef.current.find((p) => p.id === panelState.panelId)
          : undefined;

        const host = document.createElement('div');
        container.element.append(host);
        const root = createRoot(host);

        if (!panel || !panel.type) {
          // Ventana sin tipo
          root.render(
            <div style={{ padding: 8, fontSize: 12 }}>
              Esta ventana aún no tiene tipo de recurso asignado.
              <br />
              Asigna un tipo desde la barra derecha.
            </div>,
          );
        } else if (panel.type === 'text') {
          // Editor de texto dentro de la ventana
          root.render(
            <div style={{ padding: 8, fontSize: 12, height: '100%' }}>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>
                Texto del panel
              </div>
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 120,
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder="Escribe el contenido de texto que verá el estudiante..."
                value={panel.settings.textContent ?? ''}
                onChange={(e) => {
                  const newText = e.target.value;
                  setPanels((prev) =>
                    prev.map((p) =>
                      p.id === panel.id
                        ? {
                            ...p,
                            settings: {
                              ...p.settings,
                              textContent: newText,
                            },
                          }
                        : p,
                    ),
                  );
                }}
              />
            </div>,
          );
        } else if (panel.type === 'code') {
          // Editor de código con Pyodide
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
                updateOutput(
                  `✓ Código ejecutado correctamente\n\n${stdout}`,
                );
              } else {
                updateOutput(
                  '✓ Código ejecutado correctamente\n\n(Sin salida)',
                );
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : 'Error desconocido';
              updateOutput(`✗ Error de Python:\n\n${errorMessage}`);
            } finally {
              isExecutingRef.current = false;
            }
          };

          root.render(
            <CodeBlock
              content={
                panel.settings.codeContent ??
                '# Escribe tu código aquí\nprint("Hola desde Python")'
              }
              language="python"
              blockId={panel.id}
              onExecute={executeCode}
              isExecuting={isExecutingRef.current}
            />,
          );
        } else if (panel.type === 'slides') {
          // Editor de slides: estilo "arrastrar o examinar archivos"
          root.render(
            <div style={{ padding: 8, fontSize: 12, height: '100%' }}>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>
                Diapositivas
              </div>
              <div
                style={{
                  border: '1px dashed #9ca3af',
                  borderRadius: 6,
                  padding: 12,
                  textAlign: 'center',
                  fontSize: 11,
                  marginBottom: 8,
                }}
              >
                <p style={{ marginBottom: 4 }}>
                  Arrastra un archivo PDF aquí o haz clic en “Examinar”.
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setPanels((prev) =>
                      prev.map((p) =>
                        p.id === panel.id
                          ? {
                              ...p,
                              settings: {
                                ...p.settings,
                                pdfUrl: url,
                              },
                            }
                          : p,
                      ),
                    );
                  }}
                />
                <p style={{ marginTop: 4, color: '#6b7280' }}>
                  (Por ahora el archivo solo vive en memoria. Más adelante,
                  con backend, se subirá al servidor.)
                </p>
              </div>

              {panel.settings.pdfUrl ? (
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: 'calc(100% - 110px)',
                  }}
                >
                  <PdfBlock
                    content={JSON.stringify({
                      pdfUrl: panel.settings.pdfUrl,
                    })}
                  />
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    textAlign: 'center',
                  }}
                >
                  Ningún PDF seleccionado todavía.
                </div>
              )}
            </div>,
          );
        } else if (panel.type === 'video') {
          // Editor de video: URL + vista previa
          root.render(
            <div style={{ padding: 8, fontSize: 12, height: '100%' }}>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>
                Video
              </div>
              <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                URL del video (YouTube, etc.)
              </label>
              <input
                type="text"
                placeholder="https://..."
                style={{
                  width: '100%',
                  borderRadius: 4,
                  border: '1px solid #d1d5db',
                  padding: '2px 4px',
                  fontSize: 11,
                  marginBottom: 8,
                }}
                value={panel.settings.videoUrl ?? ''}
                onChange={(e) => {
                  const url = e.target.value;
                  setPanels((prev) =>
                    prev.map((p) =>
                      p.id === panel.id
                        ? {
                            ...p,
                            settings: {
                              ...p.settings,
                              videoUrl: url,
                            },
                          }
                        : p,
                    ),
                  );
                }}
              />

              {panel.settings.videoUrl ? (
                <div
                  style={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: 'calc(100% - 70px)',
                  }}
                >
                  <VideoBlock
                    urlOrId={panel.settings.videoUrl}
                    title={panel.title || 'Video'}
                  />
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    textAlign: 'center',
                  }}
                >
                  Ninguna URL de video configurada todavía.
                </div>
              )}
            </div>,
          );
        } else if (panel.type === 'output') {
          // Panel de salida de código (como recurso)
          outputRootsRef.current.push(root);

          root.render(
            <CodeOutput output={outputMessageRef.current} />,
          );

          container.on('destroy', () => {
            root.unmount();
            outputRootsRef.current = outputRootsRef.current.filter(
              (r) => r !== root,
            );
          });

          return; // importante salir aquí para no registrar destroy dos veces
        }

        container.on('destroy', () => {
          root.unmount();
        });
      },
    );

    const initialConfig = buildLayoutConfig(panelsRef.current);
    layout.loadLayout(initialConfig);

    return () => {
      layout.destroy();
      goldenLayoutRef.current = null;
    };
  }, [buildLayoutConfig, updateOutput]);

  // Recargar layout cuando cambian los paneles
  useEffect(() => {
    const layout = goldenLayoutRef.current;
    if (!layout) return;

    const config = buildLayoutConfig(panels);
    layout.loadLayout(config);
  }, [panels, buildLayoutConfig]);

  // Guardar plantilla (crear o actualizar)
  const handleSavePlantilla = async () => {
    const topicJson = buildTopicFromPanels(panelsRef.current, topicTitle);

    const payload = {
      nombre: plantillaName || topicTitle || 'Plantilla sin nombre',
      es_borrador: false,
      json: topicJson,
    };

    const isEditing = Boolean(plantillaId);

    const url = isEditing
      ? `${API_BASE}/api/plantillas/${plantillaId}`
      : `${API_BASE}/api/plantillas`;

    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Error al guardar plantilla');
      }

      toast.success(isEditing ? 'Plantilla actualizada' : 'Plantilla creada');
    } catch (err: any) {
      console.error('Error guardando plantilla', err);
      toast.error(err?.message || 'No se pudo guardar la plantilla');
    }
  };

  return (
    <div className="topic-lesson-container">
      <div className="topic-lesson-wrapper">
        <TopicHeader
          title="Editor de layout de tópico"
          lessonNumber={currentLesson}
        />

        <DndContext onDragEnd={handleDragEnd}>
          <div className="mt-4 flex gap-4">
            {/* Preview (Golden Layout) */}
            <div
              className="flex-1 border bg-white"
              style={{ height: '60vh' }}
            >
              <div
                ref={containerRef}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Panel de edición */}
            <div className="flex w-80 flex-col gap-4">
              {/* Metadatos de la plantilla */}
              <div className="flex flex-col gap-2 rounded border bg-white p-2">
                <label className="text-[11px] font-semibold text-slate-700">
                  Nombre de la plantilla (para la BD / lista)
                </label>
                <input
                  type="text"
                  value={plantillaName}
                  onChange={(e) => setPlantillaName(e.target.value)}
                  placeholder="Ej: Tema 1 - Lectura introductoria"
                  className="w-full rounded border px-1 py-[4px] text-[12px]"
                />

                <label className="mt-2 text-[11px] font-semibold text-slate-700">
                  Título del tópico (lo que verá el estudiante)
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Ej: Introducción a Python"
                  className="w-full rounded border px-1 py-[4px] text-[12px]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPanel}
                className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                + Añadir ventana
              </button>

              <button
                type="button"
                onClick={handleSavePlantilla}
                className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                {plantillaId ? 'Guardar cambios en plantilla' : 'Guardar nueva plantilla'}
              </button>

              <EditorResourceList />

              <PanelListEditor
                panels={panels}
                onTitleChange={handlePanelTitleChange}
              />
            </div>
          </div>
        </DndContext>

        <div className="mt-4">
          <LessonNavigation
            currentLesson={currentLesson}
            totalLessons={10}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}
