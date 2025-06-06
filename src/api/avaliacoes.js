import api from "./http";

/**
 * Lista todas as avaliações externas de um aluno.
 */
export async function listarAvaliacoes(alunoId) {
  const { data } = await api.get(`/alunos/${alunoId}/avaliacoes`);
  return data;
}

/**
 * Cria uma nova avaliação externa.
 */
export async function criarAvaliacao(alunoId, avaliacao) {
  const { data } = await api.post(`/alunos/${alunoId}/avaliacoes`, avaliacao);
  return data;
}

/**
 * Atualiza uma avaliação externa existente.
 */
export async function atualizarAvaliacao(alunoId, id, updates) {
  const { data } = await api.put(`/alunos/${alunoId}/avaliacoes/${id}`, updates);
  return data;
}

/**
 * Deleta uma avaliação externa.
 */
export async function deletarAvaliacao(alunoId, id) {
  await api.delete(`/alunos/${alunoId}/avaliacoes/${id}`);
} 