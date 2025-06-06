import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { GraduationCap, BookOpen, Users, LogOut, School, Activity, Shield, UserCog } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Alunos", url: "/alunos", icon: GraduationCap },
  { title: "Contraturno", url: "/contraturno", icon: BookOpen },
  { title: "Colaboradores", url: "/colaboradores", icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logoutUser, isAuthenticated } = useAuth();

  if (location.pathname === "/login" || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <aside className="w-64 bg-white border-r border-secondary h-screen flex flex-col">
      <div className="border-b border-secondary bg-primary text-white p-4 flex items-center gap-2">
        <School className="h-6 w-6" />
        <div>
          <h1 className="text-lg font-bold">EMEF Gonzaguinha</h1>
          <p className="text-xs opacity-90">Portfólio Digital</p>
          {user && <p className="text-xs opacity-80">Usuário: {user.username} ({user.role})</p>}
        </div>
      </div>
      <nav className="flex-1 overflow-auto p-4">
        <p className="text-sm font-semibold text-gray-600 mb-2">Menu Principal</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-primary-dark hover:bg-primary/10'}`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </NavLink>
            </li>
          ))}
          
          {/* Itens exclusivos para ADMIN */}
          {user?.role === "ADMIN" && (
            <>
              <li>
                <NavLink
                  to="/auditoria"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-primary-dark hover:bg-primary/10'}`
                  }
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Auditoria de edições</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/usuarios"
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-primary text-white' : 'text-primary-dark hover:bg-primary/10'}`
                  }
                >
                  <UserCog className="h-5 w-5" />
                  <span className="text-sm font-medium">Gerenciar usuários</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="border-t border-secondary p-4 flex flex-col gap-2">
        <NavLink
          to="/sobre-nos"
          className="flex items-center gap-2 p-2 rounded w-full justify-start text-primary-dark hover:bg-primary/10"
        >
          <School className="h-5 w-5" />
          <span>Sobre Nós</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-primary-dark hover:bg-primary/10 p-2 rounded w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
} 