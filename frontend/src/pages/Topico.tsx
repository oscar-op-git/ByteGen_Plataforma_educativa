import { useState, useEffect } from 'react';
import type { Topic, ContentBlock, TopicVariant } from '../types/topic.types';
import TopicHeader from '../components/EncabezadoTopico';
import ContentBlockRenderer from '../components/BloqueRenderizador';
import CodeOutput from '../components/SalidaCodigo';
import PdfBlock from '../components/BloqueDiapositivas';
import LessonNavigation from '../components/BotonesNavegacion';
import '../styles/Topico.css';
import BloqueVideo from '../components/BloqueVideo';

// Tipo para Pyodide
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<string>;
}

// Declaración de tipo para pyodide
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export default function TopicLesson() {
  const [topic] = useState<Topic>({
    id: '1',
    title: 'Introducción a Python',
    blocks: [
      {
        id: '8',
        type: 'slides',
        content: `{
        "pdfUrl": "../../public/documentos/1P_Tema 1-1.pdf",
        "totalPages": 18,
        "startPage": 1,
        "audioUrl": "../../public/documentos/KAL EL NO.mp3",
        "transcript": [
          { "start": 0,  "end": 8,  "text": "Bienvenido/a a la lección." },
          { "start": 8,  "end": 20, "text": "Python es legible, versátil y tiene una comunidad enorme." },
          { "start": 20, "end": 35, "text": "Revisaremos tipos de datos básicos y cómo ejecutar código." }
          ]
        }`,
      },
      /*{
        id: '9',
        type: 'video',
        content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },*/
    ],
  });

  // --- Determinar variante del tópico ---
  const variant: TopicVariant =
  topic.variant
    ? topic.variant
    : topic.blocks.some(b => b.type === 'slides')
      ? 'slides'
      : topic.blocks.some(b => b.type === 'video')
        ? 'video'
        : 'basic';
  //cargar pyodide solo si es tipo basico
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [currentLesson, setCurrentLesson] = useState(1);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Cargar Pyodide al montar el componente si es basicoc
  useEffect(() => {
    if (variant !== 'basic') return;

    const loadPyodideInstance = async () => {
      try {
        setCodeOutput('⏳ Cargando intérprete de Python...');
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });
        setPyodide(pyodideInstance);
        setCodeOutput('✓ Intérprete de Python listo. Ejecuta un bloque de código para comenzar.');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setCodeOutput(`✗ Error al cargar Python: ${errorMessage}`);
      }
    };

    loadPyodideInstance();
  }, []);

  const handleExecuteCode = async (code: string) => {
    if (!pyodide || isExecuting) return;

    setIsExecuting(true);
    setCodeOutput('⏳ Ejecutando código...');

    try {
      // Capturar stdout
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
`);

      // Ejecutar el código del usuario
      await pyodide.runPythonAsync(code);

      // Obtener la salida
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      
      if (stdout) {
        setCodeOutput(`✓ Código ejecutado correctamente\n\n${stdout}`);
      } else {
        setCodeOutput('✓ Código ejecutado correctamente\n\n(Sin salida)');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setCodeOutput(`✗ Error de Python:\n\n${errorMessage}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePrevious = () => {
    if (currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const handleNext = () => {
    if (currentLesson < 10) {
      setCurrentLesson(currentLesson + 1);
    }
  };
  //renderizado basico
  const renderBasic = (blocks: ContentBlock[]) => {
    const onlyBasicBlocks = blocks.filter(b => b.type !== 'slides');
    return (
      <>
        <TopicHeader title={topic.title} lessonNumber={currentLesson} />
        <div className="topic-lesson-grid">
          <div className="content-blocks">
            {onlyBasicBlocks.map((block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
                onExecuteCode={(code) => handleExecuteCode(code)}
                isExecuting={isExecuting}
              />
            ))}
          </div>
          <div className="output-sidebar">
            <CodeOutput output={codeOutput} />
          </div>
        </div>
        <LessonNavigation
          currentLesson={currentLesson}
          totalLessons={10}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </>
    );
  };

  //renderizado slides
  const renderSlides = (blocks: ContentBlock[]) => {
    const slidesBlock = blocks.find(b => b.type === 'slides');
    interface SlidesPayload {
      pdfUrl: string;
      totalPages: number;
      startPage: number;
      audioUrl: string;
      transcript: { start: number; end: number; text: string }[];
    }

    let payload: SlidesPayload | null = null;
    try {
      payload = slidesBlock ? (JSON.parse(slidesBlock.content) as SlidesPayload) : null;
    } catch {
      payload = null;
    }

    return (
      <>
        <TopicHeader title={topic.title} lessonNumber={currentLesson} />
        {payload ? (
          <PdfBlock content={JSON.stringify(payload)} />
        ) : (
          <p>No hay datos de diapositivas válidos.</p>
        )}
        <LessonNavigation
          currentLesson={currentLesson}
          totalLessons={10}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </>
    );
  };

  const renderVideo = (blocks: ContentBlock[]) => {
    const videoBlock = blocks.find((b) => b.type === 'video')
    const urlOrId = videoBlock?.content ?? ''
    return (
      <>
        <TopicHeader title={topic.title} lessonNumber={currentLesson} />
        {urlOrId ? (
          <BloqueVideo urlOrId={urlOrId} title={topic.title} />
        ) : (
          <p>No hay URL o ID de YouTube.</p>
        )}
        <LessonNavigation
          currentLesson={currentLesson}
          totalLessons={10}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </>
    )
  }

  return (
    <div className="topic-lesson-container">
      <div className="topic-lesson-wrapper">
        {variant === 'basic'
          ? renderBasic(topic.blocks)
          : variant === 'slides'
            ? renderSlides(topic.blocks)
            : renderVideo(topic.blocks)}
      </div>
    </div>
  );
}