import React, { useState } from 'react';
import { createNota } from '../../services/NotasServices';
import "./styles.css";

export default function LancarNotas({ luta, onNotasLancadas }) {
  const [notasEsq, setNotasEsq] = useState({ nota1: '', punicao: '' });
  const [notasCentro, setNotasCentro] = useState({ nota2: '' });
  const [notasDir, setNotasDir] = useState({ nota3: '', punicao: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLancarNotas = async () => {
    try {
      setLoading(true);
      setMessage('');

      // ✅ Verifica se pelo menos uma nota foi preenchida para cada competidor
      if (!notasEsq.nota1 && !notasCentro.nota2 && !notasDir.nota3) {
        setMessage('Preencha pelo menos uma nota para cada competidor');
        return;
      }

      // ✅ Lança notas do competidor esquerdo (se preenchido)
      if (notasEsq.nota1 || notasCentro.nota2) {
        await createNota({
          luta_id: luta.id,
          competidor_id: luta.competidor_esq_id,
          nota1: parseFloat(notasEsq.nota1) || 0,
          nota2: parseFloat(notasCentro.nota2) || 0,
          punicao: parseFloat(notasEsq.punicao) || 0
        });
      }

      // ✅ Lança notas do competidor direito (se preenchido)
      if (notasDir.nota3 || notasCentro.nota2) {
        await createNota({
          luta_id: luta.id,
          competidor_id: luta.competidor_dir_id,
          nota3: parseFloat(notasDir.nota3) || 0,
          nota2: parseFloat(notasCentro.nota2) || 0,
          punicao: parseFloat(notasDir.punicao) || 0
        });
      }

      setMessage('✅ Notas lançadas com sucesso!');
      
      // ✅ Limpa o formulário
      setNotasEsq({ nota1: '', punicao: '' });
      setNotasCentro({ nota2: '' });
      setNotasDir({ nota3: '', punicao: '' });
      
      // ✅ Chama callback se fornecido
      if (onNotasLancadas) {
        onNotasLancadas();
      }

    } catch (error) {
      setMessage('❌ Erro ao lançar notas: ' + error.message);
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalEsq = (notas, notaCentro ) => {
    const nota1 = parseFloat(notas.nota1) || 0;
    const nota2 = parseFloat(notaCentro.nota2) || 0;
    const punicao = parseFloat(notas.punicao) || 0;
    return (nota1 + nota2 - punicao).toFixed(1);
  };

  const calcularTotalDir = (notas, notaCentro) => {
    const nota3 = parseFloat(notas.nota3) || 0;
    const nota2 = parseFloat(notaCentro.nota2) || 0;
    const punicao = parseFloat(notas.punicao) || 0;
    return (nota3 + nota2 - punicao).toFixed(1);
  };

  return (
    <div className="lancar-notas-container">
      <h4>📝 Lançar Notas</h4>
      <p><strong>{luta.competidor_esq_nome}</strong> vs <strong>{luta.competidor_dir_nome}</strong></p>
      
      <div className="notas-form">
        {/* Competidor Esquerdo */}
        <div className="competidor-notas">
          <h5>{luta.competidor_esq_nome}</h5>
          <div className="notas-inputs">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Nota 1"
              value={notasEsq.nota1}
              onChange={(e) => setNotasEsq({...notasEsq, nota1: e.target.value})}
              className="nota-input"
            />
            <input
              type="number"
              min="0"
              max="9.9"
              step="0.1"
              placeholder="Punição"
              value={notasEsq.punicao}
              onChange={(e) => setNotasEsq({...notasEsq, punicao: e.target.value})}
              className="punicao-input"
            />
          </div>
          <div className="total">
            Total: {calcularTotalEsq(notasEsq, notasCentro)}
          </div>
        </div>

        <div id='container-nota-jogo'>
          {/* VS */}
          <div className="vs">VS</div>
          {/* nota do jogo */}
          <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Nota 2"
              value={notasCentro.nota2}
              onChange={(e) => setNotasCentro({...notasCentro, nota2: e.target.value})}

              className="nota-input"
          />
        </div>
        {/* Competidor Direito */}
        <div className="competidor-notas">
          <h5>{luta.competidor_dir_nome}</h5>
          <div className="notas-inputs">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Nota 3"
              value={notasDir.nota3}
              onChange={(e) => setNotasDir({...notasDir, nota3: e.target.value})}
              className="nota-input"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Punição"
              value={notasDir.punicao}
              onChange={(e) => setNotasDir({...notasDir, punicao: e.target.value})}
              className="punicao-input"
            />
          </div>
          <div className="total">
            Total: {calcularTotalDir(notasDir, notasCentro)}
          </div>
        </div>
      </div>

      <button 
        onClick={handleLancarNotas} 
        disabled={loading}
        className="btn-lancar"
      >
        {loading ? '⏳ Lançando...' : '🚀 Lançar Notas'}
      </button>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}