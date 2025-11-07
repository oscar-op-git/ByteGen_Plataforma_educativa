import React, { useEffect } from 'react';
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
};

type Course = { id: string; title: string; teacher: string; hidden?: boolean };

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [roleView, setRoleView] = React.useState<1 | 2 | 3>(2); // Default estudiante
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [courses, setCourses] = React.useState<Course[]>([
    { id: 'c1', title: 'Introduccion a python', teacher: 'Prof. Ramírez' },
    { id: 'c2', title: 'Primeros pasos de python', teacher: 'Prof. Salinas' },
    { id: 'c3', title: 'Introduccion a python', teacher: 'Prof. Vargas' },
    { id: 'c4', title: 'Nivel basico de python', teacher: 'Prof. Quispe', hidden: true },
    { id: 'c5', title: 'Introduccion a python', teacher: 'Prof. Cruz' },
    { id: 'c6', title: 'Curso basico de python', teacher: 'Prof. Lara' },
  ]);
  const [showHidden, setShowHidden] = React.useState(false);
  const [joinOpen, setJoinOpen] = React.useState(false);

  // ✅ Obtener sesión al cargar
  useEffect(() => {
    getSession()
      .then((session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name || session.user.email,
            email: session.user.email,
            verified: session.user.verified ?? true,
            isAdmin: session.user.isAdmin ?? false,
          });
          
          // Determinar rol (esto debería venir de la BD en id_role_role)
          // Por ahora, asumimos: isAdmin=true → rol 1, sino → rol 2
          setRoleView(session.user.isAdmin ? 1 : 2);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const onUserMenuAction = async (a: 'perfil' | 'config' | 'ayuda' | 'salir') => {
    if (a === 'salir') {
      try {
        await signout(`${window.location.origin}/login`);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        toast.error('No se pudo cerrar sesión');
      }
      return;
    }
    if (a === 'perfil') return navigate('/perfil');
    if (a === 'config') return toast('Configuración (pendiente)');
    if (a === 'ayuda') return toast('Ayuda (pendiente)');
  };

  const onEnterCourse = (id: string) => toast(`Entrar al curso ${id} (pendiente)`);
  
  const onToggleHidden = (id: string) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c)));
  };
  
  const onJoin = async (code: string) => {
    setJoinOpen(false);
    toast.success(`(fake) Te uniste con código ${code}`);
  };

  const renderRoleArea = () => (
    <div className="home-role-wrap">
      <RoleBadge
        role={roleView}
        onChangeRoleView={setRoleView}
        allowAdminSwitch={false}
        isAdminNow={roleView === 1}
      />
    </div>
  );

  const renderActionsByRole = () => {
    if (roleView === 2) {
      // Estudiante
      return (
        <>
          <div className="home-actions" style={{ justifyContent: 'flex-end' }}>
            <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false} />
          </div>
          <CoursesGrid
            courses={courses}
            showHidden={showHidden}
            onToggleShowHidden={() => setShowHidden((v) => !v)}
            onEnter={onEnterCourse}
            onToggleHidden={onToggleHidden}
          />
        </>
      );
    }
    if (roleView === 3) {
      // Docente
      return (
        <div className="home-actions">
          <CustomButton label="Editar curso" onClick={() => toast('Editar curso (pendiente)')} fullWidth={false} />
          <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false} />
        </div>
      );
    }
    // Admin
    return (
      <div className="home-actions">
        <CustomButton label="Editar curso" onClick={() => toast('Editar curso (pendiente)')} fullWidth={false} />
        <CustomButton label="Editar curso base" onClick={() => toast('Editar curso base (pendiente)')} fullWidth={false} />
        <CustomButton label="Unirse a clase" onClick={() => setJoinOpen(true)} fullWidth={false} />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
        isAdmin={roleView === 1}
        onAssignRoles={() => navigate('/admin/roles')}
      />

      <div className="home-page">
        <HomeBox className="home-box">
          <h1 className="project-name">Bienvenido, {user.name}</h1>
          {renderRoleArea()}
          <div style={{ marginTop: 16 }}>{renderActionsByRole()}</div>
        </HomeBox>
      </div>

      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={onJoin} />
      <FooterHome />
    </>
  );
};

export default Home;