import { Image } from 'lucide-react';
import '../styles/BloqueImagen.css';

interface ImageBlockProps {
  content: string;
}

export default function ImageBlock({ content }: ImageBlockProps) {
  return (
    <div className="image-block">
      <div className="image-block-header">
        <Image className="icon" />
        <span className="image-block-label">Imagen</span>
      </div>
      <img
        src={content}
        alt="Contenido visual"
        className="image-block-img"
      />
    </div>
  );
}
