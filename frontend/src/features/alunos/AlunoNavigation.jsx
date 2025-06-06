import { NavLink, useParams } from "react-router-dom";

import { User, BookOpen, Clock, Heart, MessageCircle, ScrollText, ShieldAlert, Send } from "lucide-react";


export default function AlunoNavigation() {
  const { id } = useParams();

  const tabs = [
    {
      name: "Dados Gerais",
      path: "dados-gerais",
      icon: User,
    },
    {
      name: "Boletins",
      path: "boletins",
      icon: BookOpen,
    },
    {
      name: "Frequência",
      path: "frequencia",
      icon: Clock,
    },
    {
      name: "Saúde",
      path: "saude",
      icon: Heart,
    },
    {
      name: "Atendimentos",
      path: "atendimentos",
      icon: MessageCircle,
    },
    {
      name: "Contraturno",
      path: "contraturno",
      icon: Clock,
    },
    {
      name: "Histórico Escolar",
      path: "historico-escolar",
      icon: ScrollText,
    },
    {
      name: "Enviar Comunicado",
      path: "enviar-comunicado",
      icon: Send,
    },
    {
      name: "Rede de Proteção",
      path: "encaminhamentos-rede-protecao",
      icon: ShieldAlert,
    }
  ];

  return (
    <div className="mt-4 grid grid-cols-9 mb-6 bg-white rounded-lg p-1 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={`/alunos/${id}/${tab.path}`}
            className={({ isActive }) =>
              `flex items-center justify-center gap-2 p-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#1e81b0] text-white"
                  : "text-gray-600 hover:text-[#063970] hover:bg-gray-50"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{tab.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
} 