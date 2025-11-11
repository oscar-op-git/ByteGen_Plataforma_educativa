import '../styles/BotonesNavegacion.css';

interface LessonNavigationProps {
  currentLesson: number;
  totalLessons: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function LessonNavigation({ 
  currentLesson, 
  totalLessons, 
  onPrevious, 
  onNext 
}: LessonNavigationProps) {
  return (
    <div className="lesson-navigation">
      <button 
        onClick={onPrevious}
        disabled={currentLesson === 1}
        className="nav-button nav-button-prev"
      >
        ← Anterior
      </button>
      <span className="lesson-counter">
        Lección {currentLesson} de {totalLessons}
      </span>
      <button 
        onClick={onNext}
        disabled={currentLesson === totalLessons}
        className="nav-button nav-button-next"
      >
        Siguiente →
      </button>
    </div>
  );
}