import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  FileText,
  Calendar,
  Heart,
  Headphones,
  Clock,
  GraduationCap,
} from "lucide-react";

export default function AlunoSummaryDialog({ isOpen, onClose, alunoId }) {
  const navigate = useNavigate();

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
  ];

  const handleSectionClick = (sectionId) => {
    navigate(`/alunos/${alunoId}/${sectionId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center text-center hover:bg-secondary/20"
              onClick={() => handleSectionClick(section.id)}
            >
              <section.icon className="w-8 h-8 mb-2 text-primary" />
              <div className="font-medium">{section.title}</div>
              <div className="text-sm text-gray-500 mt-1">{section.description}</div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 