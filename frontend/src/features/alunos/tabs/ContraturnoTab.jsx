import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Clock, Trash2, Plus, Users } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { 
  listarContraturnos, 
  cancelarInscricaoContraturno, 
  inscreverAlunoContraturno 
} from "../../../api/contraturno";

export default function ContraturnoTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);

  const { data: todosContraturnos = [], isLoading, error } = useQuery({
    queryKey: ["contraturnos"],
    queryFn: listarContraturnos,
  });

  const contraturnosDoAluno = React.useMemo(() => {
    if (!alunoId || !todosContraturnos || todosContraturnos.length === 0) {
      return [];
    }
    return todosContraturnos.filter(ct => 
      ct.alunosInscritos && ct.alunosInscritos.includes(alunoId)
    );
  }, [alunoId, todosContraturnos]);

  const contraturnosDisponiveis = React.useMemo(() => {
    if (!alunoId || !todosContraturnos || todosContraturnos.length === 0) {
      return [];
    }
    return todosContraturnos.filter(ct => 
      ct.status === "Ativo" && 
      (!ct.alunosInscritos || !ct.alunosInscritos.includes(alunoId)) &&
      (!ct.vagas || ct.alunosInscritos?.length < ct.vagas)
    );
  }, [alunoId, todosContraturnos]);

  // Mutation para remover aluno do contraturno
  const removerInscricaoMutation = useMutation({
    mutationFn: ({ contraturnoId }) => cancelarInscricaoContraturno(contraturnoId, alunoId),
    onSuccess: () => {
      queryClient.invalidateQueries(["contraturnos"]);
    },
    onError: (error) => {
      alert("Erro ao remover inscrição: " + (error.response?.data?.detail || error.message));
    }
  });

  // Mutation para adicionar aluno ao contraturno
  const adicionarInscricaoMutation = useMutation({
    mutationFn: ({ contraturnoId }) => inscreverAlunoContraturno(contraturnoId, alunoId),
    onSuccess: () => {
      queryClient.invalidateQueries(["contraturnos"]);
      setShowAdicionarModal(false);
    },
    onError: (error) => {
      alert("Erro ao adicionar inscrição: " + (error.response?.data?.detail || error.message));
    }
  });

  const handleRemoverInscricao = (contraturno) => {
    if (window.confirm(`Tem certeza que deseja remover este aluno do contraturno "${contraturno.titulo}"?`)) {
      removerInscricaoMutation.mutate({ contraturnoId: contraturno._id || contraturno.id });
    }
  };

  const handleAdicionarInscricao = (contraturno) => {
    adicionarInscricaoMutation.mutate({ contraturnoId: contraturno._id || contraturno.id });
  };

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  if (isLoading) {
    return <div className="p-4">Carregando contraturnos...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar contraturnos: {error.message}</div>;
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const canDelete = user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Atividades de Contraturno
            </CardTitle>
            {canEdit && contraturnosDisponiveis.length > 0 && (
              <Button 
                onClick={() => setShowAdicionarModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Contraturno
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contraturnosDoAluno.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="font-medium">Este aluno não está inscrito em nenhum projeto de contraturno.</p>
              {canEdit && contraturnosDisponiveis.length > 0 ? (
                <Button 
                  onClick={() => setShowAdicionarModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Inscrever em Contraturno
                </Button>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  {contraturnosDisponiveis.length === 0 
                    ? "Não há contraturnos disponíveis no momento."
                    : "Para inscrevê-lo, acesse a área de Contraturno no menu principal."
                  }
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contraturnosDoAluno.map(contraturno => (
                <div key={contraturno._id || contraturno.id} className="border rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{contraturno.titulo}</h4>
                        {contraturno.horario && <p className="text-sm text-gray-600">{contraturno.horario}</p>}
                        {contraturno.categoria && <Badge variant="outline" className="mt-1">{contraturno.categoria}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {contraturno.status && (
                          <Badge className={`whitespace-nowrap ${
                            contraturno.status === "Ativo" ? "bg-green-100 text-green-800" : 
                            contraturno.status === "Encerrado" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {contraturno.status}
                          </Badge>
                        )}
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoverInscricao(contraturno)}
                            className="text-red-600 hover:bg-red-50"
                            title="Remover do contraturno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm mb-4">
                      {contraturno.periodo && <div><strong>Período:</strong> {contraturno.periodo}</div>}
                      {contraturno.professor && <div><strong>Responsável:</strong> {contraturno.professor}</div>}
                      {contraturno.descricao && <p className="mt-2"><strong>Objetivo:</strong> {contraturno.descricao}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t pt-3 mt-3">
                    {contraturno.frequencia && (
                      <div className="flex justify-between text-sm">
                        <span>Frequência:</span>
                        <span className="font-medium">
                          {contraturno.frequencia?.porcentagem || "N/A"}% 
                          ({contraturno.frequencia?.presencas || "0"}/{contraturno.frequencia?.total || "0"} aulas)
                        </span>
                      </div>
                    )}
                    {contraturno.progresso && (
                      <div className="flex justify-between text-sm">
                        <span>Progresso:</span>
                        <Badge className={`whitespace-nowrap ${
                          contraturno.progresso === "Bom" ? "bg-blue-100 text-blue-800" :
                          contraturno.progresso === "Excelente" ? "bg-green-100 text-green-800" :
                          contraturno.progresso === "Regular" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {contraturno.progresso}
                        </Badge>
                      </div>
                    )}
                    {!contraturno.frequencia && !contraturno.progresso && (
                      <p className="text-xs text-gray-500">Informações de frequência e progresso não disponíveis para este contraturno.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Adicionar Contraturno */}
      {showAdicionarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Adicionar em Contraturno</h3>
              <Button
                variant="outline"
                onClick={() => setShowAdicionarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Selecione um contraturno para inscrever este aluno:
              </p>
              
              {contraturnosDisponiveis.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Não há contraturnos disponíveis para inscrição no momento.</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {contraturnosDisponiveis.map(contraturno => (
                    <div key={contraturno._id || contraturno.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{contraturno.titulo}</h4>
                          <div className="space-y-1 text-sm text-gray-600 mt-1">
                            {contraturno.horario && <div><strong>Horário:</strong> {contraturno.horario}</div>}
                            {contraturno.professor && <div><strong>Responsável:</strong> {contraturno.professor}</div>}
                            {contraturno.categoria && (
                              <Badge variant="outline" className="mt-1">{contraturno.categoria}</Badge>
                            )}
                            {contraturno.vagas && (
                              <div className="text-xs text-blue-600">
                                Vagas: {contraturno.alunosInscritos?.length || 0}/{contraturno.vagas}
                              </div>
                            )}
                          </div>
                          {contraturno.descricao && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{contraturno.descricao}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAdicionarInscricao(contraturno)}
                          disabled={adicionarInscricaoMutation.isLoading}
                          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {adicionarInscricaoMutation.isLoading ? "Inscrevendo..." : "Inscrever"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAdicionarModal(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 