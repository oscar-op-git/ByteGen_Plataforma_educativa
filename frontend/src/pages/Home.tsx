import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeBox from '../components/HomeBox';
import CustomButton from '../components/CustomBotton';
import RoleBadge from '../components/RoleBadge';
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
  const [roleView, setRoleView] = useState<1 | 2 | 3>(2);
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

        setRoleView((session.user as any).isAdmin ? 1 : 2);

        // 2) Obtener plantillas del backend y mapearlas a "courses"
        const plantillas = await getPlantillas();
        if (!mounted) return;

        const mapped: Course[] = plantillas.map((p: any) => ({
          id: String(p.id_plantilla),
          title: p.nombre || p.json?.title || `Plantilla #${p.id_plantilla}`,
          teacher: p.userName || 'Docente no asignado',
          hidden: p.es_borrador, // puedes ajustar esta lógica si quieres
        }));

        setCourses(mapped);
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
    // Si quieres persistir este cambio, aquí iría un PATCH al backend
  }, []);

  const onJoin = useCallback(async (code: string) => {
    setJoinOpen(false);
    toast.success(`Te uniste con el código: ${code}`);
    // TODO: Implementar lógica real
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const roleLabel =
    user.roleName ??
    (user.isAdmin ? 'Administrador' : 'Sin rol asignado');

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
          
          <div className="home-role-wrap">
            <RoleBadge
              role={roleView}
              onChangeRoleView={setRoleView}
              allowAdminSwitch={false}
              isAdminNow={roleView === 1}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <CustomButton 
              label="Unirse a clase" 
              onClick={() => setJoinOpen(true)} 
              fullWidth={false} 
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <CoursesGrid
              courses={courses}
              showHidden={showHidden}
              onToggleShowHidden={() => setShowHidden((v) => !v)}
              onEnter={onEnterCourse}
              onToggleHidden={onToggleHidden}
            />
          </div>
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
