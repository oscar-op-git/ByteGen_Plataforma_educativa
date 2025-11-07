import '../styles/EncabezadoTopico.css';

interface TopicHeaderProps {
  title: string;
  lessonNumber?: number;
  duration?: string;
}

export default function TopicHeader({ title, lessonNumber = 1, duration = '15 minutos' }: TopicHeaderProps) {
  return (
    <div className="topic-header">
      <h1 className="topic-title">{title}</h1>
      <div className="topic-meta">
        <span className="topic-badge">Lección {lessonNumber}</span>
        <span className="topic-separator">•</span>
        <span className="topic-duration">{duration}</span>
      </div>
    </div>
  );
}