import api from "./http";

export async function listarAlunos() {
  const { data } = await api.get("/alunos");
  return data;
}

export async function criarAluno(aluno) {
  const { data } = await api.post("/alunos", aluno);
  return data;
}

export async function getAluno(id) {
  const { data } = await api.get(`/alunos/${id}`);
  return data;
}

export async function updateAluno(id, updates) {
  const { data } = await api.put(`/alunos/${id}`, updates);
  return data;
}

export async function deleteAluno(id) {
  await api.delete(`/alunos/${id}`);
} 