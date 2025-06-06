import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { FileText, Trash2, Eye, Save, AlertCircle, Heart } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useConfiguracoes } from "../../../hooks/useConfiguracoes";
import { listarDocumentos, deletarDocumento } from "../../../api/documentos";
import { buscarSaudeAluno, criarSaudeAluno, atualizarSaudeAluno } from "../../../api/saude";
import UploadDocumento from "../../../components/UploadDocumento";
import CondicoesSaudeManager from "../../../components/CondicoesSaudeManager";
import MedicacoesManager from "../../../components/MedicacoesManager";
import ContatosEmergenciaManager from "../../../components/ContatosEmergenciaManager";
import AlergiasManager from "../../../components/AlergiasManager";

export default function SaudeTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const { isSaudeDigitalHabilitado } = useConfiguracoes();
  
  // Estados para documentos
  const [documentos, setDocumentos] = useState([]);
  const [atualizarLista, setAtualizarLista] = useState(0);
  const [erroDocumentos, setErroDocumentos] = useState(null);
  const [carregandoDocumentos, setCarregandoDocumentos] = useState(true);

  // Estados para dados de saúde digital
  const [dadosSaude, setDadosSaude] = useState(null);
  const [carregandoSaude, setCarregandoSaude] = useState(true);
  const [erroSaude, setErroSaude] = useState(null);
  const [salvandoSaude, setSalvandoSaude] = useState(false);

  const TIPO_DOCUMENTO = "saude";
  const podeEditar = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  // Carregar documentos
  const carregarDocumentos = async () => {
    setCarregandoDocumentos(true);
    setErroDocumentos(null);
    try {
      const data = await listarDocumentos(alunoId, TIPO_DOCUMENTO);
      setDocumentos(data);
    } catch (error) {
      console.error("Erro ao carregar documentos de saúde:", error);
      setErroDocumentos("Não foi possível carregar os documentos. Por favor, tente novamente.");
    } finally {
      setCarregandoDocumentos(false);
    }
  };

  // Carregar dados de saúde digital
  const carregarDadosSaude = async () => {
    if (!isSaudeDigitalHabilitado()) {
      setCarregandoSaude(false);
      return;
    }
    
    setCarregandoSaude(true);
    setErroSaude(null);
    try {
      const data = await buscarSaudeAluno(alunoId);
      
      // Garantir que todos os arrays existam
      const dadosNormalizados = {
        condicoesSaude: [],
        medicacoes: [],
        alergias: [],
        contatosEmergencia: [],
        documentosIds: [],
        ...data // Sobrescreve com dados do servidor se existirem
      };
      
      setDadosSaude(dadosNormalizados);
    } catch (error) {
      console.error("Erro ao carregar dados de saúde:", error);
      setErroSaude(`Não foi possível carregar os dados de saúde: ${error.message}`);
    } finally {
      setCarregandoSaude(false);
    }
  };

  useEffect(() => {
    if (alunoId) {
      carregarDocumentos();
      carregarDadosSaude();
    }
  }, [alunoId, atualizarLista]);

  // Handlers para documentos
  const handleUploadSuccess = () => {
    setAtualizarLista(prev => prev + 1);
  };

  const handleRemoverDocumento = async (documentoId) => {
    if (!window.confirm("Tem certeza que deseja remover este documento?")) {
      return;
    }

    try {
      await deletarDocumento(alunoId, documentoId);
      setDocumentos(docs => docs.filter(d => d._id !== documentoId));
    } catch (error) {
      console.error("Erro ao remover documento:", error);
      alert("Erro ao remover o documento. Por favor, tente novamente.");
    }
  };

  // Handlers para dados de saúde digital
  const handleSalvarDadosSaude = async () => {
    if (!dadosSaude) return;
    
    console.log("💾 Salvando dados de saúde:", dadosSaude);
    
    setSalvandoSaude(true);
    try {
      let resultado;
      if (dadosSaude._id) {
        // Atualizar dados existentes
        console.log("📝 Atualizando dados existentes...");
        resultado = await atualizarSaudeAluno(alunoId, dadosSaude);
      } else {
        // Criar novos dados
        console.log("🆕 Criando novos dados...");
        resultado = await criarSaudeAluno(alunoId, dadosSaude);
      }
      console.log("✅ Dados salvos com sucesso:", resultado);
      setDadosSaude(resultado);
      alert("Dados de saúde salvos com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao salvar dados de saúde:", error);
      alert("Erro ao salvar os dados de saúde. Por favor, tente novamente.");
    } finally {
      setSalvandoSaude(false);
    }
  };

  const handleUpdateDadosSaude = (campo, valor) => {
    console.log(`🔄 Atualizando ${campo}:`, valor);
    setDadosSaude(prev => {
      const novosDados = {
        ...prev,
        [campo]: valor
      };
      console.log("📊 Novos dados completos:", novosDados);
      return novosDados;
    });
  };

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }
  
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/api$/, "");

  return (
    <div className="space-y-6">
      {/* Seção de Cadastro Digital de Saúde - Condicional */}
      {isSaudeDigitalHabilitado() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Cadastro Digital de Saúde
              {podeEditar && (
                <Button
                  onClick={handleSalvarDadosSaude}
                  disabled={salvandoSaude || !dadosSaude}
                  size="sm"
                  className="ml-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {salvandoSaude ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {carregandoSaude ? (
              <div className="text-center py-6">
                <p className="text-gray-500">Carregando dados de saúde...</p>
              </div>
            ) : erroSaude ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <p>{erroSaude}</p>
                </div>
                <button 
                  onClick={carregarDadosSaude}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : dadosSaude ? (
              <div className="space-y-6">
                {/* Condições de Saúde */}
                <CondicoesSaudeManager
                  condicoes={dadosSaude.condicoesSaude || []}
                  onChange={(novasCondicoes) => handleUpdateDadosSaude('condicoesSaude', novasCondicoes)}
                />

                {/* Medicações */}
                <MedicacoesManager
                  medicacoes={dadosSaude.medicacoes || []}
                  onChange={(novasMedicacoes) => handleUpdateDadosSaude('medicacoes', novasMedicacoes)}
                />

                {/* Alergias */}
                <AlergiasManager
                  alergias={dadosSaude.alergias || []}
                  onChange={(novasAlergias) => handleUpdateDadosSaude('alergias', novasAlergias)}
                />

                {/* Contatos de Emergência */}
                <ContatosEmergenciaManager
                  contatos={dadosSaude.contatosEmergencia || []}
                  onChange={(novosContatos) => handleUpdateDadosSaude('contatosEmergencia', novosContatos)}
                />

                {/* Informações de auditoria */}
                {dadosSaude.createdAt && (
                  <div className="text-xs text-gray-500 border-t pt-4">
                    Criado em {new Date(dadosSaude.createdAt).toLocaleString('pt-BR')} por {dadosSaude.createdBy}
                    {dadosSaude.lastEditedAt && (
                      <span className="ml-4">
                        | Última edição em {new Date(dadosSaude.lastEditedAt).toLocaleString('pt-BR')} por {dadosSaude.lastEditedBy}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nenhum dado de saúde cadastrado ainda
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seção de Documentos de Saúde - Sempre visível */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos de Saúde
          </CardTitle>
        </CardHeader>
        <CardContent>
          {podeEditar && (
            <UploadDocumento
              alunoId={alunoId}
              tipo={TIPO_DOCUMENTO}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
          
          {erroDocumentos && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{erroDocumentos}</p>
              <button 
                onClick={carregarDocumentos}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {carregandoDocumentos ? (
            <div className="mt-6 text-center p-6">
              <p className="text-gray-500">Carregando documentos...</p>
            </div>
          ) : documentos.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-4">Documentos Enviados</h3>
              <div className="grid gap-4">
                {documentos.map((doc) => (
                  <div 
                    key={doc._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{doc.nomeOriginal}</p>
                        <p className="text-sm text-gray-500">
                          Enviado em: {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`${baseUrl}/api/documentos/alunos/${alunoId}/documentos/${doc._id}?token=${localStorage.getItem("token")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Visualizar PDF"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() => handleRemoverDocumento(doc._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Remover PDF"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum documento enviado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 