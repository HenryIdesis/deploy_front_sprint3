import { useParams, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import DadosGeraisTab from "./tabs/DadosGeraisTab";
import BoletinsTab from "./tabs/BoletinsTab";
import FrequenciaTab from "./tabs/FrequenciaTab";
import ContraturnoTab from "./tabs/ContraturnoTab";
import SaudeTab from "./tabs/SaudeTab";
import AtendimentosTab from "./tabs/AtendimentosTab";
import PlaceholderTab from "./tabs/PlaceholderTab";
import EncaminhamentosTab from "./tabs/EncaminhamentosTab";
import HistoricoEscolarTab from "./tabs/HistoricoEscolarTab";
import AlunoNavigation from "./AlunoNavigation";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Pencil, Trash2, AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAluno, deleteAluno } from "../../api/alunos";
import Comunicado from "../../components/Comunicado";

export default function AlunoDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const { data: aluno, isLoading: isLoadingAluno, error: errorAluno } = useQuery({
    queryKey: ["aluno", id],
    queryFn: () => getAluno(id),
    enabled: !!id,
  });

  useEffect(() => {
    console.log('Dados do aluno carregados:', aluno);
  }, [aluno]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteAluno(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["alunos"]);
      queryClient.removeQueries(["aluno", id]);
      setShowDeleteModal(false);
      setDeleteConfirmationText("");
      navigate("/alunos");
    },
    onError: (error) => {
      alert("Erro ao excluir aluno: " + error.message);
      setShowDeleteModal(false);
    },
  });

  if (!id) {
    return <div className="p-6">ID do aluno inválido.</div>;
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const canDelete = user?.role === "ADMIN";

  const handleDeleteConfirm = () => {
    if (aluno && deleteConfirmationText === `${aluno.nome} ${aluno.sobrenome}`) {
      deleteMutation.mutate();
    } else {
      alert("Nome de confirmação incorreto.");
    }
  };

  const tabs = [
    { path: "dados-gerais", element: <DadosGeraisTab alunoId={id} /> },
    { path: "boletins", element: <BoletinsTab alunoId={id} /> },
    { path: "frequencia", element: <FrequenciaTab alunoId={id} /> },
    { path: "saude", element: <SaudeTab alunoId={id} /> },
    { path: "atendimentos", element: <AtendimentosTab alunoId={id} /> },
    { path: "contraturno", element: <ContraturnoTab alunoId={id} /> },
    { path: "historico-escolar", element: <HistoricoEscolarTab alunoId={id} /> },
    { path: "enviar-comunicado", element: aluno ? <Comunicado aluno={aluno} /> : <div>Carregando...</div> },
    { path: "encaminhamentos-rede-protecao", element: <EncaminhamentosTab alunoId={id} /> },
  ];

  const isDetailView = location.pathname === `/alunos/${id}`;

  const handleBack = () => {
    if (isDetailView) {
      navigate("/alunos");
    } else {
      navigate(`/alunos/${id}/summary`);
    }
  };

  if (isLoadingAluno) {
    return <div className="p-6">Carregando dados do aluno...</div>;
  }

  if (errorAluno) {
    return <div className="p-6 text-red-500">Erro ao carregar dados do aluno: {errorAluno.message}</div>;
  }
  
  if (!aluno) {
    return <div className="p-6">Aluno não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              className="flex items-center bg-primary text-white hover:bg-primary/90 transition-colors rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> 
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-primary-dark">
              {aluno.nome} {aluno.sobrenome}
            </h1>
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <Link to={`/alunos/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4 mr-2" /> Editar Aluno
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Apagar Aluno
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 border-b">
        <AlunoNavigation />
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="dados-gerais" />} />
          {tabs.map((t) => (
            <Route key={t.path} path={t.path} element={React.cloneElement(t.element, { aluno })} />
          ))}
        </Routes>
      </div>

      {showDeleteModal && canDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mr-3" />
                <h2 className="text-xl font-bold text-red-600">Confirmar Exclusão Permanente</h2>
            </div>
            <p className="text-gray-700 mb-1">
              Você tem certeza que deseja excluir permanentemente o aluno 
              <strong className="text-gray-900"> {aluno.nome} {aluno.sobrenome}</strong>?
            </p>
            <p className="text-sm text-gray-600 mb-4">Esta ação não poderá ser desfeita. Para confirmar, digite o nome completo do aluno abaixo.</p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="border rounded w-full p-2 mb-4 focus:ring-red-500 focus:border-red-500"
              placeholder="Digite o nome completo do aluno"
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmationText !== `${aluno.nome} ${aluno.sobrenome}` || deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? "Excluindo..." : "Excluir Permanentemente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 