import React, { useState, useEffect } from "react";
import "./styles.css";

export default function CampeonatoForm({ onSubmit, campeonatoEditando, onCancel, categorias }) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [id_categoria, setIdCategoria] = useState(categorias[0]?.id || "");
  
  const [error, setError] = useState("");

  useEffect(() => {
    if(campeonatoEditando) {
      setNome(campeonatoEditando.nome || "");
      setData(campeonatoEditando.data || "");
      setIdCategoria(campeonatoEditando.id_categoria || "");
    } else {
      setNome("");
      setData("");
      setIdCategoria(categorias[0]?.id_categoria || "");
    }
  }, [campeonatoEditando, categorias])

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      setError("O nome é obrigatório");
      return;
    }
    
    if (!data) {
      setError("A data é obrigatória");
      return;
    }

    if (!id_categoria) {
      setError("Selecione uma categoria");
      return;
    }

    setError("");
    onSubmit({ nome, data, categoria_id: Number(id_categoria) });
    
    if (!campeonatoEditando) {
      setNome("");
      setData("");
      setIdCategoria("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="campeonato-form">
      <div className="form-group">
        <label>Nome:</label>
        <input
          placeholder="Nome do campeonato"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Data:</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Categoria:</label>
        <select
          value={id_categoria}
          onChange={(e) => setIdCategoria(e.target.value)}
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(categoria => (
            <option key={categoria.id_categoria} value={categoria.id_categoria}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-buttons">
        <button type="submit" className="submit-button">
          {campeonatoEditando ? 'Atualizar' : 'Salvar'}
        </button>
        
        {campeonatoEditando && (
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-button"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}