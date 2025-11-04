import { useState, useEffect } from 'react';
import type { Topic } from '../types/topic.types';
import TopicHeader from '../components/EncabezadoTopico';
import ContentBlockRenderer from '../components/BloqueRenderizador';
import CodeOutput from '../components/SalidaCodigo';
import LessonNavigation from '../components/BotonesNavegacion';
import '../styles/Topico.css';

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
        id: '1',
        type: 'text',
        content: 'Python es un lenguaje de programación de alto nivel, interpretado y de propósito general. Es conocido por su sintaxis clara y legible, lo que lo hace ideal para principiantes.'
      },
      {
        id: '2',
        type: 'code',
        content: `# Mi primer programa en Python
print("¡Hola Mundo!")
print("Python es genial")

# Variables
nombre = "Estudiante"
print(f"Bienvenido, {nombre}!")`,
        language: 'python'
      },
      {
        id: '3',
        type: 'text',
        content: 'Python usa indentación para definir bloques de código. Esto hace que el código sea más legible y limpio.'
      },
      {
        id: '4',
        type: 'code',
        content: `# Estructuras de control
for i in range(5):
    print(f"Número: {i}")

# Condicionales
edad = 18
if edad >= 18:
    print("Eres mayor de edad")
else:
    print("Eres menor de edad")`,
        language: 'python'
      }
    ]
  });

  const [codeOutput, setCodeOutput] = useState<string>('');
  const [currentLesson, setCurrentLesson] = useState(1);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Cargar Pyodide al montar el componente
  useEffect(() => {
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

  return (
    <div className="topic-lesson-container">
      <div className="topic-lesson-wrapper">
        <TopicHeader title={topic.title} lessonNumber={currentLesson} />

        <div className="topic-lesson-grid">
          <div className="content-blocks">
            {topic.blocks.map((block) => (
              <ContentBlockRenderer
                key={block.id}
                block={block}
                onExecuteCode={handleExecuteCode}
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
      </div>
    </div>
  );
}