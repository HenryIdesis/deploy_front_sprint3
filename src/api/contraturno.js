import api from "./http";

export async function listarContraturnos() {
  const { data } = await api.get("/contraturno");
  return data;
}

export async function listarContratrunosAluno(alunoId) {
  const { data } = await api.get(`/contraturno/aluno/${alunoId}`);
  return data;
}

export async function getContraturno(id) {
  const { data } = await api.get(`/contraturno/${id}`);
  return data;
}

export async function deletarContraturno(id) {
  await api.delete(`/contraturno/${id}`);
}

export async function criarContraturno(contraturno) {
  const { data } = await api.post("/contraturno", contraturno);
  return data;
}

export async function atualizarContraturno(id, contraturno) {
  const { data } = await api.put(`/contraturno/${id}`, contraturno);
  return data;
}

export async function inscreverAlunoContraturno(contraturnoId, alunoId) {
  const { data } = await api.post(`/contraturno/${contraturnoId}/inscricoes`, { alunoId });
  return data;
}

export async function cancelarInscricaoContraturno(contraturnoId, alunoId) {
  await api.delete(`/contraturno/${contraturnoId}/inscricoes/${alunoId}`);
} 