const API_URL = "http://localhost:3030/campeonato";

export async function getCampeonatos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar campeonatos');
    const response = await res.json();

    console.log('Resposta completa da API:', response);
    
    return response.data || [];
  } catch (error) {
    console.error("Erro no getCampeonatos:", error);
    throw error;
  }
}

export async function getCampeonatoById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Erro ao buscar campeonato');
    return await res.json();
  } catch (error) {
    console.error("Erro no getCampeonatoById:", error);
    throw error;
  }
}

export async function createCampeonato(data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Erro ao criar campeonato');
    return await res.json();
  } catch (error) {
    console.error("Erro no createCampeonato:", error);
    throw error;
  }
}

export async function updateCampeonato(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Erro ao atualizar campeonato');
    return await res.json();
  } catch (error) {
    console.error("Erro no updateCampeonato:", error);
    throw error;
  }
}

export async function deleteCampeonato(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE" 
    });
    if (!res.ok) throw new Error('Erro ao deletar campeonato');
    return await res.json();
  } catch (error) {
    console.error("Erro no deleteCampeonato:", error);
    throw error;
  }
}