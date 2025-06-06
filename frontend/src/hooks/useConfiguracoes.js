import { useQuery } from "@tanstack/react-query";
import { obterConfiguracoes } from "../api/configuracoes";
import { useAuth } from "../context/AuthContext";

// Configurações padrão
const CONFIG_PADRAO = {
  frequencia: {
    critico: 70.0,
    atencao: 80.0,
    regular: 90.0
  },
  boletim: {
    reprovado: 5.0,
    recuperacao: 7.0,
    aprovado: 7.0
  },
  interface: {
    boletinsDigitaisHabilitado: true,
    saudeDigitalHabilitado: true
  }
};

export function useConfiguracoes() {
  const { user } = useAuth();
  
  const { data: configuracoes, isLoading, error } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: obterConfiguracoes,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados podem ficar "antigos" por 5 min
    cacheTime: 10 * 60 * 1000, // 10 minutos - manter em cache por 10 min
    enabled: !!user, // Todos os usuários logados podem ver as configurações
  });

  // Usar configurações salvas ou padrão com merge profundo
  const config = {
    frequencia: { ...CONFIG_PADRAO.frequencia, ...(configuracoes?.frequencia || {}) },
    boletim: { ...CONFIG_PADRAO.boletim, ...(configuracoes?.boletim || {}) },
    interface: { ...CONFIG_PADRAO.interface, ...(configuracoes?.interface || {}) }
  };

  // Função para obter status da frequência
  const getStatusFrequencia = (percentual) => {
    if (percentual < config.frequencia.critico) {
      return { status: "Crítico", color: "bg-red-800 text-white" };
    } else if (percentual < config.frequencia.atencao) {
      return { status: "Atenção", color: "bg-yellow-100 text-yellow-800" };
    } else if (percentual >= config.frequencia.regular) {
      return { status: "Regular", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Moderado", color: "bg-blue-100 text-blue-800" };
    }
  };

  // Função para obter status da nota
  const getStatusNota = (nota) => {
    if (nota < config.boletim.reprovado) {
      return { status: "Reprovado", color: "bg-red-800 text-white" };
    } else if (nota < config.boletim.recuperacao) {
      return { status: "Recuperação", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "Aprovado", color: "bg-green-100 text-green-800" };
    }
  };

  // Função para verificar se os boletins digitais estão habilitados
  const isBoletinsDigitaisHabilitado = () => {
    return config.interface.boletinsDigitaisHabilitado;
  };

  // Função para verificar se a saúde digital está habilitada
  const isSaudeDigitalHabilitado = () => {
    return config.interface.saudeDigitalHabilitado;
  };

  return {
    configuracoes: config,
    isLoading,
    error,
    getStatusFrequencia,
    getStatusNota,
    isBoletinsDigitaisHabilitado,
    isSaudeDigitalHabilitado
  };
} 