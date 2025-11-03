// src/components/CoursesGrid.tsx
import React from 'react'
import CourseCard from './CourseCard'
import CustomButton from './CustomBotton'

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
  const visible = showHidden ? courses : courses.filter(c => !c.hidden)
  return (
    <>
      <div className="courses-grid">
        {visible.map(c => (
          <CourseCard key={c.id} course={c} onEnter={onEnter} onToggleHidden={onToggleHidden}/>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
        <CustomButton
          label={showHidden ? 'Ocultar los ocultos' : 'Ver ocultos'}
          onClick={onToggleShowHidden}
          fullWidth={false}
        />
      </div>
    </>
  )
}

export default CoursesGrid
