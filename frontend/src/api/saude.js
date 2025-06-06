import api from './http';

// Buscar dados de saúde de um aluno
export const buscarSaudeAluno = async (alunoId) => {
  try {
    const response = await api.get(`/alunos/${alunoId}/saude`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Dados de saúde não existem ainda
    }
    throw error;
  }
};

// Criar dados de saúde para um aluno
export const criarSaudeAluno = async (alunoId, dadosSaude) => {
  const response = await api.post(`/alunos/${alunoId}/saude`, dadosSaude);
  return response.data;
};

// Atualizar dados de saúde de um aluno
export const atualizarSaudeAluno = async (alunoId, dadosSaude) => {
  const response = await api.put(`/alunos/${alunoId}/saude`, dadosSaude);
  return response.data;
}; 