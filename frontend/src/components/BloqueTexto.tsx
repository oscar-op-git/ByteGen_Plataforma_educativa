import { FileText } from 'lucide-react';
import '../styles/BloqueTexto.css';

interface TextBlockProps {
  content: string;
}

export default function TextBlock({ content }: TextBlockProps) {
  return (
    <div className="text-block">
      <div className="text-block-header">
        <FileText className="icon" />
        <span className="text-block-label">Texto</span>
      </div>
      <p className="text-block-content">{content}</p>
    </div>
  );
}