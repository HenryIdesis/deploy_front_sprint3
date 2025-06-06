import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { listarLogsAuditoria, obterEstatisticasAuditoria, reverterCampo } from "../../api/auditoria";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Shield, Activity, Users, Database, Eye, EyeOff, Clock, User, FileText, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const getActionColor = (action) => {
  switch (action) {
    case "CREATE":
      return "bg-green-700 text-white border-green-700";
    case "UPDATE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "DELETE":
      return "bg-red-700 text-white border-red-700";
    case "REVERT":
      return "bg-purple-700 text-white border-purple-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getActionIcon = (action) => {
  switch (action) {
    case "CREATE":
      return <FileText className="w-4 h-4" />;
    case "UPDATE":
      return <FileText className="w-4 h-4" />;
    case "DELETE":
      return <FileText className="w-4 h-4" />;
    case "REVERT":
      return <RotateCcw className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActionText = (action) => {
  switch (action) {
    case "CREATE":
      return "Criação";
    case "UPDATE":
      return "Atualização";
    case "DELETE":
      return "Exclusão";
    case "REVERT":
      return "Reversão";
    default:
      return action;
  }
};

const CollectionName = ({ collection }) => {
  const names = {
    alunos: "Alunos",
    colaboradores: "Colaboradores",
    contraturno: "Contraturno",
    boletins: "Boletins",
    frequencias: "Frequências",
    saude: "Saúde",
    atendimentos: "Atendimentos",
    encaminhamentos: "Encaminhamentos"
  };
  return names[collection] || collection;
};

// Tradução dos campos para português
const fieldTranslations = {
  nome: "Nome",
  sobrenome: "Sobrenome",
  dataNascimento: "Data de Nascimento",
  anoEscolar: "Ano Escolar",
  periodo: "Período",
  endereco: "Endereço",
  contatosResponsaveis: "Contatos dos Responsáveis",
  tagsAtencao: "Tags de Atenção",
  matricula: "Matrícula",
  ra: "RA",
  cpf: "CPF",
  dadosPessoais: "Dados Pessoais",
  fotoAlunoId: "Foto do Aluno",
  lastEditedAt: "Última Edição",
  lastEditedBy: "Editado Por",
  createdAt: "Criado Em",
  createdBy: "Criado Por",
  email: "E-mail",
  fone: "Telefone",
  enderecoCompleto: "Endereço Completo",
  cargoFuncao: "Cargo/Função",
  celular: "Celular",
  titulo: "Título",
  descricao: "Descrição",
  professor: "Professor",
  horario: "Horário",
  vagas: "Vagas",
  categoria: "Categoria",
  status: "Status"
};

const formatValue = (key, value) => {
  if (value === null || value === undefined) {
    return "Não informado";
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "Nenhum";
    if (key === "tagsAtencao") {
      return value.join(", ");
    }
    if (key === "contatosResponsaveis") {
      return value.map(c => `${c.nome} (${c.fone})`).join("; ");
    }
    return value.join(", ");
  }
  
  if (typeof value === "object") {
    if (key === "dadosPessoais") {
      return value.enderecoCompleto || "Não informado";
    }
    return JSON.stringify(value, null, 2);
  }
  
  if (key === "dataNascimento") {
    try {
      return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return value;
    }
  }
  
  if (key.includes("At")) {
    try {
      return format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return value;
    }
  }
  
  return String(value);
};

const DataDiff = ({ beforeData, afterData, changes, action, collection, documentId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [confirmingRevert, setConfirmingRevert] = useState(null);
  const queryClient = useQueryClient();

  // Mutation para reverter campo
  const revertMutation = useMutation({
    mutationFn: reverterCampo,
    onSuccess: () => {
      // Recarregar lista de logs
      queryClient.invalidateQueries(["audit-logs"]);
      setConfirmingRevert(null);
      alert("Campo revertido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao reverter campo:", error);
      setConfirmingRevert(null);
      alert("Erro ao reverter campo: " + (error.response?.data?.detail || error.message));
    }
  });

  const handleRevert = (fieldName, previousValue) => {
    if (confirmingRevert === fieldName) {
      // Confirmar reversão
      revertMutation.mutate({
        collection,
        documentId,
        fieldName,
        previousValue
      });
    } else {
      // Mostrar confirmação
      setConfirmingRevert(fieldName);
    }
  };

  const cancelRevert = () => {
    setConfirmingRevert(null);
  };

  if (!beforeData && !afterData) return null;

  // Para CREATE, mostrar apenas dados criados
  if (action === "CREATE") {
    return (
      <div className="mt-3 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="mb-2 text-xs"
        >
          {showDetails ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {showDetails ? "Ocultar" : "Ver"} Dados Criados
        </Button>

        {showDetails && afterData && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Dados do novo registro:</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(afterData)
                .filter(([key]) => !key.startsWith('_') && !['createdAt', 'createdBy', 'lastEditedAt', 'lastEditedBy'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                      {fieldTranslations[key] || key}:
                    </span>
                    <span className="text-gray-600">{formatValue(key, value)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Para DELETE, mostrar apenas dados excluídos
  if (action === "DELETE") {
    return (
      <div className="mt-3 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="mb-2 text-xs"
        >
          {showDetails ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {showDetails ? "Ocultar" : "Ver"} Dados Excluídos
        </Button>

        {showDetails && beforeData && (
          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Dados do registro excluído:</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(beforeData)
                .filter(([key]) => !key.startsWith('_') && !['createdAt', 'createdBy', 'lastEditedAt', 'lastEditedBy'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                      {fieldTranslations[key] || key}:
                    </span>
                    <span className="text-gray-600">{formatValue(key, value)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Para UPDATE e REVERT, mostrar apenas campos alterados
  if ((action === "UPDATE" || action === "REVERT") && changes && changes.length > 0) {
    return (
      <div className="mt-3 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="mb-2 text-xs"
        >
          {showDetails ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          {showDetails ? "Ocultar" : "Ver"} {action === "REVERT" ? "Reversão" : "Alterações"} ({changes.length} {changes.length === 1 ? 'campo' : 'campos'})
        </Button>

        {showDetails && (
          <div className="space-y-3">
            {changes
              .filter(field => !['createdAt', 'createdBy', 'lastEditedAt', 'lastEditedBy'].includes(field))
              .map((field) => {
                const beforeValue = beforeData?.[field];
                const afterValue = afterData?.[field];
                const isConfirming = confirmingRevert === field;
                
                return (
                  <div key={field} className={`${action === "REVERT" ? "bg-purple-50" : "bg-blue-50"} p-3 rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-medium ${action === "REVERT" ? "text-purple-800" : "text-blue-800"}`}>
                        {fieldTranslations[field] || field}
                      </div>
                      {action === "UPDATE" && (
                        <div className="flex gap-2">
                          {isConfirming ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelRevert}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRevert(field, beforeValue)}
                                disabled={revertMutation.isPending}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Confirmar Reversão
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevert(field, beforeValue)}
                              disabled={revertMutation.isPending}
                              className="text-xs px-2 py-1 h-auto hover:bg-orange-50 hover:border-orange-300"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Reverter
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isConfirming && (
                      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Tem certeza que deseja reverter este campo? Esta ação criará um novo log de auditoria.
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex-1">
                        <div className="text-red-700 font-medium mb-1">
                          {action === "REVERT" ? "Valor Anterior:" : "Antes:"}
                        </div>
                        <div className="bg-red-100 p-2 rounded text-red-800">
                          {formatValue(field, beforeValue)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-green-700 font-medium mb-1">
                          {action === "REVERT" ? "Valor Revertido:" : "Depois:"}
                        </div>
                        <div className="bg-green-100 p-2 rounded text-green-800">
                          {formatValue(field, afterValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default function AuditoriaPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 20;

  // Verificar se é ADMIN
  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Buscar logs de auditoria
  const { data: logsData, isLoading: isLoadingLogs, error: errorLogs } = useQuery({
    queryKey: ["audit-logs", currentPage],
    queryFn: () => listarLogsAuditoria({ limit, skip: currentPage * limit }),
  });

  // Buscar estatísticas
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["audit-stats"],
    queryFn: obterEstatisticasAuditoria,
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit);

  if (errorLogs) {
    return (
      <div className="flex-1 p-4 md:p-12">
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar logs de auditoria: {errorLogs.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-dark" />
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Auditoria</h1>
            <p className="text-gray-600">Registro de todas as alterações no sistema</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {statsData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.userStats?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.collectionStats?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Páginas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPages}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Últimas Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum log de auditoria encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getActionColor(log.action)}>
                            {getActionText(log.action)}
                          </Badge>
                          <Badge variant="outline">
                            <CollectionName collection={log.collection} />
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{log.changedBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(log.changedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Documento ID:</span> {log.documentId}
                        </div>

                        <DataDiff 
                          beforeData={log.beforeData}
                          afterData={log.afterData}
                          changes={log.changes}
                          action={log.action}
                          collection={log.collection}
                          documentId={log.documentId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {currentPage * limit + 1} a {Math.min((currentPage + 1) * limit, totalLogs)} de {totalLogs} registros
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 