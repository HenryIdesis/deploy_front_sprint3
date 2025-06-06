import api from "./http";

export async function listarColaboradores() {
  const { data } = await api.get("/colaboradores");
  return data;
}

export async function criarColaborador(colaborador) {
  const { data } = await api.post("/colaboradores", colaborador);
  return data;
}

export async function atualizarColaborador(id, updates) {
  const { data } = await api.put(`/colaboradores/${id}`, updates);
  return data;
}

export async function deletarColaborador(id) {
  const { data } = await api.delete(`/colaboradores/${id}`);
  return data;
}

export async function getColaborador(id) {
  const { data } = await api.get(`/colaboradores/${id}`);
  return data;
} 