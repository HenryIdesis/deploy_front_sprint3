import api from "./http";

export async function listarUsuarios() {
  const { data } = await api.get("/usuarios");
  return data;
}

export async function criarUsuario(userData) {
  const { data } = await api.post("/usuarios", userData);
  return data;
}

export async function editarUsuario(userId, userData) {
  const { data } = await api.put(`/usuarios/${userId}`, userData);
  return data;
}

export async function excluirUsuario(userId) {
  const { data } = await api.delete(`/usuarios/${userId}`);
  return data;
} 