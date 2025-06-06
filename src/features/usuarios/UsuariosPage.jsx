import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { UserCog, Users, UserPlus, X, Edit, Trash2 } from "lucide-react";
import { listarUsuarios, criarUsuario, excluirUsuario } from "../../api/usuarios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function UsuariosPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "VISITANTE"
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Verificar se é ADMIN
  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Query para listar usuários
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuarios,
  });

  // Mutation para criar usuário
  const criarUsuarioMutation = useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries(["usuarios"]);
      setShowModal(false);
      setFormData({ username: "", password: "", role: "VISITANTE" });
      alert("Usuário criado com sucesso!");
    },
    onError: (error) => {
      const message = error.response?.data?.detail || "Erro ao criar usuário";
      alert(message);
    },
  });

  // Mutation para excluir usuário
  const excluirUsuarioMutation = useMutation({
    mutationFn: excluirUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries(["usuarios"]);
      alert("Usuário excluído com sucesso!");
    },
    onError: (error) => {
      const message = error.response?.data?.detail || "Erro ao excluir usuário";
      alert(message);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    criarUsuarioMutation.mutate(formData);
    setLoading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ username: "", password: "", role: "VISITANTE" });
  };

  const handleExcluirUsuario = (userId, username) => {
    const confirmacao = confirm(`Tem certeza que deseja excluir o usuário "${username}"?`);
    if (confirmacao) {
      excluirUsuarioMutation.mutate(userId);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: { text: "Administrador", color: "bg-red-100 text-red-800" },
      EDITOR: { text: "Editor", color: "bg-blue-100 text-blue-800" },
      VISITANTE: { text: "Visitante", color: "bg-gray-100 text-gray-800" }
    };
    return labels[role] || { text: role, color: "bg-gray-100 text-gray-800" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="w-8 h-8 text-primary-dark" />
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Gerenciar Usuários</h1>
            <p className="text-gray-600">Administração de usuários do sistema</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-dark text-white flex items-center justify-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Usuários ({usuarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando usuários...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-400">
                Clique em "Novo Usuário" para criar o primeiro usuário.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Usuário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Permissão</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Criado em</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Criado por</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => {
                    const roleInfo = getRoleLabel(usuario.role);
                    return (
                      <tr key={usuario._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{usuario.username}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                            {roleInfo.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(usuario.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {usuario.createdBy || "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-1">
                            {['ADMIN', 'EDITOR'].includes(user.role) && (
                              <button
                                onClick={() => console.log("Editar usuário", usuario._id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                title="Editar Usuário"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            {user.role === 'ADMIN' && usuario._id !== user.user_id && (
                              <button
                                onClick={() => handleExcluirUsuario(usuario._id, usuario.username)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para criar usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary-dark">Novo Usuário</h2>
              <button
                onClick={closeModal}
                className="absolute -top-2 -right-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full p-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de usuário
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome de usuário"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite a senha"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissão
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="VISITANTE">Visitante - Apenas visualizar</option>
                  <option value="EDITOR">Editor - Visualizar, criar e editar</option>
                  <option value="ADMIN">Administrador - Acesso completo</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1 h-10 flex items-center justify-center"
                  disabled={loading || criarUsuarioMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white flex items-center justify-center"
                  disabled={loading || criarUsuarioMutation.isPending}
                >
                  {criarUsuarioMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Usuário
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 