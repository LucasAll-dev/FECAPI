import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCampeonatoById, gerarChaveamento } from "../../services/CampeonatoServices";
import "./styles.css";

export default function CampeonatoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chaveamentoStatus, setChaveamentoStatus] = useState(''); 

  const loadCampeonato = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {

    loadCampeonato();
  }, [loadCampeonato]);

  const handleGerarChaveamento = async () => {
    try {
      setChaveamentoStatus('Gerando chaveamento...');
      const resultado = await gerarChaveamento(id);
      
      setChaveamentoStatus('Chaveamento gerado com sucesso!');
      console.log('Chaveamento:', resultado);
      
      // Recarrega os dados do campeonato
      await loadCampeonato();
      
    } catch (error) {
      setChaveamentoStatus('Erro ao gerar chaveamento: ' + error.message);
      console.error('Erro:', error);
    }
  };


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
          <strong>Nome:</strong> {campeonato.nome}
        </div>
        <div className="detalhes-item">
          <strong>Categoria:</strong> {campeonato.categoria_nome || 'N/A'}
        </div>
      </div>

      <div className="campeonato-actions">
        <h2>Ações do Campeonato</h2>
        <div className="action-buttons">
          <button 
            onClick={handleGerarChaveamento} 
            className="action-button primary"
            disabled={chaveamentoStatus === 'Gerando chaveamento...'}
          >
            {chaveamentoStatus === 'Gerando chaveamento...' ? 'Gerando...' : 'Gerar Chaveamento'}
          </button>
          <button className="action-button secondary">
            Gerenciar Lutadores
          </button>
          <button className="action-button warning">
            Ver Resultados
          </button>
        </div>

        {chaveamentoStatus && (
          <div className={`chaveamento-status ${chaveamentoStatus.includes('Erro') ? 'error' : 'success'}`}>
            {chaveamentoStatus}
          </div>
        )}

      </div>
    </div>
  );
}