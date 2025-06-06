import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listarContraturnos } from "../../api/contraturno";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useParams } from "react-router-dom";

export default function ContraturnoListPage() {
  // Pegar o ID do aluno da URL
  const { alunoId } = useParams();
  
  const { data: contraturnos = [], isLoading } = useQuery({ 
    queryKey: ["contraturno"], 
    queryFn: listarContraturnos 
  });

  if (isLoading) return <p>Carregando contraturnos...</p>;
  if (!alunoId) return null;

  // Filtrar contraturnos apenas do aluno específico que está sendo visualizado
  const contratrunosDoAluno = contraturnos.filter(contraturno => 
    contraturno.alunosInscritos && contraturno.alunosInscritos.includes(alunoId)
  );

  if (contratrunosDoAluno.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Atividades de Contraturno
        </h1>
        <Card className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-600">Este aluno não está inscrito em nenhum contraturno.</p>
          <p className="text-gray-600 mt-2">Entre em contato com a coordenação para inscrever o aluno.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        <span className="inline-block mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        Atividades de Contraturno
      </h1>
      <div className="grid gap-6">
        {contratrunosDoAluno.map((contraturno) => (
          <Card key={contraturno._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-blue-700">{contraturno.titulo}</h2>
                <Badge className="bg-blue-600 text-white px-2 py-1 rounded">
                  {contraturno.status}
                </Badge>
              </div>

              <div className="text-gray-600 mb-4">
                {contraturno.horario}
              </div>

              <div className="grid gap-4">
                <div>
                  <div className="font-semibold text-gray-700">Período:</div>
                  <div className="text-gray-600">{contraturno.periodo}</div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Responsável:</div>
                  <div className="text-gray-600">{contraturno.professor}</div>
                </div>

                <div>
                  <div className="font-semibold text-gray-700">Objetivo:</div>
                  <div className="text-gray-600">{contraturno.descricao}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="font-semibold text-gray-700">Frequência:</div>
                    <div className="text-gray-600">
                      {contraturno.frequencia?.porcentagem || "0"}% 
                      ({contraturno.frequencia?.presencas || "0"}/{contraturno.frequencia?.total || "0"} aulas)
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-gray-700">Progresso:</div>
                    <div>
                      <Badge 
                        className={`${
                          contraturno.progresso === "Bom" ? "bg-green-500" :
                          contraturno.progresso === "Excelente" ? "bg-blue-600" :
                          "bg-yellow-500"
                        } text-white px-2 py-1 rounded`}
                      >
                        {contraturno.progresso || "Em andamento"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 