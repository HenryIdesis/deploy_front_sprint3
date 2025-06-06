import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { UploadCloud, File, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { uploadDocumento } from '../api/documentos';

export default function UploadDocumento({ alunoId, tipo, onUploadSuccess }) {
  const [arquivo, setArquivo] = useState(null);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setArquivo(acceptedFiles[0]);
      setErro('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!arquivo) return;

    setCarregando(true);
    setProgresso(0);
    setErro('');

    try {
      await uploadDocumento(
        alunoId,
        tipo,
        arquivo,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgresso(percentCompleted);
        }
      );
      onUploadSuccess();
      setArquivo(null);
    } catch (error) {
      setErro('Falha no upload. Por favor, tente novamente.');
      console.error('Erro no upload:', error);
    } finally {
      setCarregando(false);
      setProgresso(0);
    }
  };

  const removerArquivo = () => {
    setArquivo(null);
    setErro('');
    setProgresso(0);
  };

  return (
    <div className="mt-4 p-4 border-2 border-dashed rounded-lg space-y-4">
      <div
        {...getRootProps()}
        className={`p-6 text-center rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        {isDragActive ? (
          <p className="mt-2 text-blue-600">Solte o arquivo aqui...</p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Arraste e solte um arquivo PDF aqui, ou clique para selecionar
          </p>
        )}
      </div>

      {arquivo && (
        <div className="p-3 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="h-6 w-6 text-gray-500" />
              <span className="text-sm font-medium">{arquivo.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={removerArquivo}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {carregando && (
            <div className="mt-2">
              <Progress value={progresso} />
              <span className="text-xs text-gray-500">{progresso}%</span>
            </div>
          )}
        </div>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <Button onClick={handleUpload} disabled={!arquivo || carregando}>
        {carregando ? 'Enviando...' : 'Enviar Arquivo'}
      </Button>
    </div>
  );
} 