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
  hidden?: boolean 
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleView, setRoleView] = useState<1 | 2 | 3>(2);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([
    { id: 'c1', title: 'Introducción a Python', teacher: 'Prof. Ramírez' },
    { id: 'c2', title: 'Primeros pasos de Python', teacher: 'Prof. Salinas' },
    { id: 'c3', title: 'JavaScript Básico', teacher: 'Prof. Vargas' },
    { id: 'c4', title: 'Nivel básico de Python', teacher: 'Prof. Quispe', hidden: true },
    { id: 'c5', title: 'React Avanzado', teacher: 'Prof. Cruz' },
    { id: 'c6', title: 'Curso básico de Python', teacher: 'Prof. Lara' },
  ]);
  const [showHidden, setShowHidden] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name || session.user.email,
            email: session.user.email,
            verified: session.user.verified ?? true,
            isAdmin: session.user.isAdmin ?? false,
            roleId: session.user.roleId ?? null,
            roleName: session.user.roleName ?? null,
          });
          
          // Establecer vista de rol
          setRoleView(session.user.isAdmin ? 1 : 2);
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        if (mounted) navigate('/login');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

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
    toast(`Entrando al curso ${id}`);
    navigate("/topic/layout");
  }, []);

  const onToggleHidden = useCallback((id: string) => {
    setCourses((prev) => 
      prev.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c))
    );
    toast.success('Estado del curso actualizado');
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
          
          {/* Badge de rol */}
          <div className="home-role-wrap">
            <RoleBadge
              role={roleView}
              onChangeRoleView={setRoleView}
              allowAdminSwitch={false}
              isAdminNow={roleView === 1}
            />
          </div>

          {/* Botón de unirse a clase */}
          <div style={{ marginTop: 16 }}>
            <CustomButton 
              label="Unirse a clase" 
              onClick={() => setJoinOpen(true)} 
              fullWidth={false} 
            />
          </div>

          {/* Grid de cursos */}
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