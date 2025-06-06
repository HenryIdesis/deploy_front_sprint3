import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Clock } from "lucide-react";
import { listarContraturnos } from "../../../api/contraturno";


export default function ContraturnoTab() {
  const { id: alunoId } = useParams();

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

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  if (isLoading) {
    return <div className="p-4">Carregando contraturnos...</div>;
  }


  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar contraturnos: {error.message}</div>;
  }

  if (contraturnosDoAluno.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Atividades de Contraturno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600 py-8">
              <p>Este aluno não está inscrito em nenhum projeto de contraturno.</p>
              <p className="mt-2">Para inscrevê-lo, acesse a área de Contraturno no menu principal e adicione o aluno ao projeto desejado.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atividades de Contraturno Inscritas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {contraturnosDoAluno.map(contraturno => (
              <div key={contraturno._id || contraturno.id} className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{contraturno.titulo}</h4>
                      {contraturno.horario && <p className="text-sm text-gray-600">{contraturno.horario}</p>}
                      {contraturno.categoria && <Badge variant="outline" className="mt-1">{contraturno.categoria}</Badge>}
                    </div>
                    {contraturno.status && (
                       <Badge className={`whitespace-nowrap ${
                        contraturno.status === "Ativo" ? "bg-green-100 text-green-800" : 
                        contraturno.status === "Encerrado" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {contraturno.status}
                      </Badge>
                    )}
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
        </CardContent>
      </Card>
    </div>
  );
} 