// src/components/CoursesGrid.tsx
import React from 'react'
import CustomButton from './CustomBotton'
import '../styles/Home.css'


type Course = { id: string; title: string; teacher: string; hidden?: boolean }


type CoursesGridProps = {
  courses: Course[];
  showHidden?: boolean;
  onToggleShowHidden?: () => void;
  onEnter: (id: string) => void;
  onToggleHidden?: (id: string) => void;
  onUseTemplate?: (id: string) => void; // <<-- NUEVO: para docente ejecutor
};

const CoursesGrid: React.FC<CoursesGridProps> = ({
  courses,
  showHidden = false,
  onToggleShowHidden,
  onEnter,
  onToggleHidden,
  onUseTemplate,
}) => {
  // Filtramos según el flag showHidden
  const visibleCourses = courses.filter((c) => {
    if (showHidden) return true;
    return !c.hidden; // si está oculto y showHidden = false, no lo mostramos
  });

  return (
    <>
      <div>
        {/* Botón para mostrar/ocultar borradores SOLO si nos pasan la función */}
        {onToggleShowHidden && (
          <div style={{ marginBottom: 12 }}>
            <CustomButton
              label={showHidden ? 'Ocultar borradores' : 'Mostrar borradores'}
              onClick={onToggleShowHidden}
              fullWidth={false}
            />
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {visibleCourses.map((course) => (
            <div
              key={course.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{course.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
                  Docente: {course.teacher}
                </p>
                {course.hidden && (
                  <span
                    style={{
                      marginTop: 4,
                      display: 'inline-block',
                      fontSize: 12,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: '#f0ad4e',
                      color: '#fff',
                    }}
                  >
                    Borrador
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {/* Botón común: entrar al bloque/plantilla */}
                <CustomButton
                  label="Entrar"
                  onClick={() => onEnter(course.id)}
                  fullWidth={false}
                />

                {/* Solo admin/editor (cuando onToggleHidden existe) puede cambiar borrador/publicado */}
                {onToggleHidden && (
                  <CustomButton
                    label={course.hidden ? 'Marcar como publicado' : 'Marcar como borrador'}
                    onClick={() => onToggleHidden(course.id)}
                    fullWidth={false}
                  />
                )}

                {/* Solo docente ejecutor (cuando onUseTemplate existe) ve este botón */}
                {onUseTemplate && (
                  <CustomButton
                    label="Usar plantilla"
                    onClick={() => onUseTemplate(course.id)}
                    fullWidth={false}
                  />
                )}
              </div>
            </div>
          ))}

          {visibleCourses.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#777' }}>
              No hay plantillas para mostrar.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default CoursesGrid
