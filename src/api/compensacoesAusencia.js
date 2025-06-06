import api from "./http";

/**
 * Lista todas as atividades de compensação de ausência de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @returns {Promise<Array>} Lista de atividades de compensação.
 */
export async function listarCompensacoesAusencia(alunoId) {
  if (!alunoId) throw new Error("ID do aluno é obrigatório para listar compensações de ausência.");
  const { data } = await api.get(`/alunos/${alunoId}/compensacoesAusencia`);
  return data;
}

/**
 * Cria uma nova atividade de compensação de ausência para um aluno.
 * @param {string} alunoId
 * @param {object} compensacao - Dados da atividade a criar.
 * @returns {Promise<object>} A atividade criada.
 */
export async function criarCompensacaoAusencia(alunoId, compensacao) {
  if (!alunoId) throw new Error("ID do aluno é obrigatório para criar compensação de ausência.");
  const { data } = await api.post(`/alunos/${alunoId}/compensacoesAusencia`, compensacao);
  return data;
}

/**
 * Atualiza uma atividade de compensação de ausência.
 * @param {string} alunoId
 * @param {string} compId
 * @param {object} compensacaoData
 * @returns {Promise<object>} A atividade atualizada.
 */
export async function atualizarCompensacaoAusencia(alunoId, compId, compensacaoData) {
  if (!alunoId || !compId) throw new Error("ID do aluno e da atividade são obrigatórios.");
  const { data } = await api.put(`/alunos/${alunoId}/compensacoesAusencia/${compId}`, compensacaoData);
  return data;
}

/**
 * Remove uma atividade de compensação de ausência.
 * @param {string} alunoId
 * @param {string} compId
 * @returns {Promise<void>}
 */
export async function deletarCompensacaoAusencia(alunoId, compId) {
  if (!alunoId || !compId) throw new Error("ID do aluno e da atividade são obrigatórios.");
  await api.delete(`/alunos/${alunoId}/compensacoesAusencia/${compId}`);
} 