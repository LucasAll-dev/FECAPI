const API_URL = "http://localhost:3030/notas";

export async function createNota(notaData) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notaData)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Erro ao lançar notas');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Erro no createNota:", error);
    throw error;
  }
}

export async function getTotaisLuta(lutaId) {
  try {
    const res = await fetch(`${API_URL}/luta/${lutaId}/total`);
    if (!res.ok) throw new Error('Erro ao buscar totais');
    const response = await res.json();
    return response.data;
  } catch (error) {
    console.error("Erro no getTotaisLuta:", error);
    throw error;
  }
}

export async function getResultadoLuta(lutaId) {
  try {
    const res = await fetch(`${API_URL}/luta/${lutaId}/resultado`);
    if (!res.ok) throw new Error('Erro ao buscar resultado');
    const response = await res.json();
    return response;
  } catch (error) {
    console.error("Erro no getResultadoLuta:", error);
    throw error;
  }
}