import { Play, Code } from 'lucide-react';
import '../styles/SalidaCodigo.css';

interface CodeOutputProps {
  output: string;
}

export default function CodeOutput({ output }: CodeOutputProps) {
  return (
    <div className="code-output">
      <div className="code-output-header">
        <h3 className="code-output-title">
          <Code className="icon" />
          Salida de Código
        </h3>
      </div>
      <div className="code-output-content">
        {output ? (
          <pre className="code-output-pre">{output}</pre>
        ) : (
          <div className="code-output-empty">
            <Play className="icon-large" />
            <p className="code-output-empty-text">
              Haz clic en "Ejecutar" en un bloque de código para ver el resultado aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
