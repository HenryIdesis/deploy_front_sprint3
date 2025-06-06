import api from "./http";

/**
 * Lista todos os diagnósticos de um aluno.
 */
export async function listarDiagnosticos(alunoId) {
  const { data } = await api.get(`/alunos/${alunoId}/diagnosticos`);
  return data;
}

/**
 * Cria um novo diagnóstico.
 */
export async function criarDiagnostico(alunoId, diagnostico) {
  const { data } = await api.post(`/alunos/${alunoId}/diagnosticos`, diagnostico);
  return data;
}

/**
 * Atualiza um diagnóstico existente.
 */
export async function atualizarDiagnostico(alunoId, id, updates) {
  const { data } = await api.put(`/alunos/${alunoId}/diagnosticos/${id}`, updates);
  return data;
}

/**
 * Deleta um diagnóstico.
 */
export async function deletarDiagnostico(alunoId, id) {
  await api.delete(`/alunos/${alunoId}/diagnosticos/${id}`);
} 