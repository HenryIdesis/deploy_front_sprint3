import api from "./http";

// Listar todos os boletins de um aluno
export async function listarBoletins(alunoId) {
  const { data } = await api.get(`/boletins/${alunoId}`);
  return data;
}

// Obter um boletim específico
export async function obterBoletim(alunoId, boletimId) {
  const { data } = await api.get(`/boletins/${alunoId}/${boletimId}`);
  return data;
}

// Criar um novo boletim
export async function criarBoletim(alunoId, boletimData) {
  const { data } = await api.post(`/boletins/${alunoId}`, boletimData);
  return data;
}

// Atualizar um boletim
export async function atualizarBoletim(alunoId, boletimId, boletimData) {
  const { data } = await api.put(`/boletins/${alunoId}/${boletimId}`, boletimData);
  return data;
}

// Deletar um boletim
export async function deletarBoletim(alunoId, boletimId) {
  const { data } = await api.delete(`/boletins/${alunoId}/${boletimId}`);
  return data;
} 