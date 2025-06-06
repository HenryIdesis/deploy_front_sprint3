import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Settings, Save, RotateCcw, Activity, GraduationCap, AlertTriangle, CheckCircle2, Monitor, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { obterConfiguracoes, atualizarConfiguracoes, resetarConfiguracoes } from "../api/configuracoes";
import { useNavigate } from "react-router-dom";

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Estado inicial vazio - será preenchido quando os dados chegarem do backend
  const [configuracoes, setConfiguracoes] = useState(null);

  // Verificar se é ADMIN
  React.useEffect(() => {
    if (user && user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Query para buscar configurações
  const { data: configuracoesSalvas, isLoading } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: obterConfiguracoes,
    enabled: user?.role === "ADMIN",
    staleTime: 0, // Sempre buscar dados frescos
    cacheTime: 0, // Não cachear os dados
  });

  // Atualizar estado quando os dados chegarem
  useEffect(() => {
    console.log("ConfiguracoesPage - dados recebidos:", configuracoesSalvas);
    if (configuracoesSalvas) {
      setConfiguracoes(configuracoesSalvas);
      console.log("ConfiguracoesPage - estado atualizado:", configuracoesSalvas);
    }
  }, [configuracoesSalvas]);

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

  // Usar configurações salvas ou padrão com merge profundo
  const configAtual = {
    frequencia: { ...CONFIG_PADRAO.frequencia, ...(configuracoes?.frequencia || {}) },
    boletim: { ...CONFIG_PADRAO.boletim, ...(configuracoes?.boletim || {}) },
    interface: { ...CONFIG_PADRAO.interface, ...(configuracoes?.interface || {}) }
  };

  // Mutation para atualizar configurações
  const atualizarMutation = useMutation({
    mutationFn: atualizarConfiguracoes,
    onSuccess: (data) => {
      // Atualizar o estado local com os dados retornados do backend
      setConfiguracoes(data);
      queryClient.invalidateQueries(["configuracoes"]);
      alert("Configurações atualizadas com sucesso!");
    },
    onError: (error) => {
      alert("Erro ao atualizar configurações: " + (error.response?.data?.detail || error.message));
    }
  });

  // Mutation para resetar configurações
  const resetarMutation = useMutation({
    mutationFn: resetarConfiguracoes,
    onSuccess: (data) => {
      setConfiguracoes(data);
      queryClient.invalidateQueries(["configuracoes"]);
      alert("Configurações resetadas para os valores padrão!");
    },
    onError: (error) => {
      alert("Erro ao resetar configurações: " + (error.response?.data?.detail || error.message));
    }
  });

  const handleInputChange = (secao, campo, valor) => {
    const novasConfiguracoes = configuracoes || CONFIG_PADRAO;
    setConfiguracoes({
      ...novasConfiguracoes,
      [secao]: {
        ...novasConfiguracoes[secao],
        [campo]: parseFloat(valor) || 0
      }
    });
  };

  const handleToggleChange = (secao, campo, valor) => {
    const novasConfiguracoes = configuracoes || CONFIG_PADRAO;
    setConfiguracoes({
      ...novasConfiguracoes,
      [secao]: {
        ...novasConfiguracoes[secao],
        [campo]: valor
      }
    });
  };

  const handleSalvar = () => {
    const configParaSalvar = configuracoes || CONFIG_PADRAO;
    atualizarMutation.mutate(configParaSalvar);
  };

  const handleResetar = () => {
    if (window.confirm("Tem certeza que deseja resetar todas as configurações para os valores padrão?")) {
      resetarMutation.mutate();
    }
  };

  if (user?.role !== "ADMIN") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão da Aplicação</h1>
            <p className="text-gray-600">Configure os parâmetros do sistema</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleResetar}
            disabled={resetarMutation.isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {resetarMutation.isLoading ? "Resetando..." : "Resetar"}
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={atualizarMutation.isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {atualizarMutation.isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações de Frequência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Activity className="w-5 h-5" />
              Configurações de Frequência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Crítico (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={configAtual.frequencia.critico}
                  onChange={(e) => handleInputChange('frequencia', 'critico', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Frequência abaixo de {configAtual.frequencia.critico}% será considerada crítica
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Atenção (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={configAtual.frequencia.atencao}
                  onChange={(e) => handleInputChange('frequencia', 'atencao', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Frequência entre {configAtual.frequencia.critico}% e {configAtual.frequencia.atencao}% será considerada atenção
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Regular (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={configAtual.frequencia.regular}
                  onChange={(e) => handleInputChange('frequencia', 'regular', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Frequência acima de {configAtual.frequencia.regular}% será considerada regular
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Preview dos Status:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>0% - {configAtual.frequencia.critico}%: Crítico</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>{configAtual.frequencia.critico}% - {configAtual.frequencia.atencao}%: Atenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Acima de {configAtual.frequencia.regular}%: Regular</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Boletim */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <GraduationCap className="w-5 h-5" />
              Configurações de Boletim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Reprovado (nota máxima)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={configAtual.boletim.reprovado}
                  onChange={(e) => handleInputChange('boletim', 'reprovado', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Notas abaixo de {configAtual.boletim.reprovado} serão consideradas reprovação
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Recuperação (nota máxima)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={configAtual.boletim.recuperacao}
                  onChange={(e) => handleInputChange('boletim', 'recuperacao', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Notas entre {configAtual.boletim.reprovado} e {configAtual.boletim.recuperacao} serão consideradas recuperação
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Aprovado (nota mínima)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={configAtual.boletim.aprovado}
                  onChange={(e) => handleInputChange('boletim', 'aprovado', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Notas a partir de {configAtual.boletim.aprovado} serão consideradas aprovação
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Preview dos Status:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>0 - {configAtual.boletim.reprovado}: Reprovado</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>{configAtual.boletim.reprovado} - {configAtual.boletim.recuperacao}: Recuperação</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{configAtual.boletim.aprovado} - 10: Aprovado</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Monitor className="w-5 h-5" />
              Configurações de Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Boletins Escolares Digitais
                </label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">Habilitar Boletins Digitais</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Controla a visibilidade da seção de boletins digitais nas páginas dos alunos
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleChange('interface', 'boletinsDigitaisHabilitado', !configAtual.interface.boletinsDigitaisHabilitado)}
                    className={`flex items-center transition-colors duration-200 ${
                      configAtual.interface.boletinsDigitaisHabilitado 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {configAtual.interface.boletinsDigitaisHabilitado ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Cadastro Digital de Saúde
                </label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">Habilitar Cadastro de Saúde</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Controla a visibilidade da seção de cadastro de saúde nas páginas dos alunos
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleChange('interface', 'saudeDigitalHabilitado', !configAtual.interface.saudeDigitalHabilitado)}
                    className={`flex items-center transition-colors duration-200 ${
                      configAtual.interface.saudeDigitalHabilitado 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {configAtual.interface.saudeDigitalHabilitado ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              (configAtual.interface.boletinsDigitaisHabilitado || configAtual.interface.saudeDigitalHabilitado)
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            } border`}>
              <h4 className={`font-medium mb-2 ${
                (configAtual.interface.boletinsDigitaisHabilitado || configAtual.interface.saudeDigitalHabilitado)
                  ? 'text-green-800' 
                  : 'text-gray-600'
              }`}>
                Status das Funcionalidades:
              </h4>
              <div className="text-sm text-gray-600 space-y-3">
                <div>
                  <div className="font-medium mb-1">
                    Boletins Digitais: {configAtual.interface.boletinsDigitaisHabilitado ? 'Habilitado' : 'Desabilitado'}
                  </div>
                  {configAtual.interface.boletinsDigitaisHabilitado ? (
                    <ul className="space-y-1 text-xs">
                      <li>• Seção "Boletins Escolares Digitais" será exibida</li>
                      <li>• Usuários poderão criar e editar boletins digitais</li>
                    </ul>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      <li>• Seção "Boletins Escolares Digitais" será ocultada</li>
                      <li>• Upload de documentos permanece disponível</li>
                    </ul>
                  )}
                </div>
                
                <div>
                  <div className="font-medium mb-1">
                    Cadastro de Saúde: {configAtual.interface.saudeDigitalHabilitado ? 'Habilitado' : 'Desabilitado'}
                  </div>
                  {configAtual.interface.saudeDigitalHabilitado ? (
                    <ul className="space-y-1 text-xs">
                      <li>• Seção "Cadastro Digital de Saúde" será exibida</li>
                      <li>• Usuários poderão gerenciar dados de saúde digitalmente</li>
                    </ul>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      <li>• Seção "Cadastro Digital de Saúde" será ocultada</li>
                      <li>• Upload de documentos permanece disponível</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">📊 Frequência:</h4>
              <ul className="space-y-1">
                <li>• As configurações afetam os status exibidos nas páginas de frequência</li>
                <li>• Mudanças são aplicadas imediatamente em todo o sistema</li>
                <li>• Valores são baseados em percentuais de presença</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">📚 Boletins:</h4>
              <ul className="space-y-1">
                <li>• As configurações afetam a classificação das notas nos boletins</li>
                <li>• Mudanças são aplicadas imediatamente em todo o sistema</li>
                <li>• Valores são baseados na escala de 0 a 10</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🖥️ Interface:</h4>
              <ul className="space-y-1">
                <li>• Controla a visibilidade de funcionalidades específicas</li>
                <li>• Mudanças são aplicadas imediatamente</li>
                <li>• Permite personalizar a experiência do usuário</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 