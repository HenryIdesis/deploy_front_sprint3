import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { PlusCircle, Edit, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  listarEncaminhamentos,
  criarEncaminhamento,
  atualizarEncaminhamento,
  deletarEncaminhamento,
} from "../../../api/encaminhamentos";
import { toast } from "sonner";

const initialFormData = {
  data: "",
  destino: "",
  motivo: "",
  status: "",
  resultado: "",
  followUpDate: "",
};

export default function EncaminhamentosTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const [encaminhamentos, setEncaminhamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  async function carregarEncaminhamentos() {
    if (!alunoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarEncaminhamentos(alunoId);
      setEncaminhamentos(data || []);
    } catch (err) {
      console.error("Erro ao listar encaminhamentos:", err);
      setError("Falha ao carregar encaminhamentos. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarEncaminhamentos();
  }, [alunoId]);

  const openModal = (mode = "add", item = null) => {
    setModalMode(mode);
    setIsModalOpen(true);
    if (mode === "edit" && item) {
      setCurrentId(item._id);
      setFormData({
        data: item.data ? item.data.split("T")[0] : "",
        destino: item.destino || "",
        motivo: item.motivo || "",
        status: item.status || "",
        resultado: item.resultado || "",
        followUpDate: item.followUpDate ? item.followUpDate.split("T")[0] : "",
      });
    } else {
      setCurrentId(null);
      setFormData(initialFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alunoId) return;
    try {
      if (modalMode === "add") {
        await criarEncaminhamento(alunoId, formData);
        toast.success("Encaminhamento criado com sucesso!");
      } else {
        await atualizarEncaminhamento(alunoId, currentId, formData);
        toast.success("Encaminhamento atualizado com sucesso!");
      }
      carregarEncaminhamentos();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar encaminhamento:", err);
      toast.error("Erro ao salvar encaminhamento. Tente novamente.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este encaminhamento?")) return;
    try {
      await deletarEncaminhamento(alunoId, id);
      toast.success("Encaminhamento excluído com sucesso!");
      carregarEncaminhamentos();
    } catch (err) {
      console.error("Erro ao excluir encaminhamento:", err);
      toast.error("Erro ao excluir encaminhamento. Tente novamente.");
    }
  };

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Carregando encaminhamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ShieldAlert className="w-5 h-5" />
            Encaminhamentos para Rede de Proteção
          </CardTitle>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <Button variant="outline" size="sm" onClick={() => openModal()}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Encaminhamento
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}
          {encaminhamentos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Follow Up</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {encaminhamentos.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{item.destino}</TableCell>
                      <TableCell>{item.motivo}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.resultado || "-"}</TableCell>
                      <TableCell>{item.followUpDate ? new Date(item.followUpDate).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                          <button
                            onClick={() => openModal("edit", item)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            title="Editar Encaminhamento"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {user?.role === "ADMIN" && (
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Excluir Encaminhamento"
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
            <div className="p-6 text-center bg-gray-50 rounded-lg">Nenhum encaminhamento encontrado.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalMode === "add" ? "Novo Encaminhamento" : "Editar Encaminhamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Data</Label>
              <Input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            </div>
            <div>
              <Label>Destino</Label>
              <Input value={formData.destino} onChange={(e) => setFormData({ ...formData, destino: e.target.value })} required />
            </div>
            <div>
              <Label>Motivo</Label>
              <Input value={formData.motivo} onChange={(e) => setFormData({ ...formData, motivo: e.target.value })} required />
            </div>
            <div>
              <Label>Status</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Resultado</Label>
              <Input value={formData.resultado} onChange={(e) => setFormData({ ...formData, resultado: e.target.value })} />
            </div>
            <div>
              <Label>Follow Up</Label>
              <Input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="submit">{modalMode === "add" ? "Criar" : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 