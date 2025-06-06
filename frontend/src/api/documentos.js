import api from './http';

const listarDocumentos = async (alunoId, tipo) => {
  try {
    const response = await api.get(`/documentos/alunos/${alunoId}/documentos`, {
      params: { tipo },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao listar documentos do tipo ${tipo}:`, error);
    throw error;
  }
};

const deletarDocumento = async (alunoId, documentoId) => {
  try {
    const response = await api.delete(`/documentos/alunos/${alunoId}/documentos/${documentoId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao deletar documento ${documentoId}:`, error);
    throw error;
  }
};

const uploadDocumento = async (alunoId, tipo, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);

  try {
    const response = await api.post(`/documentos/alunos/${alunoId}/documentos/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error(`Erro no upload do documento do tipo ${tipo}:`, error);
    throw error;
  }
};

export {
  listarDocumentos,
  deletarDocumento,
  uploadDocumento,
}; 