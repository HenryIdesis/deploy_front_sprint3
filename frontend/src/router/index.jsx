import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import AlunoListPage from "../features/alunos/AlunoListPage";
import AlunoFormPage from "../features/alunos/AlunoFormPage";
import AlunoDetailPage from "../features/alunos/AlunoDetailPage";
import AlunoSummaryPage from "../features/alunos/AlunoSummaryPage";
import NotFoundPage from "../components/NotFoundPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import ContraturnoProjetos from "../features/contraturno/ContraturnoProjetos";
import ContraturnoFormPage from "../features/contraturno/ContraturnoFormPage";
import ContraturnoDetailPage from "../features/contraturno/ContraturnoDetailPage";
import ColaboradoresPage from "../features/colaboradores/ColaboradoresPage";
import AuditoriaPage from "../features/auditoria/AuditoriaPage";
import UsuariosPage from "../features/usuarios/UsuariosPage";
import SobreNos from "../components/SobreNos";
import Comunicado from "../components/Comunicado";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !user.role) { 
    // console.error(
    //   "ProtectedRoute: Usuário autenticado mas objeto 'user' ou 'user.role' está ausente. Verifique o token e AuthContext."
    // );
    return <Navigate to="/login" state={{ from: location, message: "Erro de autenticação." }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // console.warn(
    //   `Usuário ${user.username} (Role: ${user.role}) tentou acessar rota protegida para roles: ${allowedRoles.join(", ")}. Redirecionando para /dashboard.`
    // );
    return <Navigate to="/dashboard" state={{ message: "Acesso não autorizado" }} replace />;
  }

  return children;
};

const AppRouter = () => {
  const location = useLocation();
  useEffect(() => {
    document.title = "Portfólio Escolar Digital";
  }, [location]);

  const ROLES = {
    ADMIN: "ADMIN",
    EDITOR: "EDITOR",
    VISITANTE: "VISITANTE",
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <AlunoListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos/novo"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}>
            <AlunoFormPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/alunos/:id/edit" 
        element={ 
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}> 
            <AlunoFormPage /> 
          </ProtectedRoute> 
        } 
      />
      <Route
        path="/alunos/:id/summary"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <AlunoSummaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos/:id/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <AlunoDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contraturno"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <ContraturnoProjetos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contraturno/novo"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}>
            <ContraturnoFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contraturno/:id"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <ContraturnoDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contraturno/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}>
            <ContraturnoFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaboradores"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}> 
            <ColaboradoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditoria"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AuditoriaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sobre-nos"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR, ROLES.VISITANTE]}>
            <SobreNos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comunicado"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}>
            <Comunicado />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
