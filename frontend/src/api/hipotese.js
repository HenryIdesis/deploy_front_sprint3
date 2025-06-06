import api from "./http";

/**
 * Lista todas as hipóteses de escrita de um aluno.
 * @param {string} alunoId
 * @returns {Promise<Array>}
 */
export async function listarHipoteses(alunoId) {
  const { data } = await api.get(`/alunos/${alunoId}/hipotese`);
  return data;
}

/**
 * Cria uma nova hipótese de escrita.
 * @param {string} alunoId
 * @param {object} hipotese
 * @returns {Promise<object>}
 */
export async function criarHipotese(alunoId, hipotese) {
  const { data } = await api.post(`/alunos/${alunoId}/hipotese`, hipotese);
  return data;
}

/**
 * Atualiza uma hipótese existente.
 */
export async function atualizarHipotese(alunoId, hipoteseId, updates) {
  const { data } = await api.put(`/alunos/${alunoId}/hipotese/${hipoteseId}`, updates);
  return data;
}

/**
 * Deleta uma hipótese de escrita.
 */
export async function deletarHipotese(alunoId, hipoteseId) {
  await api.delete(`/alunos/${alunoId}/hipotese/${hipoteseId}`);
} 