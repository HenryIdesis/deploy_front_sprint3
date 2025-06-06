import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  listarColaboradores,
  criarColaborador,
  atualizarColaborador,
  deletarColaborador,
} from "../../api/colaboradores";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ColaboradoresPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: colaboradores = [], isLoading } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: listarColaboradores,
  });
  const { user } = useAuth();

  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    cargoFuncao: "",
    email: "",
    celular: "",
  });
  // Estado para popup de exclusão de colaborador
  const [colabToDelete, setColabToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Abrir modal se vier da página do dashboard
  useEffect(() => {
    if (location.state?.openNewModal) {
      openNew();
    }
  }, [location]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => criarColaborador(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["colaboradores"]);
      setIsModalOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: (data) => atualizarColaborador(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["colaboradores"]);
      setIsModalOpen(false);
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deletarColaborador(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["colaboradores"]);
      setColabToDelete(null);
      setDeleteConfirmationText("");
    },
  });

  useEffect(() => {
    setFiltered(
      colaboradores.filter((c) =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cargoFuncao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, colaboradores]);

  const openNew = () => {
    setEditing(null);
    setFormData({ nome: "", cargoFuncao: "", email: "", celular: "" });
    setIsModalOpen(true);
  };

  const openEdit = (col) => {
    setEditing(col);
    setFormData({
      nome: col.nome,
      cargoFuncao: col.cargoFuncao,
      email: col.email,
      celular: col.celular,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (col) => {
    if (col) setColabToDelete(col);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatarTelefone = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 2) {
      return `(${numeros}`;
    }
    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }
    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  if (isLoading) return <p>Carregando colaboradores...</p>;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-primary-dark">
          Colaboradores
        </h2>
        {user.role !== 'VISITANTE' && (
          <Button variant="primary" className="flex items-center" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo colaborador
          </Button>
        )}
      </div>
      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-500" />
        <Input
          placeholder="Buscar por nome, cargo ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {/* Table */}
      <Card className="border-secondary">
        <CardHeader>
          <CardTitle className="text-primary-dark">
            Lista de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo/Função</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((col) => (
                <TableRow key={col.id} className="hover:bg-secondary/20">
                  <TableCell>{col.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-accent text-primary-dk">
                      {col.cargoFuncao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="h-4 w-4 mr-1" />
                        {col.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="h-4 w-4 mr-1" />
                        {formatarTelefone(col.celular)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {['ADMIN', 'EDITOR'].includes(user.role) && (
                        <button
                          onClick={() => openEdit(col)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          title="Editar Colaborador"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(col)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Excluir Colaborador"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editing ? "Editar Colaborador" : "Novo Colaborador"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Cargo/Função</label>
                <Input
                  required
                  value={formData.cargoFuncao}
                  onChange={(e) => setFormData({ ...formData, cargoFuncao: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medim">Email</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Celular</label>
                <Input
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.celular}
                  onChange={(e) => {
                    const { value } = e.target;
                    const formattedValue = formatarTelefone(value);
                    setFormData({ ...formData, celular: formattedValue });
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editing ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {colabToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-4">
              Tem certeza que deseja excluir o colaborador{" "}
              <strong>{colabToDelete.nome}</strong>?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Digite "EXCLUIR" para confirmar:
            </p>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setColabToDelete(null);
                  setDeleteConfirmationText("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={deleteConfirmationText !== "EXCLUIR"}
                onClick={() => deleteMutation.mutate(colabToDelete.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 