import api from "./http";

// Obter configurações do sistema
export async function obterConfiguracoes() {
  const { data } = await api.get("/configuracoes");
  return data;
}

// Atualizar configurações do sistema
export async function atualizarConfiguracoes(configuracoes) {
  const { data } = await api.put("/configuracoes", configuracoes);
  return data;
}

// Resetar configurações para os valores padrão
export async function resetarConfiguracoes() {
  const { data } = await api.post("/configuracoes/reset");
  return data;
} 