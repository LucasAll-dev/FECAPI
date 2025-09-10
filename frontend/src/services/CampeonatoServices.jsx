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
    console.log(`🔍 Buscando campeonato ID: ${id} em: ${API_URL}/${id}`);
    
    const res = await fetch(`${API_URL}/${id}`);
    console.log('📡 Status da resposta:', res.status);
    
    if (!res.ok) throw new Error('Erro ao buscar campeonato');
    
    const data = await res.json();
    console.log('✅ Dados recebidos:', data);
    
    return data;
  } catch (error) {
    console.error("Erro no getCampeonatoById:", error);
    throw error;
  }
}


// POST - Criar novo campeonato
export async function createCampeonato(data) {
  try {
    console.log('Enviando dados para o servidor:', data);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: data.nome,
        data: data.data,
        categoria_id: Number(data.categoria_id) // Mapeando para o campo correto
      })
    });

    console.log('Status da resposta:', response.status);
    console.log('Resposta do servidor:', response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.error || 'Erro ao criar campeonato');
    }

    const result = await response.json();
    console.log('Campeonato criado com sucesso:', result);
    return result;

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

export async function gerarChaveamento(campeonatoId) {
  try {
    const res = await fetch(`${API_URL}/${campeonatoId}/gerar-chaveamento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Erro ao gerar chaveamento');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Erro no gerarChaveamento:", error);
    throw error;
  }
}

export async function getRodadasCampeonato(campeonatoId) {
  try {
    const res = await fetch(`${API_URL}/${campeonatoId}/rodadas`);
    if (!res.ok) throw new Error('Erro ao buscar rodadas');
    const response = await res.json();
    return response.data;
  } catch (error) {
    console.error("Erro no getRodadasCampeonato:", error);
    throw error;
  }
}

export async function getLutasRodada(rodadaId) {
  console.log(`🔄 Buscando lutas da rodada ${rodadaId} em: ${API_URL}/rodada/${rodadaId}/lutas`);
  try {
    const res = await fetch(`${API_URL}/rodada/${rodadaId}/lutas`);
    if (!res.ok) throw new Error('Erro ao buscar lutas');
    const response = await res.json();
    return response.data;
  } catch (error) {
    console.error("Erro no getLutasRodada:", error);
    throw error;
  }
}