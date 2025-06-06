import api from "./http";

/**
 * Lista todos os encaminhamentos de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @returns {Promise<Array>} Lista de encaminhamentos do aluno.
 */
export async function listarEncaminhamentos(alunoId) {
  if (!alunoId) throw new Error("ID do aluno é obrigatório para listar encaminhamentos.");
  const { data } = await api.get(`/alunos/${alunoId}/encaminhamentos`);
  return data;
}

/**
 * Cria um novo encaminhamento para um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {object} encaminhamento - Dados do encaminhamento a ser criado.
 * @returns {Promise<object>} O encaminhamento criado.
 */
export async function criarEncaminhamento(alunoId, encaminhamento) {
  if (!alunoId) throw new Error("ID do aluno é obrigatório para criar encaminhamento.");
  const { data } = await api.post(`/alunos/${alunoId}/encaminhamentos`, encaminhamento);
  return data;
}

/**
 * Atualiza um encaminhamento específico de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {string} encaminhamentoId - O ID do encaminhamento.
 * @param {object} updates - Dados do encaminhamento a serem atualizados.
 * @returns {Promise<object>} O encaminhamento atualizado.
 */
export async function atualizarEncaminhamento(alunoId, encaminhamentoId, updates) {
  if (!alunoId || !encaminhamentoId) throw new Error("ID do aluno e do encaminhamento são obrigatórios.");
  const { data } = await api.put(`/alunos/${alunoId}/encaminhamentos/${encaminhamentoId}`, updates);
  return data;
}

/**
 * Remove um encaminhamento específico de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {string} encaminhamentoId - O ID do encaminhamento.
 * @returns {Promise<void>}
 */
export async function deletarEncaminhamento(alunoId, encaminhamentoId) {
  if (!alunoId || !encaminhamentoId) throw new Error("ID do aluno e do encaminhamento são obrigatórios.");
  await api.delete(`/alunos/${alunoId}/encaminhamentos/${encaminhamentoId}`);
} 