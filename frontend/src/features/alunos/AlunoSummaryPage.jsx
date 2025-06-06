import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import {
  FileText,
  Calendar,
  Heart,
  Headphones,
  Clock,
  GraduationCap,
  BookOpen,
  Send,
  ShieldAlert,
  ArrowLeft,
  Download,
  Trash2,
} from "lucide-react";

export default function AlunoSummaryPage() {
  const navigate = useNavigate();
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [deletingReportId, setDeletingReportId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8000/api/relatorios/aluno/${alunoId}`,
          {
            headers: { "X-API-TOKEN": token },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          console.error("Failed to fetch reports");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, [alunoId]);

  const reportSections = [
    { id: "dados-gerais", label: "Dados Gerais do Aluno" },
    { id: "saude", label: "Informações de Saúde" },
    { id: "boletins", label: "Boletins Escolares" },
    { id: "frequencias", label: "Frequências e Presenças" },
    { id: "atendimentos", label: "Atendimentos e Intervenções" },
    { id: "encaminhamentos", label: "Encaminhamentos" },
    { id: "contraturnos", label: "Atividades de Contraturno" },
    { id: "hipotesesEscritas", label: "Hipóteses de Escrita" },
    { id: "diagnosticos", label: "Diagnósticos Pedagógicos" },
    { id: "avaliacoesExternas", label: "Avaliações Externas" },
  ];

  const [selectedSections, setSelectedSections] = useState(
    reportSections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );

  const handleCheckboxChange = (id) => {
    setSelectedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateClick = () => {
    const sectionsToInclude = Object.entries(selectedSections)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    if (sectionsToInclude.length === 0) {
      alert("Selecione ao menos uma seção para o relatório.");
      return;
    }

    handleDownloadReport(sectionsToInclude);
    setIsModalOpen(false);
  };

  const handleDownloadReport = async (sectionsToInclude) => {
    try {
      const token = localStorage.getItem("token");

      const postResponse = await fetch(
        "http://localhost:8000/api/relatorios/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-TOKEN": token,
          },
          body: JSON.stringify({
            alunoId: alunoId,
            secoes: sectionsToInclude,
          }),
        }
      );
      if (!postResponse.ok) {
        let errorMsg = "Erro ao criar relatório";
        try {
          const errorData = await postResponse.json();
          if (errorData && errorData.detail) {
            errorMsg = errorData.detail;
          }
        } catch (e) {
          console.error(
            "Não foi possível analisar a resposta de erro como JSON:",
            e
          );
        }
        throw new Error(errorMsg);
      }
      const postData = await postResponse.json();
      const relatorioId = postData.relatorioId;
      if (!relatorioId) throw new Error("ID do relatório não retornado");

      // Adiciona o novo relatório à lista sem refazer o fetch
      setReports((prevReports) => [
        { id: relatorioId, createdAt: new Date().toISOString() },
        ...prevReports,
      ]);

      downloadPdf(relatorioId);
    } catch (error) {
      alert("Erro ao gerar relatório: " + error.message);
    }
  };

  const downloadPdf = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const getResponse = await fetch(
        `http://localhost:8000/api/relatorios/${reportId}/pdf`,
        {
          method: "GET",
          headers: {
            "X-API-TOKEN": token,
          },
        }
      );
      if (!getResponse.ok) throw new Error("Erro ao baixar PDF");
      const blob = await getResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${alunoId}_${reportId.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Erro ao baixar relatório: " + error.message);
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm("Tem certeza que deseja deletar este relatório? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeletingReportId(reportId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/relatorios/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "X-API-TOKEN": token,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao deletar relatório");
      }
      
      // Remove o relatório da lista local
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      alert("Relatório deletado com sucesso!");
      
    } catch (error) {
      alert("Erro ao deletar relatório: " + error.message);
    } finally {
      setDeletingReportId(null);
    }
  };

  const sections = [
    {
      id: "dados-gerais",
      title: "Dados Gerais",
      icon: GraduationCap,
      description: "Informações básicas e contatos",
    },
    {
      id: "boletins",
      title: "Boletins",
      icon: FileText,
      description: "Notas e avaliações",
    },
    {
      id: "frequencia",
      title: "Frequência",
      icon: Calendar,
      description: "Registro de presenças",
    },
    {
      id: "saude",
      title: "Saúde",
      icon: Heart,
      description: "Informações médicas",
    },
    {
      id: "atendimentos",
      title: "Atendimentos",
      icon: Headphones,
      description: "Registros de atendimento",
    },
    {
      id: "contraturno",
      title: "Contraturno",
      icon: Clock,
      description: "Atividades extras",
    },
    {
      id: "historico-escolar",
      title: "Histórico Escolar",
      icon: BookOpen,
      description: "Histórico acadêmico do aluno",
    },
    {
      id: "enviar-comunicado",
      title: "Enviar Comunicado",
      icon: Send,
      description: "Enviar comunicado ao aluno",
    },
    {
      id: "encaminhamentos-rede-protecao",
      title: "Encaminhamentos para rede de proteção",
      icon: ShieldAlert,
      description: "Encaminhar aluno à rede de proteção",
    },
  ];

  const handleSectionClick = (sectionId) => {
    navigate(`/alunos/${alunoId}/${sectionId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate("/alunos")}
          className="flex items-center bg-primary text-white hover:bg-primary/90 transition-colors rounded"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-primary-dark">
          Detalhes do Aluno
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto bg-blue-600 text-white hover:bg-blue-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            key={section.id}
            className="p-6 cursor-pointer hover:bg-secondary/10 transition-colors"
            onClick={() => handleSectionClick(section.id)}
          >
            <div className="flex flex-col items-center text-center">
              <section.icon className="w-12 h-12 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-primary-dark mb-4">
          Relatórios Gerados
        </h2>
        <Card className="p-4">
          {reports.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => (
                <li
                  key={report.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 mr-4 text-gray-500" />
                    <div>
                      <p className="font-semibold">Relatório</p>
                      <p className="text-sm text-gray-500">
                        Gerado em:{" "}
                        {new Date(report.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPdf(report.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                    {user?.role === "ADMIN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReport(report.id)}
                        disabled={deletingReportId === report.id}
                        className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingReportId === report.id ? "Deletando..." : "Deletar"}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum relatório gerado para este aluno.
            </p>
          )}
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Gerar Relatório</h2>
            <p className="mb-6">
              Selecione as seções que devem constar no relatório:
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {reportSections.map((section) => (
                <div key={section.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={section.id}
                    checked={selectedSections[section.id]}
                    onChange={() => handleCheckboxChange(section.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={section.id}
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateClick}>Gerar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 