import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Calendar, PlusCircle, Edit, Trash2, Check, X } from "lucide-react";
import { listarFrequencias, criarFrequencia, atualizarFrequencia, deletarFrequencia } from "../../../api/frequencias";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { useConfiguracoes } from "../../../hooks/useConfiguracoes";
import {
  listarCompensacoesAusencia,
  criarCompensacaoAusencia,
  atualizarCompensacaoAusencia,
  deletarCompensacaoAusencia,
} from "../../../api/compensacoesAusencia";

const initialFormData = {
  ano: "",
  aulasPrevistas: "",
  faltas: "",
  compensacoes: [],
};

// Função para calcular percentPresenca
const calcularPercentPresenca = (totalAulas, faltas) => {
  const numTotalAulas = Number(totalAulas);
  const numFaltas = Number(faltas);
  // Retorna null se os dados não forem válidos para cálculo, para que getStatusBadge mostre N/D
  if (isNaN(numTotalAulas) || isNaN(numFaltas) || numTotalAulas <= 0) { 
    return null;
  }
  return ((numTotalAulas - numFaltas) / numTotalAulas) * 100;
};

export default function FrequenciaTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const { getStatusFrequencia } = useConfiguracoes();
  const [frequencias, setFrequencias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentFrequenciaId, setCurrentFrequenciaId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [compensacoes, setCompensacoes] = useState([]);
  const [isCompLoading, setIsCompLoading] = useState(false);
  const [compError, setCompError] = useState(null);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compModalMode, setCompModalMode] = useState("add");
  const [currentCompId, setCurrentCompId] = useState(null);
  const [compFormData, setCompFormData] = useState({ dataAtividade: "", realizada: false, descricao: "" });

  async function carregarFrequencias() {
    if (!alunoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarFrequencias(alunoId);
      const frequenciasProcessadas = (data || []).map(freq => {
        const percentualCalculado = calcularPercentPresenca(freq.totalAulas, freq.faltas);
        return {
          ...freq,
          percentPresenca: percentualCalculado,
        };
      });
      setFrequencias(frequenciasProcessadas);
    } catch (err) {
      console.error("Erro ao buscar frequências:", err);
      setError("Falha ao carregar os dados de frequência. Tente novamente mais tarde.");
      setFrequencias([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarFrequencias();
  }, [alunoId]);

  async function loadCompensacoes() {
    if (!alunoId) return;
    setIsCompLoading(true);
    setCompError(null);
    try {
      const data = await listarCompensacoesAusencia(alunoId);
      setCompensacoes(data);
    } catch (err) {
      console.error("Erro ao buscar compensações:", err);
      setCompError("Falha ao carregar as atividades de compensação. Tente novamente.");
    } finally {
      setIsCompLoading(false);
    }
  }

  useEffect(() => {
    loadCompensacoes();
  }, [alunoId]);

  const handleOpenModal = (mode = "add", frequencia = null) => {
    setModalMode(mode);
    setIsModalOpen(true);
    if (mode === "edit" && frequencia) {
      setCurrentFrequenciaId(frequencia.id || frequencia._id); 
      setFormData({
        ano: frequencia.ano || "",
        aulasPrevistas: frequencia.totalAulas || "", 
        faltas: frequencia.faltas || "",
        compensacoes: frequencia.compensacoes || [],
      });
    } else {
      setCurrentFrequenciaId(null);
      setFormData(initialFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alunoId) return;

    // Garante que os campos numéricos sejam convertidos e tenham fallbacks
    const payload = {
      ...formData,
      ano: Number(formData.ano) || new Date().getFullYear(), 
      totalAulas: Number(formData.aulasPrevistas) || 0,
      faltas: Number(formData.faltas) || 0,
      // compensacoes: formData.compensacoes || [], // Descomente se 'compensacoes' for parte do payload esperado pela API
    };
    // delete payload.aulasPrevistas; // Se a API espera 'totalAulas' e não 'aulasPrevistas' diretamente

    try {
      if (modalMode === "add") {
        await criarFrequencia(alunoId, payload);
        toast.success("Frequência registrada com sucesso!");
      } else {
        await atualizarFrequencia(alunoId, currentFrequenciaId, payload);
        toast.success("Frequência atualizada com sucesso!");
      }
      await carregarFrequencias();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar frequência:", err);
      const apiError = err.response?.data?.detail || "Erro ao salvar frequência. Tente novamente.";
      toast.error(apiError);
    }
  };

  const handleDelete = async (frequenciaId) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      await deletarFrequencia(alunoId, frequenciaId);
      toast.success("Frequência excluída com sucesso!");
      await carregarFrequencias();
    } catch (err) {
      console.error("Erro ao excluir frequência:", err);
      toast.error("Erro ao excluir frequência. Tente novamente.");
    }
  };

  // Abre modal para criar/editar atividade de compensação de ausência
  const openCompModal = (mode = "add", comp = null) => {
    setCompModalMode(mode);
    setIsCompModalOpen(true);
    if (mode === "edit" && comp) {
      setCurrentCompId(comp.id || comp._id);
      setCompFormData({
        dataAtividade: comp.dataAtividade ? comp.dataAtividade.split("T")[0] : "",
        realizada: comp.realizada,
        descricao: comp.descricao || "",
      });
    } else {
      setCurrentCompId(null);
      setCompFormData({ dataAtividade: "", realizada: false, descricao: "" });
    }
  };

  // Submete formulário de atividade de compensação de ausência
  const handleCompSubmit = async (e) => {
    e.preventDefault();
    if (!alunoId) return;
    try {
      const payload = { ...compFormData };
      if (compModalMode === "add") {
        await criarCompensacaoAusencia(alunoId, payload);
        toast.success("Atividade de compensação criada com sucesso!");
      } else {
        await atualizarCompensacaoAusencia(alunoId, currentCompId, payload);
        toast.success("Atividade de compensação atualizada com sucesso!");
      }
      setIsCompModalOpen(false);
      loadCompensacoes();
    } catch (err) {
      console.error("Erro ao salvar atividade de compensação:", err);
      toast.error("Erro ao salvar atividade de compensação. Tente novamente.");
    }
  };

  // Exclui atividade de compensação de ausência
  const handleCompDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta atividade?")) return;
    try {
      await deletarCompensacaoAusencia(alunoId, id);
      toast.success("Atividade de compensação excluída com sucesso!");
      loadCompensacoes();
    } catch (err) {
      console.error("Erro ao excluir atividade de compensação:", err);
      toast.error("Erro ao excluir atividade de compensação. Tente novamente.");
    }
  };

  const totalAulas = frequencias.reduce((sum, f) => sum + (Number(f.totalAulas) || 0), 0);
  const totalFaltas = frequencias.reduce((sum, f) => sum + (Number(f.faltas) || 0), 0);
  const frequenciaGeral = totalAulas > 0 ? ((totalAulas - totalFaltas) / totalAulas) * 100 : 0;

  // Função para obter badge de status dinâmico
  const getStatusBadge = (percentual) => {
    if (percentual == null || isNaN(percentual)) {
      return <Badge className="bg-gray-100 text-gray-800">N/D</Badge>;
    }
    const statusInfo = getStatusFrequencia(percentual);
    return <Badge className={statusInfo.color}>{statusInfo.status}</Badge>;
  };

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Carregando dados de frequência...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Frequência Escolar
          </CardTitle>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Button onClick={() => handleOpenModal()} variant="outline" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{frequenciaGeral.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Frequência Geral</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalAulas}</div>
              <div className="text-sm text-gray-600">Total de Aulas Previstas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalFaltas}</div>
              <div className="text-sm text-gray-600">Total de Faltas</div>
            </div>
          </div>

          {error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Detalhamento dos Registros</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead className="text-center">Aulas Previstas</TableHead>
                      <TableHead className="text-center">Faltas</TableHead>
                      <TableHead className="text-center">Frequência</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frequencias.map((freq) => (
                      <TableRow key={freq.id || freq._id}>
                        <TableCell>{freq.ano || 'N/A'}</TableCell>
                        <TableCell className="text-center">{Number(freq.totalAulas) || 0}</TableCell>
                        <TableCell className="text-center">{Number(freq.faltas) || 0}</TableCell>
                        {/* O percentPresenca aqui agora é o valor recalculado no frontend */}
                        <TableCell className="text-center">{freq.percentPresenca != null ? `${Number(freq.percentPresenca).toFixed(1)}%` : 'N/A'}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(freq.percentPresenca)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                            <>
                              <button
                                onClick={() => handleOpenModal("edit", freq)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                title="Editar Registro"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {user?.role === "ADMIN" && (
                                <button
                                  onClick={() => handleDelete(freq.id || freq._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Excluir Registro"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {frequencias.length === 0 && !isLoading && (
                  <div className="text-center p-6 text-gray-500">
                    Nenhum registro de frequência encontrado.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Seção de Compensação de Ausências */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Atividades de compensação de ausência
          </CardTitle>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Button variant="outline" size="sm" onClick={() => openCompModal()}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Atividade
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {compError && <div className="p-4 bg-red-50 text-red-600 rounded-md">{compError}</div>}
          {isCompLoading ? (
            <div className="p-6 text-center">Carregando atividades de compensação...</div>
          ) : compensacoes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Realizada</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compensacoes.map((item) => (
                    <TableRow key={item.id || item._id}>
                      <TableCell>{new Date(item.dataAtividade).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {item.realizada ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>{item.descricao || "-"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                          <button
                            onClick={() => openCompModal("edit", item)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            title="Editar Atividade"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {user?.role === "ADMIN" && (
                          <button
                            onClick={() => handleCompDelete(item.id || item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Excluir Atividade"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              Nenhuma atividade de compensação encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add"
                ? "Novo Registro de Frequência"
                : "Editar Registro de Frequência"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ano">Ano</Label>
              {/* Garante que o valor exibido no input seja uma string vazia se nulo/undefined */}
              <Input id="ano" name="ano" type="number" placeholder={`Ex: ${new Date().getFullYear()}`} value={formData.ano || ''} onChange={(e) => setFormData({ ...formData, ano: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="aulasPrevistas">Total de Aulas Previstas no Período</Label>
              <Input id="aulasPrevistas" name="aulasPrevistas" type="number" value={formData.aulasPrevistas || ''} onChange={(e) => setFormData({ ...formData, aulasPrevistas: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="faltas">Total de Faltas no Período</Label>
              <Input id="faltas" name="faltas" type="number" value={formData.faltas || ''} onChange={(e) => setFormData({ ...formData, faltas: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Compensação de Ausência */}
      <Dialog open={isCompModalOpen} onOpenChange={setIsCompModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {compModalMode === "add"
                ? "Nova Atividade de Compensação"
                : "Editar Atividade de Compensação"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompSubmit} className="space-y-4">
            <div>
              <Label htmlFor="dataAtividade">Data da Atividade</Label>
              <Input
                id="dataAtividade"
                type="date"
                value={compFormData.dataAtividade}
                onChange={(e) => setCompFormData({ ...compFormData, dataAtividade: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center">
              <input
                id="realizada"
                type="checkbox"
                className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                checked={compFormData.realizada}
                onChange={(e) => setCompFormData({ ...compFormData, realizada: e.target.checked })}
              />
              <label htmlFor="realizada" className="ml-2 text-sm font-medium text-gray-700">
                Realizada
              </label>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                type="text"
                value={compFormData.descricao}
                onChange={(e) => setCompFormData({ ...compFormData, descricao: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCompModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 