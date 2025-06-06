import api from "./http";

/**
 * Lista todas as frequências de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @returns {Promise<Array>} Lista de frequências do aluno.
 */
export async function listarFrequencias(alunoId) {
  if (!alunoId) throw new Error("ID do aluno é obrigatório para listar frequências.");
  const { data } = await api.get(`/alunos/${alunoId}/frequencias`);
  return data;
}

/**
 * Cria um novo registro de frequência para um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {object} frequencia - Dados da frequência a ser criada.
 * @returns {Promise<object>} A frequência criada.
 */
export async function criarFrequencia(alunoId, frequencia) {
  if (!alunoId) throw new Error("ID do aluno é obrigatório para criar frequência.");
  const { data } = await api.post(`/alunos/${alunoId}/frequencias`, frequencia);
  return data;
}

/**
 * Busca uma frequência específica de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {string} frequenciaId - O ID da frequência.
 * @returns {Promise<object>} A frequência encontrada.
 */
export async function getFrequencia(alunoId, frequenciaId) {
  if (!alunoId || !frequenciaId) throw new Error("ID do aluno e da frequência são obrigatórios.");
  const { data } = await api.get(`/alunos/${alunoId}/frequencias/${frequenciaId}`);
  return data;
}

/**
 * Remove uma frequência específica de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {string} frequenciaId - O ID da frequência.
 * @returns {Promise<void>}
 */
export async function deletarFrequencia(alunoId, frequenciaId) {
  if (!alunoId || !frequenciaId) throw new Error("ID do aluno e da frequência são obrigatórios.");
  await api.delete(`/alunos/${alunoId}/frequencias/${frequenciaId}`);
}

/**
 * Atualiza uma frequência específica de um aluno.
 * @param {string} alunoId - O ID do aluno.
 * @param {string} frequenciaId - O ID da frequência.
 * @param {object} frequenciaData - Dados da frequência a serem atualizados.
 * @returns {Promise<object>} A frequência atualizada.
 */
export async function atualizarFrequencia(alunoId, frequenciaId, frequenciaData) {
  if (!alunoId || !frequenciaId) throw new Error("ID do aluno e da frequência são obrigatórios.");
  const { data } = await api.put(`/alunos/${alunoId}/frequencias/${frequenciaId}`, frequenciaData);
  return data;
} 