import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Activity, GraduationCap, Users, AlertTriangle, FileText, BookOpen } from "lucide-react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { listarContraturnos } from "../../api/contraturno";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import api from "../../api/http";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalAlunos: 0,
    totalColaboradores: 0,
    alunosComAtencao: 0,
  });

  // Buscar dados dos projetos de contraturno
  const { data: projetos = [] } = useQuery({
    queryKey: ["contraturno"],
    queryFn: listarContraturnos,
  });

  // Calcular número de projetos ativos
  const projetosAtivos = projetos.filter((p) => p.status === "Ativo").length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        console.log("Dados do Dashboard recebidos:", data);
        setDashboardData({
          totalAlunos: data.totalAlunos,
          totalColaboradores: data.totalColaboradores,
          alunosComAtencao: data.alunosComAtencao,
        });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const frequenciaData = {
    labels: ["1º Bim", "2º Bim", "3º Bim", "4º Bim"],
    datasets: [{ label: "Frequência Média (%)", data: [92, 89, 91, 88], borderColor: "#1e81b0", backgroundColor: "rgba(30, 129, 176, 0.1)", tension: 0.4 }],
  };

  const notasIntervencaoData = {
    labels: ["0-2", "3-4", "5-6", "7-8", "9-10"],
    datasets: [
      { label: "Número de Alunos", data: [12, 28, 45, 89, 71], backgroundColor: "#76b5c5" },
      { label: "Intervenções", data: [8, 15, 12, 7, 3], backgroundColor: "#abdbe3" },
    ],
  };

  const tagsAtencaoData = {
    labels: ["Dificuldade Aprendizagem", "Frequência Baixa", "Comportamento", "Saúde", "Família"],
    datasets: [{ data: [35, 28, 15, 12, 10], backgroundColor: ["#063970", "#1e81b0", "#76b5c5", "#abdbe3", "#eeeee4"] }],
  };

  const chartOptions = { responsive: true, plugins: { legend: { position: "top" } } };

  return (
    <div className="flex-1 space-y-4 p-0 md:p-0 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-12 pt-4 md:pt-8">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary-dark" />
          <h1 className="text-3xl font-bold text-primary-dark">Dashboard</h1>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 grid-rows-2 w-full mb-8 h-[45vh] px-4 md:px-12">
        <Card className="border-secondary h-full flex flex-col justify-center shadow-lg">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Total de Alunos</CardTitle>
            <GraduationCap className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-dark">{dashboardData.totalAlunos}</div>
          </CardContent>
        </Card>
        <Card className="border-secondary h-full flex flex-col justify-center shadow-lg">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Colaboradores</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-dark">{dashboardData.totalColaboradores}</div>
            <p className="text-sm text-gray-600">Equipe ativa</p>
          </CardContent>
        </Card>
        <Card className="border-secondary h-full flex flex-col justify-center shadow-lg">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Alunos com Atenção</CardTitle>
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">{dashboardData.alunosComAtencao}</div>
            <p className="text-sm text-gray-600">Requerem acompanhamento</p>
          </CardContent>
        </Card>
        <Card className="border-secondary h-full flex flex-col justify-center shadow-lg">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Contraturno</CardTitle>
            <BookOpen className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-dark">{projetosAtivos}</div>
            <p className="text-sm text-gray-600">Projetos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="px-4 md:px-12">
        <Card className="border-secondary">
          <CardHeader className="flex flex-col">
            <CardTitle className="text-primary-dark">Ações Rápidas</CardTitle>
            <p className="text-sm text-gray-600">Acesso direto às funcionalidades mais utilizadas</p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
              <>
                <Button 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  variant="outline" 
                  onClick={() => navigate('/alunos/novo')}
                >
                  <GraduationCap className="mr-2 h-4 w-4" /> Novo Aluno
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/colaboradores', { state: { openNewModal: true } })}
                >
                  <Users className="mr-2 h-4 w-4" /> Novo Colaborador
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/contraturno/novo')}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Novo Contraturno
                </Button>
              </>
            )}
            {user?.role === "VISITANTE" && (
              <div className="w-full text-center py-4">
                <p className="text-gray-500 text-sm">
                  Como visitante, você pode navegar pelo sistema usando o menu lateral.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 