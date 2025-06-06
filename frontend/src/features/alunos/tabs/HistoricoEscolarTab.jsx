import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { PlusCircle, Edit, Trash2, BookOpen, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { listarHipoteses, criarHipotese, atualizarHipotese, deletarHipotese } from "../../../api/hipotese";
import { listarDiagnosticos, criarDiagnostico, atualizarDiagnostico, deletarDiagnostico } from "../../../api/diagnosticos";
import { listarAvaliacoes, criarAvaliacao, atualizarAvaliacao, deletarAvaliacao } from "../../../api/avaliacoes";
import { useAuth } from "../../../context/AuthContext";

const initialHipo = { data: "", nivel: "", obs: "" };
const initialDiag = { ano: new Date().getFullYear(), materia: "", nota: "", observacoes: "" };
const initialAva = { nome: "", data: "", resultado: "" };

export default function HistoricoEscolarTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  // Hipóteses de escrita
  const [hipoteses, setHipoteses] = useState([]);
  const [hipoLoading, setHipoLoading] = useState(false);
  const [hipoError, setHipoError] = useState(null);
  const [hipoModalOpen, setHipoModalOpen] = useState(false);
  const [hipoMode, setHipoMode] = useState("add");
  const [currentHipoId, setCurrentHipoId] = useState(null);
  const [hipoForm, setHipoForm] = useState(initialHipo);
  // Diagnósticos
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState(null);
  const [diagModalOpen, setDiagModalOpen] = useState(false);
  const [diagMode, setDiagMode] = useState("add");
  const [currentDiagId, setCurrentDiagId] = useState(null);
  const [diagForm, setDiagForm] = useState(initialDiag);
  // Avaliações externas
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [avaLoading, setAvaLoading] = useState(false);
  const [avaError, setAvaError] = useState(null);
  const [avaModalOpen, setAvaModalOpen] = useState(false);
  const [avaMode, setAvaMode] = useState("add");
  const [currentAvaId, setCurrentAvaId] = useState(null);
  const [avaForm, setAvaForm] = useState(initialAva);

  useEffect(() => {
    carregarHipoteses();
    carregarDiagnosticos();
    carregarAvaliacoes();
  }, [alunoId]);

  async function carregarHipoteses() {
    if (!alunoId) return;
    setHipoLoading(true); setHipoError(null);
    try {
      const data = await listarHipoteses(alunoId);
      setHipoteses(data);
    } catch (err) {
      setHipoError("Falha ao carregar hipóteses.");
    } finally {
      setHipoLoading(false);
    }
  }

  async function carregarDiagnosticos() {
    if (!alunoId) return;
    setDiagLoading(true); setDiagError(null);
    try {
      const data = await listarDiagnosticos(alunoId);
      setDiagnosticos(data);
    } catch (err) {
      setDiagError("Falha ao carregar diagnósticos.");
    } finally {
      setDiagLoading(false);
    }
  }

  async function carregarAvaliacoes() {
    if (!alunoId) return;
    setAvaLoading(true); setAvaError(null);
    try {
      const data = await listarAvaliacoes(alunoId);
      setAvaliacoes(data);
    } catch (err) {
      setAvaError("Falha ao carregar avaliações.");
    } finally {
      setAvaLoading(false);
    }
  }

  // Handlers de modais e CRUD
  function openHipoModal(mode = "add", item = null) {
    setHipoMode(mode); setHipoModalOpen(true);
    if (mode === "edit" && item) {
      setCurrentHipoId(item.id);
      setHipoForm({ data: item.data.split("T")[0], nivel: item.nivel, obs: item.obs || "" });
    } else {
      setCurrentHipoId(null); setHipoForm(initialHipo);
    }
  }
  async function handleHipoSubmit(e) {
    e.preventDefault();
    try {
      if (hipoMode === "add") await criarHipotese(alunoId, hipoForm);
      else await atualizarHipotese(alunoId, currentHipoId, hipoForm);
      toast.success("Hipótese salva com sucesso!");
      carregarHipoteses(); setHipoModalOpen(false);
    } catch (err) { toast.error("Erro ao salvar hipótese."); }
  }
  async function handleHipoDelete(id) {
    if (!window.confirm("Excluir hipótese?")) return;
    try { await deletarHipotese(alunoId, id); toast.success("Hipótese excluída."); carregarHipoteses(); }
    catch { toast.error("Erro ao excluir hipótese."); }
  }

  function openDiagModal(mode = "add", item = null) {
    setDiagMode(mode); setDiagModalOpen(true);
    if (mode === "edit" && item) {
      setCurrentDiagId(item.id);
      setDiagForm({ ano: item.ano, materia: item.materia, nota: item.nota, observacoes: item.observacoes || "" });
    } else {
      setCurrentDiagId(null); setDiagForm(initialDiag);
    }
  }
  async function handleDiagSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...diagForm };
      if (diagMode === "add") await criarDiagnostico(alunoId, payload);
      else await atualizarDiagnostico(alunoId, currentDiagId, payload);
      toast.success("Diagnóstico salvo com sucesso!"); carregarDiagnosticos(); setDiagModalOpen(false);
    } catch (err) { toast.error("Erro ao salvar diagnóstico."); }
  }
  async function handleDiagDelete(id) {
    if (!window.confirm("Excluir diagnóstico?")) return;
    try { await deletarDiagnostico(alunoId, id); toast.success("Diagnóstico excluído."); carregarDiagnosticos(); }
    catch { toast.error("Erro ao excluir diagnóstico."); }
  }

  function openAvaModal(mode = "add", item = null) {
    setAvaMode(mode); setAvaModalOpen(true);
    if (mode === "edit" && item) {
      setCurrentAvaId(item.id);
      setAvaForm({ nome: item.nome, data: item.data.split("T")[0], resultado: item.resultado });
    } else {
      setCurrentAvaId(null); setAvaForm(initialAva);
    }
  }
  async function handleAvaSubmit(e) {
    e.preventDefault();
    console.log("Enviando Avaliação Externa:", avaForm);
    try {
      let response;
      if (avaMode === "add") response = await criarAvaliacao(alunoId, avaForm);
      else response = await atualizarAvaliacao(alunoId, currentAvaId, avaForm);
      console.log("Resposta da API:", response);
      toast.success("Avaliação salva com sucesso!");
      carregarAvaliacoes();
      setAvaModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar avaliação externa:", err);
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message;
      toast.error(msg || "Erro ao salvar avaliação externa.");
    }
  }
  async function handleAvaDelete(id) {
    if (!window.confirm("Excluir avaliação?")) return;
    try { await deletarAvaliacao(alunoId, id); toast.success("Avaliação excluída."); carregarAvaliacoes(); }
    catch { toast.error("Erro ao excluir avaliação."); }
  }

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  return (
    <div className="space-y-8">
      {/* Hipóteses de Escrita */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BookOpen className="w-5 h-5" />
            Hipóteses de Escrita
          </CardTitle>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Button variant="outline" size="sm" onClick={() => openHipoModal()}>
              <PlusCircle className="w-4 h-4 mr-2" /> Nova Hipótese
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {hipoError && <div className="p-4 bg-red-50 text-red-600 rounded-md">{hipoError}</div>}
          {hipoLoading ? (
            <p>Carregando...</p>
          ) : hipoteses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hipoteses.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{item.nivel}</TableCell>
                    <TableCell>{item.obs || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                        <button
                          onClick={() => openHipoModal("edit", item)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          title="Editar Hipótese"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {user?.role === "ADMIN" && (
                        <button 
                          onClick={() => handleHipoDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Excluir Hipótese"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhuma hipótese registrada.</p>
          )}
        </CardContent>
      </Card>
      {/* Diagnósticos */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="w-5 h-5" />
            Avaliações Diagnósticas
          </CardTitle>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Button variant="outline" size="sm" onClick={() => openDiagModal()}>
              <PlusCircle className="w-4 h-4 mr-2" /> Novo Diagnóstico
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {diagError && <div className="p-4 bg-red-50 text-red-600 rounded-md">{diagError}</div>}
          {diagLoading ? (
            <p>Carregando...</p>
          ) : diagnosticos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead>Matéria</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosticos.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.ano}</TableCell>
                    <TableCell>{item.materia}</TableCell>
                    <TableCell>{item.nota}</TableCell>
                    <TableCell>{item.observacoes || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                        <button
                          onClick={() => openDiagModal("edit", item)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          title="Editar Diagnóstico"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {user?.role === "ADMIN" && (
                        <button 
                          onClick={() => handleDiagDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Excluir Diagnóstico"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhum diagnóstico registrado.</p>
          )}
        </CardContent>
      </Card>
      {/* Avaliações Externas */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-5 h-5" />
            Avaliações Externas
          </CardTitle>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Button variant="outline" size="sm" onClick={() => openAvaModal()}>
              <PlusCircle className="w-4 h-4 mr-2" /> Nova Avaliação
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {avaError && <div className="p-4 bg-red-50 text-red-600 rounded-md">{avaError}</div>}
          {avaLoading ? (
            <p>Carregando...</p>
          ) : avaliacoes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{item.resultado}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                        <button
                          onClick={() => openAvaModal("edit", item)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          title="Editar Avaliação"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {user?.role === "ADMIN" && (
                        <button 
                          onClick={() => handleAvaDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Excluir Avaliação"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhuma avaliação registrada.</p>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      {/* Hipótese */}
      <Dialog open={hipoModalOpen} onOpenChange={setHipoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hipoMode === "add" ? "Nova Hipótese" : "Editar Hipótese"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHipoSubmit} className="space-y-4">
            <div><Label>Data</Label><Input type="date" value={hipoForm.data} onChange={e => setHipoForm({ ...hipoForm, data: e.target.value })} required/></div>
            <div><Label>Nível</Label><Input value={hipoForm.nivel} onChange={e => setHipoForm({ ...hipoForm, nivel: e.target.value })} required/></div>
            <div><Label>Observações</Label><Input value={hipoForm.obs} onChange={e => setHipoForm({ ...hipoForm, obs: e.target.value })}/></div>
            <DialogFooter><Button type="submit">{hipoMode === "add" ? "Criar" : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Diagnóstico */}
      <Dialog open={diagModalOpen} onOpenChange={setDiagModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{diagMode === "add" ? "Novo Diagnóstico" : "Editar Diagnóstico"}</DialogTitle></DialogHeader>
          <form onSubmit={handleDiagSubmit} className="space-y-4">
            <div><Label>Ano</Label><Input type="number" value={diagForm.ano} onChange={e => setDiagForm({ ...diagForm, ano: Number(e.target.value) })} required/></div>
            <div><Label>Matéria</Label><Input value={diagForm.materia} onChange={e => setDiagForm({ ...diagForm, materia: e.target.value })} required/></div>
            <div><Label>Nota</Label><Input type="number" step="0.01" value={diagForm.nota} onChange={e => setDiagForm({ ...diagForm, nota: Number(e.target.value) })} required/></div>
            <div><Label>Observações</Label><Input value={diagForm.observacoes} onChange={e => setDiagForm({ ...diagForm, observacoes: e.target.value })}/></div>
            <DialogFooter><Button type="submit">{diagMode === "add" ? "Criar" : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Avaliação */}
      <Dialog open={avaModalOpen} onOpenChange={setAvaModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{avaMode === "add" ? "Nova Avaliação" : "Editar Avaliação"}</DialogTitle></DialogHeader>
          <form onSubmit={handleAvaSubmit} className="space-y-4">
            <div><Label>Nome</Label><Input value={avaForm.nome} onChange={e => setAvaForm({ ...avaForm, nome: e.target.value })} required/></div>
            <div><Label>Data</Label><Input type="date" value={avaForm.data} onChange={e => setAvaForm({ ...avaForm, data: e.target.value })} required/></div>
            <div><Label>Resultado</Label><Input value={avaForm.resultado} onChange={e => setAvaForm({ ...avaForm, resultado: e.target.value })} required/></div>
            <DialogFooter><Button type="submit">{avaMode === "add" ? "Criar" : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 