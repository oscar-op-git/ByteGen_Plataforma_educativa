import type { ContentBlock } from '../types/topic.types';
import TextBlock from './BloqueTexto';
import CodeBlock from './BloqueCodigo';
import ImageBlock from './BloqueImagen';
import PdfBlock from './BloqueDiapositivas';
interface ContentBlockRendererProps {
  block: ContentBlock;
  onExecuteCode: (code: string, blockId: string) => void;
  isExecuting?: boolean;
}

export default function ContentBlockRenderer({ block, onExecuteCode, isExecuting }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content} />;
    case 'code':
      return (
        <CodeBlock
          content={block.content}
          language={block.language}
          blockId={block.id}
          onExecute={onExecuteCode}
          isExecuting={isExecuting}
        />
      );
    case 'image':
      return <ImageBlock content={block.content} />;
    case 'slides':
      return <PdfBlock content={block.content} />;
    default:
      return null;
  }
}