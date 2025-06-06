import api from "./http";

export const listarLogsAuditoria = async (params = {}) => {
  const { limit = 20, skip = 0 } = params;
  const response = await api.get(`/auditoria/logs?limit=${limit}&skip=${skip}`);
  return response.data;
};

export const obterEstatisticasAuditoria = async () => {
  const response = await api.get("/auditoria/stats");
  return response.data;
};

export const reverterCampo = async (data) => {
  const response = await api.post("/auditoria/revert", data);
  return response.data;
}; 