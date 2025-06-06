import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { FileText, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { listarDocumentos, deletarDocumento } from "../../../api/documentos";
import UploadDocumento from "../../../components/UploadDocumento";

export default function BoletinsTab() {
  const { id: alunoId } = useParams();
  const { user } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [atualizarLista, setAtualizarLista] = useState(0);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const TIPO_DOCUMENTO = "boletim";

  const carregarDocumentos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarDocumentos(alunoId, TIPO_DOCUMENTO);
      setDocumentos(data);
    } catch (error) {
      console.error(`Erro ao carregar ${TIPO_DOCUMENTO}s:`, error);
      setErro(`Não foi possível carregar os ${TIPO_DOCUMENTO}s. Por favor, tente novamente.`);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (alunoId) {
      carregarDocumentos();
    }
  }, [alunoId, atualizarLista]);

  const handleUploadSuccess = () => {
    setAtualizarLista(prev => prev + 1);
  };

  const handleRemover = async (documentoId) => {
    if (!window.confirm(`Tem certeza que deseja remover este ${TIPO_DOCUMENTO}?`)) {
      return;
    }

    try {
      await deletarDocumento(alunoId, documentoId);
      setDocumentos(docs => docs.filter(d => d._id !== documentoId));
    } catch (error) {
      console.error(`Erro ao remover ${TIPO_DOCUMENTO}:`, error);
      alert(`Erro ao remover o ${TIPO_DOCUMENTO}. Por favor, tente novamente.`);
    }
  };

  if (!alunoId) {
    return <div className="p-4 text-red-600">Erro: ID do aluno não encontrado</div>;
  }

  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/api$/, "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Boletins Escolares
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
            <UploadDocumento
              alunoId={alunoId}
              tipo={TIPO_DOCUMENTO}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
          
          {erro && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{erro}</p>
              <button 
                onClick={carregarDocumentos}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {carregando ? (
            <div className="mt-6 text-center p-6">
              <p className="text-gray-500">Carregando boletins...</p>
            </div>
          ) : documentos.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-4">Boletins Enviados</h3>
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
                          onClick={() => handleRemover(doc._id)}
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
              <p className="text-gray-500">Nenhum boletim enviado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 