import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarContraturnos, deletarContraturno, atualizarContraturno } from "../../api/contraturno";
import { listarAlunos } from "../../api/alunos";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Search, Eye, Edit, Trash2, BookOpen, Users, Clock, Target, Palette, Music, Calculator, Leaf, Film, Crown, Filter } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ContraturnoProjetos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editProjeto, setEditProjeto] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const { data: projetos = [], isLoading } = useQuery({ queryKey: ["contraturno"], queryFn: listarContraturnos });
  const { data: allAlunos = [] } = useQuery({ queryKey: ["alunos"], queryFn: listarAlunos });
  const [searchTerm, setSearchTerm] = useState("");
  const [projetoToDelete, setProjetoToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [filtroApenaAtivos, setFiltroApenasAtivos] = useState(false);

  console.log("Projetos carregados:", projetos);

  const handleViewProject = (projeto) => {
    console.log("Projeto selecionado:", projeto);
    console.log("ID do projeto:", projeto.id);
    if (projeto.id) {
      navigate(`/contraturno/${projeto.id}`);
    } else {
      console.error("ID do projeto não encontrado");
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deletarContraturno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contraturno"] });
      setProjetoToDelete(null);
      setDeleteConfirmationText("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => atualizarContraturno(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contraturno"] });
      setEditProjeto(null);
    },
  });

  const filteredProjetos = projetos.filter(
    (projeto) =>
      (projeto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.categoria.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filtroApenaAtivos || projeto.status === "Ativo")
  );

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case "Arte": return <Palette className="w-4 h-4" />;
      case "Literatura": return <BookOpen className="w-4 h-4" />;
      case "Música": return <Music className="w-4 h-4" />;
      case "Exatas": return <Calculator className="w-4 h-4" />;
      case "Sustentabilidade": return <Leaf className="w-4 h-4" />;
      case "Cultura": return <Film className="w-4 h-4" />;
      case "Estratégia": return <Crown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoriaColor = (categoria) => {
    switch (categoria) {
      case "Arte": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Literatura": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Música": return "bg-pink-100 text-pink-800 border-pink-200";
      case "Exatas": return "bg-green-100 text-green-800 border-green-200";
      case "Sustentabilidade": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Cultura": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Estratégia": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalInscritos = projetos.reduce((sum, p) => sum + p.alunosInscritos.length, 0);
  const totalVagas = projetos.reduce((sum, p) => sum + p.vagas, 0);
  const projetosAtivos = projetos.filter((p) => p.status === "Ativo").length;

  if (isLoading) return <p>Carregando projetos...</p>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com botão de novo projeto */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-primary-dark">Projetos de Contraturno</h1>
        {user.role !== 'VISITANTE' && (
          <Button className="bg-primary hover:bg-primary-dk text-white flex items-center" onClick={() => navigate('/contraturno/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-secondary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Projetos</p>
              <p className="text-2xl font-bold text-primary-dark">{projetos.length}</p>
            </div>
            <Target className="w-8 h-8 text-accent" />
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projetos Ativos</p>
              <p className="text-2xl font-bold text-primary-dark">{projetosAtivos}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Inscritos</p>
              <p className="text-2xl font-bold text-primary-dark">{totalInscritos}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Vagas</p>
              <p className="text-2xl font-bold text-primary-dark">{totalVagas}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search Bar and Filters */}
      <Card className="border-2 border-secondary">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto min-w-0 sm:min-w-[300px] md:min-w-[400px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-accent focus:ring-accent w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="h-5 w-5 text-gray-500" />
            <input 
              type="checkbox" 
              id="filtroApenasAtivos"
              checked={filtroApenaAtivos}
              onChange={(e) => setFiltroApenasAtivos(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="filtroApenasAtivos" className="text-sm text-gray-700 whitespace-nowrap">
              Apenas projetos ativos
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="text-primary-dark">
            {filtroApenaAtivos 
              ? `Projetos Ativos (${filteredProjetos.length})` 
              : `Lista de Projetos (${filteredProjetos.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-primary-dark font-semibold">Título</TableHead>
                  <TableHead className="text-primary-dark font-semibold">Descrição</TableHead>
                  <TableHead className="text-primary-dark font-semibold">Status</TableHead>
                  <TableHead className="text-primary-dark font-semibold text-center">Inscritos</TableHead>
                  <TableHead className="text-primary-dark font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjetos.map((p) => (
                  <React.Fragment key={p.id}>
                    <TableRow className="hover:bg-secondary/20">
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getCategoriaIcon(p.categoria)}
                            <span className="font-medium text-primary-dark">{p.titulo}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${getCategoriaColor(p.categoria)}`}>{p.categoria}</Badge>
                            <span className="text-xs text-gray-500">Prof. {p.professor}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.descricao}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === 'Ativo' ? 'solid' : 'outline'}
                          className={p.status === 'Ativo' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{p.alunosInscritos.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleViewProject(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Visualizar Projeto"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {['ADMIN', 'EDITOR'].includes(user.role) && (
                            <button
                              onClick={() => navigate(`/contraturno/${p.id}/edit`)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                              title="Editar Projeto"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {user.role === 'ADMIN' && (
                            <button
                              onClick={() => setProjetoToDelete(p)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Excluir Projeto"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {projetoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar exclusão</h3>
            <p>Digite o título do projeto <strong>{projetoToDelete.titulo}</strong> para confirmar:</p>
            <Input
              className="my-4"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setProjetoToDelete(null); setDeleteConfirmationText(""); }}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteConfirmationText !== projetoToDelete.titulo}
                onClick={() => deleteMutation.mutate(projetoToDelete.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProjeto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Editar Projeto</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate({ id: editProjeto.id, updates: formEdit });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <Input
                    value={formEdit.titulo}
                    onChange={(e) => setFormEdit({ ...formEdit, titulo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formEdit.descricao}
                    onChange={(e) => setFormEdit({ ...formEdit, descricao: e.target.value })}
                    className="border rounded w-full p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Professor</label>
                  <Input
                    value={formEdit.professor}
                    onChange={(e) => setFormEdit({ ...formEdit, professor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horário</label>
                  <Input
                    value={formEdit.horario}
                    onChange={(e) => setFormEdit({ ...formEdit, horario: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vagas</label>
                  <Input
                    type="number"
                    value={formEdit.vagas}
                    onChange={(e) => setFormEdit({ ...formEdit, vagas: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select
                    value={formEdit.categoria}
                    onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })}
                    className="border rounded w-full p-2"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Arte">Arte</option>
                    <option value="Literatura">Literatura</option>
                    <option value="Música">Música</option>
                    <option value="Exatas">Exatas</option>
                    <option value="Sustentabilidade">Sustentabilidade</option>
                    <option value="Cultura">Cultura</option>
                    <option value="Estratégia">Estratégia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formEdit.status}
                    onChange={(e) => setFormEdit({ ...formEdit, status: e.target.value })}
                    className="border rounded w-full p-2"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setEditProjeto(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 