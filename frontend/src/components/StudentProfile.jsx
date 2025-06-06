import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { FileText, Mail, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const StudentProfile = ({ aluno, onEdit }) => {
  if (!aluno) return null;
  const { user } = useAuth();

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Linha única para dois cards: Informações Acadêmicas e Dados Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Acadêmicas */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-primary-dark">Informações Acadêmicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Matrícula:</span>
              <Badge className="bg-blue-100 text-primary">{aluno.matricula || "—"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">RA:</span>
              <Badge className="bg-green-100 text-green-800">{aluno.ra || "—"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ano Escolar:</span>
              <Badge className="bg-blue-100 text-primary">{aluno.anoEscolar}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Período:</span>
              <Badge className="bg-blue-100 text-primary">{aluno.periodo || "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-primary-dark">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Data de Nascimento:</span>
              <span className="font-medium">
                {new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")} ({calculateAge(aluno.dataNascimento)} anos)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">CPF:</span>
              <span className="font-medium">{aluno.cpf || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Endereço:</span>
              <span className="font-medium">{aluno.dadosPessoais?.enderecoCompleto || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha: Contatos dos Responsáveis */}
      <Card className="border-secondary">
        <CardHeader>
          <CardTitle className="text-primary-dark">Contatos dos Responsáveis</CardTitle>
        </CardHeader>
        <CardContent>
          {aluno.contatosResponsaveis?.length > 0 ? (
            <div className="space-y-4">
              {aluno.contatosResponsaveis.map((contato, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{contato.nome}</p>
                    <p className="text-sm text-gray-600">{contato.fone}</p>
                    {contato.email && <p className="text-sm text-gray-600">{contato.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhum contato cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 