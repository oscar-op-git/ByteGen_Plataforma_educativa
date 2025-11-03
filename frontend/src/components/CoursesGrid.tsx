// src/components/CoursesGrid.tsx
import React from 'react'
import CourseCard from './CourseCard'
import CustomButton from './CustomBotton'
import '../styles/Home.css'


type Course = { id: string; title: string; teacher: string; hidden?: boolean }

type Props = {
  courses: Course[]
  showHidden: boolean
  onToggleShowHidden: () => void
  onEnter: (id: string) => void
  onToggleHidden: (id: string) => void
}

const CoursesGrid: React.FC<Props> = ({
  courses, showHidden, onToggleShowHidden, onEnter, onToggleHidden
}) => {
  const visibles = courses.filter(c => !c.hidden)
  const ocultos  = courses.filter(c => c.hidden)
  

  return (
    <>
      {/* grilla de visibles */}
      <div className="courses-grid">
        {visibles.map(c => (
          <CourseCard key={c.id} course={c} onEnter={onEnter} onToggleHidden={onToggleHidden}/>
        ))}
      </div>

      {/* botón de ver/ocultar “ocultos” */}
      <div className="home-toggle-hidden">
        <CustomButton
          label={showHidden ? 'Ocultar los ocultos' : `Ver ocultos (${ocultos.length})`}
          onClick={onToggleShowHidden}
          fullWidth={false}
        />
      </div>

      {/* sección aparte para los ocultos, debajo del botón */}
      {showHidden && ocultos.length > 0 && (
        <div className="courses-hidden-section">
          <div className="courses-hidden-title">Ocultos</div>
          <div className="courses-grid">
            {ocultos.map(c => (
              <CourseCard key={c.id} course={c} onEnter={onEnter} onToggleHidden={onToggleHidden}/>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default CoursesGrid
