const API_URL = "http://localhost:3030/campeonato";

export async function getCampeonatos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar campeonatos');
    return await res.json();
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
    console.log('Enviando dados para o servidor:', data);
    
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: data.nome,
        data: data.data,
        id_categoria: Number(data.id_categoria)
      })
    });

    console.log('Resposta do servidor:', response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.error || 'Erro ao criar competidor');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro completo na requisição:', error);
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