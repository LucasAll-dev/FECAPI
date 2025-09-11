import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCampeonatoById, gerarChaveamento, getRodadasCampeonato, getLutasRodada, finalizarRodada } from "../../services/CampeonatoServices";
import LancarNotas from "../../components/pontuacao/LancarNotas";
import "./styles.css";

export default function CampeonatoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chaveamentoStatus, setChaveamentoStatus] = useState(''); 
  const [rodadas, setRodadas] = useState([]);
  const [mostrarChaveamento, setMostrarChaveamento] = useState(false);
  const [lutaSelecionada, setLutaSelecionada] = useState(null);

  const loadCampeonato = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCampeonatoById(id);
      console.log('📋 Dados do campeonato recebidos:', data);
      setCampeonato(data);
    } catch (err) {
      setError("Falha ao carregar campeonato");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadChaveamento = useCallback(async () => {
    try {
      const rodadasData = await getRodadasCampeonato(id);
      const rodadasComLutas = await Promise.all(
        rodadasData.map(async (rodada) => {
          const lutas = await getLutasRodada(rodada.id);
          return { ...rodada, lutas };
        })
      )
      setRodadas(rodadasComLutas);
    } catch (err) {
      console.log("Chaveamento ainda não gerado ou erro:", err);
    }
  }, [id]);

  useEffect(() => {
    loadCampeonato();
    loadChaveamento();
  }, [loadCampeonato, loadChaveamento]);

  const handleGerarChaveamento = async () => {
    try {
      setChaveamentoStatus('Gerando chaveamento...');
      const resultado = await gerarChaveamento(id);
      
      setChaveamentoStatus('Chaveamento gerado com sucesso!');
      console.log('Chaveamento:', resultado);
      
      await loadCampeonato();
      await loadChaveamento();
      setMostrarChaveamento(true);
      
    } catch (error) {
      setChaveamentoStatus('Erro ao gerar chaveamento: ' + error.message);
      console.error('Erro:', error);
    }
  };

  const handleFinalizarRodada = async () => {
    try {
      setChaveamentoStatus('🏁 Finalizando rodada...');
      const resultado = await finalizarRodada(id);
      
      setChaveamentoStatus(`✅ ${resultado.message}`);
      console.log('Eliminados:', resultado.eliminados);
      console.log('Classificados:', resultado.classificados);
      
      await loadChaveamento();
      
    } catch (error) {
      setChaveamentoStatus('❌ Erro ao finalizar rodada: ' + error.message);
      console.error('Erro:', error);
    }
  };

  const toggleChaveamento = () => {
    setMostrarChaveamento(!mostrarChaveamento);
  };

  const handleBack = () => {
    navigate("/home/campeonato");
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;
  if (!campeonato) return <div>Campeonato não encontrado</div>;

  return (
    <div className="campeonatos-layout-container">
      <button onClick={handleBack} className="back-button">
        ← Voltar para Campeonatos
      </button>

      <h1>Detalhes do Campeonato - {campeonato.nome}</h1>
      
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
            disabled={chaveamentoStatus.includes('Gerando')}
          >
            {chaveamentoStatus.includes('Gerando') ? 'Gerando...' : 'Gerar Nova Rodada'}
          </button>
          
          <button 
            onClick={toggleChaveamento} 
            className="action-button secondary"
            disabled={rodadas.length === 0}
          >
            {mostrarChaveamento ? 'Ocultar Chaveamento' : 'Mostrar Chaveamento'}
          </button>
          
          <button 
            onClick={handleFinalizarRodada} 
            className="action-button danger"
            disabled={rodadas.length === 0 || chaveamentoStatus.includes('Finalizando')}
          >
            {chaveamentoStatus.includes('Finalizando') ? 'Finalizando...' : '🏁 Finalizar Rodada'}
          </button>
          
          <button className="action-button warning">
            Ver Resultados
          </button>
        </div>

        {chaveamentoStatus && (
          <div className={`chaveamento-status ${chaveamentoStatus.includes('❌') ? 'error' : 'success'}`}>
            {chaveamentoStatus}
          </div>
        )}

        {mostrarChaveamento && rodadas.length > 0 && (
          <div className="chaveamento-container">
            <h3>Chaveamento do Campeonato</h3>
            
            {rodadas.map(rodada => (
              <div key={rodada.id} className="rodada">
                <h4>Rodada {rodada.numero}</h4>
                
                <div className="lutas-container">
                  {rodada.lutas && rodada.lutas.map(luta => (
                    <div key={luta.id} className="luta-card">
                      <div className="competidores-luta">
                        <span className="competidor">{luta.competidor_esq_nome}</span>
                        <span className="vs">VS</span>
                        <span className="competidor">{luta.competidor_dir_nome}</span>
                      </div>
                      
                      <div className="luta-actions">
                        <button 
                          className="btn-notas"
                          onClick={() => setLutaSelecionada(luta)}
                        >
                          Lançar Notas
                        </button>
                        <button className="btn-resultado">
                          Ver Resultado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {mostrarChaveamento && rodadas.length === 0 && (
          <div className="chaveamento-vazio">
            <p>Nenhum chaveamento gerado ainda. Clique em "Gerar Chaveamento".</p>
          </div>
        )}
      </div>

      {lutaSelecionada && (
        <LancarNotas 
          luta={lutaSelecionada}
          onNotasLancadas={() => {
            setLutaSelecionada(null);
            loadChaveamento();
          }}
          onCancelar={() => setLutaSelecionada(null)}
        />
      )}
    </div>
  );
}