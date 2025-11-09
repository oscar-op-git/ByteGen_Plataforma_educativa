// frontend/src/pages/RolesAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderHome from '../components/HeaderHome';
import FooterHome from '../components/FooterHome';
import CustomButton from '../components/CustomBotton';
import '../styles/RolesAdminPage.css';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import {
  listUsers,
  listRoles,
  setUserRole as apiSetUserRole,
  clearUserRole as apiClearUserRole,
} from '../services/adminService';
import type { AdminRole } from '../services/adminService';

import { signout, getSession } from '../services/authService';

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number | null;
  roleLabel: string;
};

type RoleOption = {
  id: number;
  label: string;
};

const RolesAdminPage: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleToAssignId, setRoleToAssignId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState<string>('Admin');

  const currentUser = users.find((u) => u.id === selectedUserId) || null;

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  // ✅ Una sola llamada a getSession
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // Cargar sesión y datos en paralelo
        const [session, usersResp, rolesResp] = await Promise.all([
          getSession(),
          listUsers({ page: 1, pageSize: 100 }),
          listRoles(),
        ]);

        if (!mounted) return;

        if (session?.user) {
          setAdminName(session.user.name || session.user.email || 'Admin');
        }

        const mappedUsers: UserRow[] = usersResp.items.map((u) => ({
          id: u.id,
          firstName: u.first_name ?? '',
          lastName: u.last_name ?? '',
          email: u.email ?? '',
          roleId: u.id_role_role,
          roleLabel: u.role?.description ?? 'Estudiante',
        }));

        const mappedRoles: RoleOption[] = rolesResp.map((r: AdminRole) => ({
          id: r.id_role,
          label: r.description ?? `Rol #${r.id_role}`,
        }));

        setUsers(mappedUsers);
        setRoles(mappedRoles);
      } catch (err: any) {
        if (!mounted) return;
        
        console.error('Error al cargar datos:', err);
        const msg = err?.message || 'Error al cargar datos';
        toast.error(msg);

        if (/no autenticado/i.test(msg) || /denegado/i.test(msg)) {
          navigate('/home');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

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

  const assignRole = useCallback(async () => {
    if (!currentUser || roleToAssignId == null) {
      toast.error('Selecciona un usuario y un rol');
      return;
    }

    const selectedRole = roles.find((r) => r.id === roleToAssignId);
    if (!selectedRole) {
      toast.error('Rol seleccionado inválido');
      return;
    }

    const res = await Swal.fire({
      title: '¿Asignar rol?',
      text: `Asignar "${selectedRole.label}" a ${currentUser.firstName} ${currentUser.lastName}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    try {
      const updated = await apiSetUserRole(currentUser.id, selectedRole.id);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id
            ? {
                ...u,
                roleId: updated.id_role_role,
                roleLabel: updated.role?.description ?? 'Estudiante',
              }
            : u,
        ),
      );

      toast.success('Rol asignado correctamente');
    } catch (err: any) {
      console.error('Error al asignar rol:', err);
      toast.error(err?.message || 'Error al asignar rol');
    }
  }, [currentUser, roleToAssignId, roles]);

  const removeRole = useCallback(async () => {
    if (!currentUser) {
      toast.error('Selecciona un usuario');
      return;
    }

    if (currentUser.roleId == null) {
      toast('Este usuario ya está como Estudiante');
      return;
    }

    const res = await Swal.fire({
      title: '¿Eliminar rol?',
      html: `
        <div>Usuario: <b>${currentUser.firstName} ${currentUser.lastName}</b></div>
        <div>Rol actual:
        <b>${currentUser.roleLabel}</b></div>
        <div style="margin-top:8px;">Se eliminará el rol y quedará como <b>Estudiante</b>.</div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    try {
      const updated = await apiClearUserRole(currentUser.id);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id
            ? {
                ...u,
                roleId: updated.id_role_role,
                roleLabel: updated.role?.description ?? 'Estudiante',
              }
            : u,
        ),
      );

      toast.success('Rol eliminado correctamente');
    } catch (err: any) {
      console.error('Error al quitar rol:', err);
      toast.error(err?.message || 'Error al quitar rol');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <>
        <HeaderHome
          isLoggedIn={true}
          userName={adminName}
          onGoHome={() => navigate('/home')}
          onGoCursos={() => {}}
          onGoActividades={() => {}}
          onGoLogin={() => navigate('/login')}
          onOpenUserMenu={() => setUserMenuOpen((v) => !v)}
          onCloseUserMenu={() => setUserMenuOpen(false)}
          userMenuOpen={userMenuOpen}
          onUserMenuAction={onUserMenuAction}
          isAdmin={true}
        />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          Cargando...
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderHome
        isLoggedIn={true}
        userName={adminName}
        onGoHome={() => navigate('/home')}
        onGoCursos={() => {}}
        onGoActividades={() => {}}
        onGoLogin={() => navigate('/login')}
        onOpenUserMenu={() => setUserMenuOpen((v) => !v)}
        onCloseUserMenu={() => setUserMenuOpen(false)}
        userMenuOpen={userMenuOpen}
        onUserMenuAction={onUserMenuAction}
        isAdmin={true}
      />

      <div className="roles-page">
        <div className="roles-box">
          <div className="roles-header">
            <h1 className="roles-title">Asignación de roles</h1>
          </div>

          <div className="roles-layout">
            <div className="roles-left">
              <div className="roles-search">
                <input
                  placeholder="Buscar por nombre, apellido o correo"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="roles-table-wrap">
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Correo</th>
                      <th>Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const isSelected = u.id === selectedUserId;
                      return (
                        <tr
                          key={u.id}
                          className={isSelected ? 'selected' : ''}
                          onClick={() => setSelectedUserId(u.id)}
                        >
                          <td>{u.firstName}</td>
                          <td>{u.lastName}</td>
                          <td>{u.email}</td>
                          <td>
                            <div className="roles-pills">
                              <span className="pill">{u.roleLabel}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="roles-right">
              <div className="roles-card-toolbar">
                <CustomButton label="Asignar roles" onClick={assignRole} fullWidth={false} />
              </div>

              <div className="panel">
                <h3 className="panel__title">Asignar rol</h3>
                <div className="panel__body">
                  {roles.length === 0 ? (
                    <p className="hint">No hay roles definidos en el sistema.</p>
                  ) : (
                    <div className="role-options">
                      {roles.map((rk) => (
                        <button
                          key={rk.id}
                          className={`role-option ${roleToAssignId === rk.id ? 'active' : ''}`}
                          onClick={() => setRoleToAssignId(rk.id)}
                        >
                          {rk.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="hint">
                    Selecciona un usuario y un rol, luego pulsa "Asignar rol".
                  </p>
                </div>
              </div>

              <div className="roles-card-toolbar">
                <CustomButton label="Eliminar roles" onClick={removeRole} fullWidth={false} />
              </div>

              <div className="panel">
                <h3 className="panel__title">Eliminar roles</h3>
                <div className="panel__body">
                  {!currentUser ? (
                    <p className="hint">Selecciona un usuario para ver su rol.</p>
                  ) : (
                    <div className="role-owned">
                      <span className="role-owned-pill">{currentUser.roleLabel}</span>
                    </div>
                  )}
                  <p className="hint">
                    Al quitar el rol, el usuario quedará como <b>Estudiante</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterHome />
    </>
  );
};

export default RolesAdminPage;