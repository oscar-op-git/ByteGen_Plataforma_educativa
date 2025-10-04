import { useState } from 'react';
import { Play, Code, Loader2 } from 'lucide-react';
import '../styles/BloqueCodigo.css';

interface CodeBlockProps {
  content: string;
  language?: string;
  blockId: string;
  onExecute: (code: string, blockId: string) => void;
  isExecuting?: boolean;
}

export default function CodeBlock({ content, blockId, onExecute, isExecuting = false }: CodeBlockProps) {
  const [localCode, setLocalCode] = useState(content);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-block-header-left">
          <Code className="icon" />
          <span className="code-block-label">
            Código Python
          </span>
        </div>
        <button
          onClick={() => onExecute(localCode, blockId)}
          className="execute-button"
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="icon-small spinning" />
              Ejecutando...
            </>
          ) : (
            <>
              <Play className="icon-small" />
              Ejecutar
            </>
          )}
        </button>
      </div>
      <textarea
        value={localCode}
        onChange={(e) => setLocalCode(e.target.value)}
        className="code-block-textarea"
        spellCheck={false}
      />
    </div>
  );
}
