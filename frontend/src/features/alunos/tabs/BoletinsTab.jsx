import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { 
  GraduationCap, 
  FileText, 
  Award, 
  Trash2, 
  Plus, 
  Filter,
  Eye,
  Edit
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { listarDocumentos, deletarDocumento } from "../../../api/documentos";
import { listarBoletins, criarBoletim, deletarBoletim, atualizarBoletim } from "../../../api/boletins";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UploadDocumento from "../../../components/UploadDocumento";
import { useConfiguracoes } from "../../../hooks/useConfiguracoes";

export default function BoletinsTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getStatusNota, isBoletinsDigitaisHabilitado } = useConfiguracoes();
  const [documentos, setDocumentos] = useState([]);
  const [atualizarLista, setAtualizarLista] = useState(0);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [showNovoBoletim, setShowNovoBoletim] = useState(false);
  const [filtroAno, setFiltroAno] = useState("todos");
  const [isEditando, setIsEditando] = useState(false);
  const [boletimEditandoId, setBoletimEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear(),
    bimestre: 1,
    disciplinas: [
      { nome: "Português", nota: 0 },
      { nome: "Matemática", nota: 0 },
      { nome: "História", nota: 0 },
      { nome: "Geografia", nota: 0 },
      { nome: "Ciências", nota: 0 }
    ]
  });

  const TIPO_DOCUMENTO = "boletim";

  // Verificar se os boletins digitais estão habilitados
  const boletinsHabilitados = isBoletinsDigitaisHabilitado();

  // Query para buscar boletins digitais
  const { data: boletinsDigitais = [], isLoading: isLoadingBoletins } = useQuery({
    queryKey: ["boletins", alunoId],
    queryFn: () => listarBoletins(alunoId),
    enabled: !!alunoId
  });

  // Filtrar boletins por ano
  const boletinsFiltrados = boletinsDigitais.filter(boletim => {
    if (filtroAno === "todos") return true;
    return boletim.ano === parseInt(filtroAno);
  });

  // Obter anos únicos dos boletins para o filtro
  const anosDisponiveis = [...new Set(boletinsDigitais.map(b => b.ano))].sort((a, b) => b - a);

  // Mutation para criar boletim
  const criarBoletimMutation = useMutation({
    mutationFn: (data) => criarBoletim(alunoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["boletins", alunoId]);
      resetarModal();
    },
    onError: (error) => {
      alert("Erro ao criar boletim: " + (error.response?.data?.detail || error.message));
    }
  });

  // Mutation para editar boletim
  const editarBoletimMutation = useMutation({
    mutationFn: (data) => atualizarBoletim(alunoId, boletimEditandoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["boletins", alunoId]);
      resetarModal();
    },
    onError: (error) => {
      alert("Erro ao editar boletim: " + (error.response?.data?.detail || error.message));
    }
  });

  // Mutation para deletar boletim digital
  const deletarBoletimMutation = useMutation({
    mutationFn: (boletimId) => deletarBoletim(alunoId, boletimId),
    onSuccess: () => {
      queryClient.invalidateQueries(["boletins", alunoId]);
    },
    onError: (error) => {
      alert("Erro ao deletar boletim: " + (error.response?.data?.detail || error.message));
    }
  });

  const carregarDocumentos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarDocumentos(alunoId, TIPO_DOCUMENTO);
      setDocumentos(data);
    } catch (error) {
      console.error(`Erro ao carregar ${TIPO_DOCUMENTO}s:`, error);
      setErro(`Não foi possível carregar os ${TIPO_DOCUMENTO}s. Por favor, tente novamente.`);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (alunoId) {
      carregarDocumentos();
    }
  }, [alunoId, atualizarLista]);

  const handleUploadSuccess = () => {
    setAtualizarLista(prev => prev + 1);
  };

  const handleRemover = async (documentoId) => {
    if (!window.confirm(`Tem certeza que deseja remover este ${TIPO_DOCUMENTO}?`)) {
      return;
    }

    try {
      await deletarDocumento(alunoId, documentoId);
      setDocumentos(docs => docs.filter(d => d._id !== documentoId));
    } catch (error) {
      console.error(`Erro ao remover ${TIPO_DOCUMENTO}:`, error);
      alert(`Erro ao remover o ${TIPO_DOCUMENTO}. Por favor, tente novamente.`);
    }
  };

  const handleRemoverBoletim = (boletimId) => {
    if (window.confirm("Tem certeza que deseja remover este boletim?")) {
      deletarBoletimMutation.mutate(boletimId);
    }
  };

  const handleSubmitBoletim = (e) => {
    e.preventDefault();
    if (isEditando) {
      editarBoletimMutation.mutate(formData);
    } else {
      criarBoletimMutation.mutate(formData);
    }
  };

  const updateNota = (index, nota) => {
    const novasDisciplinas = [...formData.disciplinas];
    novasDisciplinas[index].nota = parseFloat(nota) || 0;
    setFormData({ ...formData, disciplinas: novasDisciplinas });
  };

  const calcularMedia = (disciplinas) => {
    if (!disciplinas || disciplinas.length === 0) return 0;
    const total = disciplinas.reduce((sum, d) => sum + d.nota, 0);
    return (total / disciplinas.length).toFixed(1);
  };

  const resetarModal = () => {
    setShowNovoBoletim(false);
    setIsEditando(false);
    setBoletimEditandoId(null);
    setFormData({
      ano: new Date().getFullYear(),
      bimestre: 1,
      disciplinas: [
        { nome: "Português", nota: 0 },
        { nome: "Matemática", nota: 0 },
        { nome: "História", nota: 0 },
        { nome: "Geografia", nota: 0 },
        { nome: "Ciências", nota: 0 }
      ]
    });
  };

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/api$/, "");
  const canCreateEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const canDelete = user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Boletins Digitais - Mostrar apenas se habilitado nas configurações */}
      {boletinsHabilitados && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Boletins Escolares Digitais
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* Filtro por Ano */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filtroAno}
                    onChange={(e) => setFiltroAno(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="todos">Todos os anos</option>
                    {anosDisponiveis.map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </select>
                </div>
                
                {canCreateEdit && (
                  <Button 
                    onClick={() => {
                      resetarModal();
                      setShowNovoBoletim(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Boletim
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBoletins ? (
              <div className="text-center p-6">
                <p className="text-gray-500">Carregando boletins...</p>
              </div>
            ) : boletinsFiltrados.length > 0 ? (
              <>
                {filtroAno !== "todos" && (
                  <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
                    📊 Exibindo {boletinsFiltrados.length} boletim(s) de {filtroAno}
                  </div>
                )}
                <div className="grid gap-4">
                  {boletinsFiltrados.map((boletim) => (
                    <div key={boletim.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-lg">
                            {boletim.ano} - {boletim.bimestre}º Bimestre
                          </h4>
                          <span className={`px-2 py-1 text-sm rounded-full font-medium ${getStatusNota(calcularMedia(boletim.disciplinas)).color}`}>
                            Média: {calcularMedia(boletim.disciplinas)} - {getStatusNota(calcularMedia(boletim.disciplinas)).status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCreateEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Preencher o formulário com os dados do boletim para edição
                                setFormData({
                                  ano: boletim.ano,
                                  bimestre: boletim.bimestre,
                                  disciplinas: boletim.disciplinas
                                });
                                setShowNovoBoletim(true);
                                setIsEditando(true);
                                setBoletimEditandoId(boletim.id);
                              }}
                              className="text-blue-600 hover:bg-blue-50"
                              title="Editar boletim"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoverBoletim(boletim.id)}
                              className="text-red-600 hover:bg-red-50"
                              title="Excluir boletim"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {boletim.disciplinas.map((disciplina, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="font-medium text-gray-700">{disciplina.nome}</span>
                            <span className={`px-2 py-1 text-sm rounded font-medium ${getStatusNota(disciplina.nota).color}`}>
                              {disciplina.nota.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Criado em: {new Date(boletim.createdAt).toLocaleDateString('pt-BR')}
                        {boletim.createdBy && ` por ${boletim.createdBy}`}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  {filtroAno !== "todos" 
                    ? `Nenhum boletim encontrado para o ano ${filtroAno}` 
                    : "Nenhum boletim digital criado ainda"
                  }
                </p>
                {filtroAno !== "todos" && (
                  <Button
                    variant="outline"
                    onClick={() => setFiltroAno("todos")}
                    className="mt-2 text-sm"
                  >
                    Ver todos os boletins
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal para Novo Boletim - Mostrar apenas se habilitado nas configurações */}
      {boletinsHabilitados && showNovoBoletim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{isEditando ? "Editar Boletim" : "Novo Boletim Escolar"}</h3>
              <Button
                variant="outline"
                onClick={resetarModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleSubmitBoletim} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ano</label>
                  <Input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || new Date().getFullYear() })}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bimestre</label>
                  <select
                    value={formData.bimestre}
                    onChange={(e) => setFormData({ ...formData, bimestre: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={1}>1º Bimestre</option>
                    <option value={2}>2º Bimestre</option>
                    <option value={3}>3º Bimestre</option>
                    <option value={4}>4º Bimestre</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notas por Disciplina</label>
                <div className="space-y-2">
                  {formData.disciplinas.map((disciplina, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium">{disciplina.nome}:</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={disciplina.nota}
                        onChange={(e) => updateNota(index, e.target.value)}
                        className="w-20"
                        required
                      />
                      <span className={`px-2 py-1 text-xs rounded ${getStatusNota(disciplina.nota).color}`}>
                        {getStatusNota(disciplina.nota).status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium">
                    Média Geral: {calcularMedia(formData.disciplinas)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetarModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={criarBoletimMutation.isLoading || editarBoletimMutation.isLoading}
                >
                  {isEditando 
                    ? (editarBoletimMutation.isLoading ? "Salvando..." : "Salvar Alterações")
                    : (criarBoletimMutation.isLoading ? "Criando..." : "Criar Boletim")
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documentos PDF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Boletins Enviados (PDF)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canCreateEdit && (
            <UploadDocumento
              alunoId={alunoId}
              tipo={TIPO_DOCUMENTO}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
          
          {erro && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{erro}</p>
              <button 
                onClick={carregarDocumentos}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {carregando ? (
            <div className="mt-6 text-center p-6">
              <p className="text-gray-500">Carregando boletins...</p>
            </div>
          ) : documentos.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-4">Documentos Enviados</h3>
              <div className="grid gap-4">
                {documentos.map((doc) => (
                  <div 
                    key={doc._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{doc.nomeOriginal}</p>
                        <p className="text-sm text-gray-500">
                          Enviado em: {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`${baseUrl}/api/documentos/alunos/${alunoId}/documentos/${doc._id}?token=${localStorage.getItem("token")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Visualizar PDF"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                      {canDelete && (
                        <button
                          onClick={() => handleRemover(doc._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Remover PDF"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum documento PDF enviado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}