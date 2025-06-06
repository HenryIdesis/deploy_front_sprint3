import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarAlunos, deleteAluno } from "../../api/alunos";
import { listarFrequencias } from "../../api/frequencias";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "../../components/ui/table";
import { User, Plus, Search, Eye, GraduationCap, Users, AlertTriangle, Star, Trash2, Edit, Activity, Filter } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AlunoListPage() {
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({ queryKey: ["alunos"], queryFn: listarAlunos });
  const [searchTerm, setSearchTerm] = useState("");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filtroBaixaFrequenciaAtivo, setFiltroBaixaFrequenciaAtivo] = useState(false);
  const [percentualFiltroFrequencia, setPercentualFiltroFrequencia] = useState(75);
  const [alunosComBaixaFrequenciaIds, setAlunosComBaixaFrequenciaIds] = useState(new Set());
  const [isLoadingFrequenciaData, setIsLoadingFrequenciaData] = useState(false);
  const [frequenciaStatusPorAluno, setFrequenciaStatusPorAluno] = useState(new Map());
  const [filtroPeriodo, setFiltroPeriodo] = useState("Todos");

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAluno(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["alunos"]);
      setStudentToDelete(null);
      setDeleteConfirmationText("");
    },
    onError: (error) => {
      alert("Erro ao excluir aluno: " + error.message);
    },
  });

  useEffect(() => {
    if (students.length > 0) {
      const carregarDadosFrequencia = async () => {
        setIsLoadingFrequenciaData(true);
        const frequenciaMap = new Map();
        const idsBaixaFrequencia = new Set();
        
        try {
          const promises = students.map(async (aluno) => {
            try {
              const frequenciasDoAluno = await listarFrequencias(aluno.id);
              if (frequenciasDoAluno && frequenciasDoAluno.length > 0) {
                // Encontra o registro do último ano
                const ultimoRegistroAnual = frequenciasDoAluno.reduce((ult, atual) => {
                  return (ult.ano || 0) > (atual.ano || 0) ? ult : atual;
                });

                const percentPresenca = ultimoRegistroAnual.percentPresenca || 0;
                frequenciaMap.set(aluno.id, percentPresenca);
                
                // Se a frequência for menor que 75%, adiciona na lista de baixa frequência
                if (percentPresenca < 75) {
                  idsBaixaFrequencia.add(aluno.id);
                }
              }
            } catch (error) {
              console.error(`Erro ao carregar frequência do aluno ${aluno.id}:`, error);
            }
          });
          
          await Promise.all(promises);
          setFrequenciaStatusPorAluno(frequenciaMap);
          setAlunosComBaixaFrequenciaIds(idsBaixaFrequencia);
        } catch (error) {
          console.error("Erro ao processar frequências:", error);
        } finally {
          setIsLoadingFrequenciaData(false);
        }
      };
      
      carregarDadosFrequencia();
    }
  }, [students]);

  useEffect(() => {
    if (filtroBaixaFrequenciaAtivo && students.length > 0) {
      const fetchFrequenciasEFiltrar = async () => {
        setIsLoadingFrequenciaData(true);
        const idsBaixaFrequencia = new Set();
        try {
          const promises = students.map(async (aluno) => {
            try {
              const frequenciasDoAluno = await listarFrequencias(aluno.id);
              if (frequenciasDoAluno && frequenciasDoAluno.length > 0) {
                const ultimoRegistroAnual = frequenciasDoAluno.reduce((ult, atual) => {
                  return (ult.ano || 0) > (atual.ano || 0) ? ult : atual;
                });

                if (ultimoRegistroAnual && ultimoRegistroAnual.percentPresenca < percentualFiltroFrequencia) {
                  idsBaixaFrequencia.add(aluno.id);
                }
              }
            } catch (error) {
              console.error(`Erro ao carregar frequência do aluno ${aluno.id}:`, error);
            }
          });
          await Promise.all(promises);
          setAlunosComBaixaFrequenciaIds(idsBaixaFrequencia);
        } catch (error) {
          console.error("Erro ao processar frequências para filtro:", error);
        } finally {
          setIsLoadingFrequenciaData(false);
        }
      };
      fetchFrequenciasEFiltrar();
    } else if (!filtroBaixaFrequenciaAtivo) {
      const carregarDadosFrequenciaBase = async () => {
        if (students.length > 0) {
          const idsBaixaFrequencia = new Set();
          try {
            const promises = students.map(async (aluno) => {
              try {
                const frequenciasDoAluno = await listarFrequencias(aluno.id);
                if (frequenciasDoAluno && frequenciasDoAluno.length > 0) {
                  const ultimoRegistroAnual = frequenciasDoAluno.reduce((ult, atual) => {
                    return (ult.ano || 0) > (atual.ano || 0) ? ult : atual;
                  });

                  if (ultimoRegistroAnual && ultimoRegistroAnual.percentPresenca < 75) {
                    idsBaixaFrequencia.add(aluno.id);
                  }
                }
              } catch (error) {
                console.error(`Erro ao carregar frequência do aluno ${aluno.id}:`, error);
              }
            });
            await Promise.all(promises);
            setAlunosComBaixaFrequenciaIds(idsBaixaFrequencia);
          } catch (error) {
            console.error("Erro ao processar frequências:", error);
          }
        }
      };
      carregarDadosFrequenciaBase();
    }
  }, [filtroBaixaFrequenciaAtivo, students, percentualFiltroFrequencia]);

  const baseFilteredStudents = students.filter(
    (student) =>
      (student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.matricula && student.matricula.includes(searchTerm)) ||
      (student.anoEscolar && student.anoEscolar.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filtroPeriodo === "Todos" || student.periodo === filtroPeriodo)
  );

  const finalFilteredStudents = filtroBaixaFrequenciaAtivo
    ? baseFilteredStudents.filter(student => alunosComBaixaFrequenciaIds.has(student.id))
    : baseFilteredStudents;

  const calculateAge = (dateString) => {
    if (!dateString) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getTagColor = (tag) => {
    if (!tag) return "bg-gray-100 text-gray-800 border-gray-200";
    if (tag.toLowerCase().includes("problema")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (tag === "Baixa frequência") {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    switch (tag) {
      case "Necessita Atenção":
        return "bg-red-100 text-red-800 border-red-200";
      case "Destaque Acadêmico":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAlunoTags = (student) => {
    const tagsOriginais = student.tagsAtencao || [];
    const tagsComFrequencia = [...tagsOriginais];
    
    if (alunosComBaixaFrequenciaIds.has(student.id) && 
        !tagsComFrequencia.some(tag => tag === "Baixa frequência")) {
      tagsComFrequencia.push("Baixa frequência");
    }
    
    return tagsComFrequencia;
  };

  const canCreateEdit = user?.role === "ADMIN" || user?.role === "EDITOR";
  const canDelete = user?.role === "ADMIN";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark flex items-center gap-2">
            <GraduationCap className="w-8 h-8" /> Alunos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os alunos cadastrados no sistema</p>
        </div>
        {canCreateEdit && (
          <Link to="/alunos/novo">
            <Button className="bg-primary hover:bg-primary/90 text-white flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Novo Aluno
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <Card className="border-2 border-secondary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-primary-dark">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Com Atenção Especial</p>
                <p className="text-2xl font-bold text-primary-dark">
                  {students.filter((s) => s.tagsAtencao.length > 0).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

      </div>

      <Card className="border-2 border-secondary">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto min-w-0 sm:min-w-[300px] md:min-w-[400px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, sobrenome, matrícula ou ano escolar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-accent focus:ring-accent w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Filtro por Período */}
            <div className="flex items-center space-x-2">
              <label htmlFor="filtroPeriodo" className="text-sm text-gray-700 whitespace-nowrap">
                Período:
              </label>
              <select
                id="filtroPeriodo"
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                className="h-8 px-2 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              >
                <option value="Todos">Todos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>

            {/* Filtro por Frequência */}
            <div className="flex items-center space-x-2 shrink-0">
              <Filter className="h-5 w-5 text-gray-500" /> 
              <input 
                type="checkbox" 
                id="filtroBaixaFrequencia"
                checked={filtroBaixaFrequenciaAtivo}
                onChange={(e) => setFiltroBaixaFrequenciaAtivo(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="filtroBaixaFrequencia" className="text-sm text-gray-700 whitespace-nowrap">
                Freq. abaixo de:
              </label>
              <Input 
                type="number"
                id="percentualFiltroFrequencia"
                value={percentualFiltroFrequencia}
                onChange={(e) => {
                  const val = e.target.valueAsNumber;
                  if (!isNaN(val) && val >=0 && val <= 100) {
                    setPercentualFiltroFrequencia(val);
                  } else if (e.target.value === '') {
                      setPercentualFiltroFrequencia(0);
                  }
                }}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val < 0) setPercentualFiltroFrequencia(0);
                  else if (val > 100) setPercentualFiltroFrequencia(100);
                   else if (e.target.value === '' && filtroBaixaFrequenciaAtivo) setPercentualFiltroFrequencia(75); 
                   else if (e.target.value === '') setPercentualFiltroFrequencia(75);
                }}
                className={`h-8 w-20 text-sm p-1 border-gray-300 rounded ${!filtroBaixaFrequenciaAtivo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!filtroBaixaFrequenciaAtivo}
                min="0"
                max="100"
                step="1"
              />
               <label htmlFor="percentualFiltroFrequencia" className="text-sm text-gray-700">
                %
              </label>
              {isLoadingFrequenciaData && <Activity className="h-5 w-5 animate-spin text-primary ml-2" />} 
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="text-primary-dark">Lista de Alunos ({isLoadingStudents ? '...' : finalFilteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ano/Período</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingStudents && <TableRow><TableCell colSpan={6} className="text-center">Carregando alunos...</TableCell></TableRow>}
                {!isLoadingStudents && finalFilteredStudents.map((student) => {
                  return (
                    <TableRow key={student.id || Math.random()} className="hover:bg-secondary/20">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-dark" />
                          </div>
                          <div>
                            <Link to={`/alunos/${student.id}/summary`} className="block hover:underline text-primary-dark">
                              <p className="font-medium">
                                {student.nome} {student.sobrenome}
                              </p>
                            </Link>
                            <p className="text-sm text-gray-500">
                              {student.contatosResponsaveis && student.contatosResponsaveis[0]?.nome}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-primary hover:bg-primary/90 text-white text-center">
                            {student.anoEscolar ? `${student.anoEscolar.replace(/\D/g, '')}º Ano` : 'N/A'}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 text-center text-xs">
                            {student.periodo || 'N/A'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{student.matricula}</TableCell>
                      <TableCell>{calculateAge(student.dataNascimento)} anos</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const tags = getAlunoTags(student);
                            return tags.length > 0 ? (
                              tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">Regular</Badge>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1 items-center">
                          <Link 
                            to={`/alunos/${student.id}/summary`} 
                            title="Ver Detalhes"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          {canCreateEdit && (
                            <Link 
                              to={`/alunos/${student.id}/edit`} 
                              title="Editar Aluno"
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            >
                              <Edit className="w-5 h-5" /> 
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setStudentToDelete(student)}
                              title="Excluir Aluno"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {!isLoadingStudents && finalFilteredStudents.length === 0 && !filtroBaixaFrequenciaAtivo && (
            <p className="text-center text-gray-500 py-4">Nenhum aluno encontrado com os filtros atuais.</p>
          )}
          {!isLoadingStudents && finalFilteredStudents.length === 0 && filtroBaixaFrequenciaAtivo && !isLoadingFrequenciaData && (
             <p className="text-center text-gray-500 py-4">Nenhum aluno encontrado com frequência abaixo de {percentualFiltroFrequencia}%.</p>
          )}
          {isLoadingFrequenciaData && (
            <p className="text-center text-gray-500 py-4">Analisando dados de frequência...</p>
          )}
        </CardContent>
      </Card>
      {studentToDelete && canDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirmar exclusão</h2>
            <p>Você tem certeza que deseja excluir o aluno <strong>{studentToDelete.nome} {studentToDelete.sobrenome}</strong>?</p>
            <p className="text-sm text-gray-600 my-2">Esta ação não poderá ser desfeita. Para confirmar, digite o nome completo do aluno abaixo.</p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="border rounded w-full p-2 my-4 focus:ring-red-500 focus:border-red-500"
              placeholder="Digite o nome completo"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStudentToDelete(null);
                  setDeleteConfirmationText("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(studentToDelete.id)}
                disabled={deleteConfirmationText !== `${studentToDelete.nome} ${studentToDelete.sobrenome}` || deleteMutation.isLoading}
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