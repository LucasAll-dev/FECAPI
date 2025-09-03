// src/services/categoriaService.js
const API_URL = "http://localhost:3030/categoria";


export async function getCategorias() {
    try {
        const res = await fetch(`${API_URL}`);
        if (!res.ok) throw new Error('erro ao buscar categorias');
        return await res.json();
    } catch (error) {
        console.error("erro no getCategorias:", error);
        throw error;
    }
}
// get id
export async function getCategoriaById(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('erro ao buscar categoria');
        return await res.json();
    } catch (error) {
        console.error("erro ao buscar catgria:", error);
        throw error;
    }
}

export async function createCategoria(data) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('erro ao criar categoria');
        return await res.json();
    } catch (error) {
        console.error("erro no createCategora:", error);
    }
    
}

export async function updateCategoria(id, data) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('erro ao atualizar categoria');
        return await res.json();
    } catch (error) {
        console.error("erro no updateCategoria:", error);
        throw error;
    }
}
export async function deleteCategoria(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error('erro ao deletar categoria');
        return await res.json();
    } catch (error) {
        console.error("erro no deleteCategoria:", error);
        throw error;
    }
}