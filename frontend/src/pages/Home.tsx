import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeBox from '../components/HomeBox';
import CustomButton from '../components/CustomBotton';
import CoursesGrid from '../components/CoursesGrid';
import JoinClassModal from '../components/JoinClassModal';
import HeaderHome from '../components/HeaderHome';
import FooterHome from '../components/FooterHome';
import { getSession, signout } from '../services/authService';
import { getPlantillas } from '../services/plantillaService.ts';
import '../styles/Home.css';
import toast from 'react-hot-toast';

type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  isAdmin: boolean;
  roleId: number | null;
  roleName: string | null;
};

type Course = {
  id: string;
  title: string;
  teacher: string;
  hidden?: boolean;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Ahora los cursos vienen de la tabla "plantilla"
  const [courses, setCourses] = useState<Course[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // 1) Obtener sesión
        const session = await getSession();
        if (!mounted) return;

        if (!session?.user) {
          navigate('/login');
          return;
        }
        setUser({
          id: session.user.id,
          name: session.user.name || session.user.email,
          email: session.user.email,
          verified: (session.user as any).verified ?? true,
          isAdmin: (session.user as any).isAdmin ?? false,
          roleId: (session.user as any).roleId ?? null,
          roleName: (session.user as any).roleName ?? null,
        });
        
        try {
        const plantillas = await getPlantillas(); // 👈 esto puede lanzar
        if (!mounted) return;

        const mapped: Course[] = plantillas.map((p: any) => ({
          id: String(p.id_plantilla),
          title: p.nombre || p.json?.title || `Plantilla #${p.id_plantilla}`,
          teacher: p.userName || 'Docente no asignado',
          hidden: p.es_borrador,
        }));

        setCourses(mapped);
      } catch (err: any) {
        console.error('Error al obtener plantillas:', err);
        if (mounted) {
          // ⚠️ IMPORTANTE: aquí YA NO mandamos a /login
          toast.error('No se pudieron cargar las plantillas');
        }
      }
      } catch (error) {
        console.error('Error inicializando Home:', error);
        if (mounted) {
          toast.error('Error al cargar datos iniciales');
          navigate('/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const onUserMenuAction = useCallback(async (a: 'perfil' | 'config' | 'ayuda' | 'salir') => {
    if (a === 'salir') {
      try {
        await signout();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        toast.error('No se pudo cerrar sesión');
      }
      return;
    }
    if (a === 'perfil') return navigate('/perfil');
    if (a === 'config') return toast('Configuración (pendiente)');
    if (a === 'ayuda') return toast('Ayuda (pendiente)');
  }, [navigate]);

  const onEnterCourse = useCallback((id: string) => {
    toast(`Entrando al bloque ${id}`);
    navigate(`/topic/layout/${id}`);
  }, [navigate]);

  const onToggleHidden = useCallback((id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c))
    );
    toast.success('Estado del bloque actualizado');
    // TODO backend: aquí iría un PATCH para persistir el borrador/publicado
  }, []);

  const onJoin = useCallback(async (code: string) => {
    setJoinOpen(false);
    toast.success(`Te uniste con el código: ${code}`);
    // TODO backend:
    //  - Validar el código
    //  - Asociar al estudiante al curso
  }, []);

  const onUseTemplate = useCallback(
    (templateId: string) => {
      toast.success(`Usando plantilla ${templateId} para crear tu aula (pendiente backend)`);

      // TODO backend:
      //  - POST /aulas (o similar) con:
      //      * id_plantilla = templateId
      //      * id_usuario = user.id (ejecutor actual)
      //  - El backend crea el curso/aula
      //  - Opcional: devolver id del curso creado y navegar directamente:
      //      navigate(`/topic/layout/${nuevoIdCurso}`);
    },
    []
  );

  const onToggleShowHidden = useCallback(() => {
    setShowHidden((v) => !v);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const rawRole = (user.roleName || '').toLowerCase();

  const isAdmin = user.isAdmin || rawRole.includes('admin');
  const isEditor = rawRole.includes('editor');
  const isExecutor = rawRole.includes('ejecutor');
  const isStudent = rawRole.includes('estudiante') || (!isAdmin && !isEditor && !isExecutor);

  // Lo que mostramos en pantalla (igual que antes, pero más robusto)
  const roleLabel =
    user.roleName ??
    (isAdmin ? 'Administrador' : isEditor ? 'Docente editor' : isExecutor ? 'Docente ejecutor' : 'Estudiante');

  

  return (
    <>
      <HeaderHome
        isLoggedIn={true}
        userName={user.name}
        onGoHome={() => navigate('/home')}
        onGoCursos={() => toast('Cursos (pendiente)')}
        onGoActividades={() => toast('Actividades (pendiente)')}
        onGoLogin={() => navigate('/login')}
        onOpenUserMenu={() => setUserMenuOpen((v) => !v)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        userMenuOpen={userMenuOpen}
        onUserMenuAction={onUserMenuAction}
        isAdmin={user.isAdmin}
        onAssignRoles={() => navigate('/admin/roles')}
      />

      <div className="home-page">
        <HomeBox className="home-box">
          <h1 className="project-name">Bienvenido, {user.name}</h1>

          <p style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
            Rol actual:&nbsp;
            <strong>{roleLabel}</strong>
          </p>

          {/* 🎯 REGLA: SOLO EL ESTUDIANTE PUEDE UNIRSE POR CÓDIGO */}
          {isStudent && (
            <div style={{ marginTop: 16 }}>
              <CustomButton
                label="Unirse a clase"
                onClick={() => setJoinOpen(true)}
                fullWidth={false}
              />
            </div>
          )}

          {/* 🎯 REGLA:
              - Admin / Docente editor / Docente ejecutor ven las plantillas (bloques)
              - El estudiante NO ve estas plantillas, solo se une por código */}
          {(isAdmin || isEditor || isExecutor) && (
            <div style={{ marginTop: 24 }}>
              <h2>Plantillas disponibles</h2>
              <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                Estas plantillas provienen de la tabla <code>plantilla</code>.{' '}
                El administrador y el docente editor pueden gestionar su estado;
                el docente ejecutor puede usarlas para crear aulas.
              </p>

              <CoursesGrid
                courses={courses}
                // Admin + Editor pueden mostrar/ocultar borradores
                showHidden={showHidden}
                onToggleShowHidden={
                  isAdmin || isEditor ? onToggleShowHidden : undefined
                }
                onEnter={onEnterCourse}
                // Admin + Editor pueden cambiar borrador/publicado
                onToggleHidden={isAdmin || isEditor ? onToggleHidden : undefined}
                // Docente ejecutor: solo esta acción extra
                onUseTemplate={isExecutor ? onUseTemplate : undefined}
              />
            </div>
          )}

          {/* Mensaje para estudiante si no hay más info de cursos todavía */}
          {isStudent && (
            <p style={{ marginTop: 24, fontSize: 13, color: '#777' }}>
              Para ver tus clases, primero debes unirte con un código proporcionado por tu docente.
              {/* TODO backend: aquí se listarán los cursos del estudiante cuando tengas ese endpoint. */}
            </p>
          )}
        </HomeBox>
      </div>

      <JoinClassModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={onJoin}
      />

      <FooterHome />
    </>
  );
};

export default Home;
