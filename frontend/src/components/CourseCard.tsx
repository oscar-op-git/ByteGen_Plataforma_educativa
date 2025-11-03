import React from 'react'
import CustomButton from './CustomBotton'
import '../styles/Home.css' // usa clases de card

type Course = { id: string; title: string; teacher: string; hidden?: boolean }

type Props = {
  course: Course
  onEnter: (id: string) => void
  onToggleHidden: (id: string) => void
}

const CourseCard: React.FC<Props> = ({ course, onEnter, onToggleHidden }) => {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div className="course-card">
      <div className="course-card__menu">
        <CustomButton label="⋮" onClick={() => setMenuOpen(v=>!v)} fullWidth={false} />
        {menuOpen && (
          <div className="user-menu__dropdown" style={{ right: 0, top: '32px' }}>
            <button className="user-menu__item" onClick={() => { onToggleHidden(course.id); setMenuOpen(false) }}>
              {course.hidden ? 'Desocultar' : 'Ocultar'}
            </button>
          </div>
        )}
      </div>

      <div className="course-card__title">{course.title}</div>
      <div className="course-card__teacher">Docente: {course.teacher}</div>

      <CustomButton label="Entrar" onClick={() => onEnter(course.id)} />
    </div>
  )
}

export default CourseCard
