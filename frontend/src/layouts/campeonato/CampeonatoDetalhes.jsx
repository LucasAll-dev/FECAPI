import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCampeonatoById } from "../../services/CampeonatoServices";
import "./styles.css";

export default function CampeonatoDetalhes() {
  const { id } = useParams();
  console.log("🎯 CampeonatoDetalhes MONTADO com ID:", id);
  const navigate = useNavigate();
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Move a lógica diretamente para dentro do useEffect
    const loadCampeonato = async () => {
      try {
        setLoading(true);
        const data = await getCampeonatoById(id);
        setCampeonato(data);
      } catch (err) {
        setError("Falha ao carregar campeonato");
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCampeonato();
  }, [id]); // ✅ Agora só depende do id

  const handleBack = () => {
    navigate("/campeonato");
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;
  if (!campeonato) return <div>Campeonato não encontrado</div>;

  return (
    <div className="campeonatos-layout-container">
      <button onClick={handleBack} className="back-button">
        ← Voltar para Campeonatos
      </button>

      <h1>Detalhes do Campeonato - ID: {id}</h1>
      
      <div className="detalhes-campeonato">
        <div className="detalhes-item">
          <strong>ID:</strong> {campeonato.id}
        </div>
        <div className="detalhes-item">
          <strong>Nome:</strong> {campeonato.nome}
        </div>
        <div className="detalhes-item">
          <strong>Data:</strong> {new Date(campeonato.data).toLocaleDateString('pt-BR')}
        </div>
        <div className="detalhes-item">
          <strong>Categoria:</strong> {campeonato.categoria_nome || 'N/A'}
        </div>
      </div>

      <div className="campeonato-actions">
        <h2>Ações do Campeonato</h2>
        <div className="action-buttons">
          <button className="action-button primary">
            Gerar Chaveamento
          </button>
          <button className="action-button secondary">
            Gerenciar Lutadores
          </button>
          <button className="action-button warning">
            Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
}