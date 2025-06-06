import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContraturno, deletarContraturno } from "../../api/contraturno";
import { listarAlunos } from "../../api/alunos";
import { listarColaboradores } from "../../api/colaboradores";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Palette, Music, Calculator, Leaf, Film, Crown, BookOpen, Target, Edit, Trash2, ArrowLeft } from "lucide-react";

// Mapeamento de categorias para ícones e cores
const CATEGORIAS = {
  "Arte": { icone: Palette, cor: "text-purple-600" },
  "Literatura": { icone: BookOpen, cor: "text-blue-600" },
  "Música": { icone: Music, cor: "text-pink-600" },
  "Exatas": { icone: Calculator, cor: "text-green-600" },
  "Sustentabilidade": { icone: Leaf, cor: "text-emerald-600" },
  "Cultura": { icone: Film, cor: "text-orange-600" },
  "Estratégia": { icone: Crown, cor: "text-yellow-600" }
};

export default function ContraturnoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  console.log("ID do projeto na página de detalhes:", id);

  // Redireciona se o ID for inválido
  React.useEffect(() => {
    if (!id) {
      console.error("ID não fornecido");
      navigate("/contraturno");
    }
  }, [id, navigate]);

  const { data: projeto, isLoading, error } = useQuery({
    queryKey: ["contraturno", id],
    queryFn: () => getContraturno(id),
    enabled: !!id,
    retry: false
  });

  console.log("Dados do projeto:", projeto);
  console.log("Erro na requisição:", error);

  const { data: allAlunos = [] } = useQuery({
    queryKey: ["alunos"],
    queryFn: listarAlunos
  });

  const { data: allColaboradores = [] } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: listarColaboradores
  });

  const [toDelete, setToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: (id) => deletarContraturno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contraturno"] });
      navigate("/contraturno");
    },
  });

  if (isLoading || !projeto) return <p>Carregando...</p>;

  const { icone: CategoriaIcon = Target, cor = "text-gray-600" } = CATEGORIAS[projeto.categoria] || {};

  const getProfessorNome = (professorId) => {
    if (!professorId) return "Não informado";
    const professor = allColaboradores.find(colab => colab.id === professorId);
    return professor ? professor.nome : "Professor não encontrado";
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/contraturno")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-primary-dark">Detalhes do Projeto</h2>
        </div>
        <div className="flex space-x-2">
          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <Button variant="outline" onClick={() => navigate(`/contraturno/${id}/edit`)}>
              Editar
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setToDelete(projeto)}
            >
              Excluir
            </Button>
          )}
        </div>
      </div>

      <Card className="border-secondary">
        <CardHeader>
          <CardTitle className="text-primary-dark">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Título:</strong> {projeto.titulo}</p>
          <p><strong>Descrição:</strong> {projeto.descricao || '—'}</p>
          <p><strong>Professor:</strong> {getProfessorNome(projeto.professor)}</p>
          <p><strong>Horário:</strong> {projeto.horario}</p>
          <p><strong>Vagas:</strong> {projeto.vagas}</p>
          <p><strong>Categoria:</strong> {projeto.categoria}</p>
          <p><strong>Status:</strong> {projeto.status}</p>
        </CardContent>
      </Card>

      <Card className="border-secondary">
        <CardHeader>
          <CardTitle className="text-primary-dark">Alunos Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          {projeto.alunosInscritos.length === 0 ? (
            <p>Nenhum aluno inscrito.</p>
          ) : (
            <div className="space-y-2">
              {projeto.alunosInscritos.map((alunoId) => {
                const aluno = allAlunos.find((a) => a.id === alunoId);
                return (
                  <div key={alunoId} className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                    <span className="font-medium">
                      {aluno ? `${aluno.nome} ${aluno.sobrenome}` : "Aluno não encontrado"}
                    </span>
                    {aluno && (
                      <Badge variant="outline" className="text-xs">
                        {aluno.anoEscolar}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {toDelete && user?.role === 'ADMIN' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar exclusão</h3>
            <p>Digite o título do projeto <strong>{toDelete.titulo}</strong> para confirmar:</p>
            <Input
              className="my-4"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setToDelete(null); setConfirmText(""); }}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                disabled={confirmText !== toDelete.titulo}
                onClick={() => deleteMutation.mutate(toDelete.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 