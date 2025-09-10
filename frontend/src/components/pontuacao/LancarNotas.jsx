import React, { useState } from 'react';
import { createNota } from '../../services/NotasServices';
import "./styles.css";

export default function LancarNotas({ luta, onNotasLancadas }) {
  const [notasEsq, setNotasEsq] = useState({ nota1: '', nota2: '', punicao: '' });
  const [notasDir, setNotasDir] = useState({ nota1: '', nota2: '', punicao: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLancarNotas = async () => {
    try {
      setLoading(true);
      setMessage('');

      // ✅ Verifica se pelo menos uma nota foi preenchida para cada competidor
      if (!notasEsq.nota1 && !notasEsq.nota2 && !notasDir.nota1 && !notasDir.nota2) {
        setMessage('Preencha pelo menos uma nota para cada competidor');
        return;
      }

      // ✅ Lança notas do competidor esquerdo (se preenchido)
      if (notasEsq.nota1 || notasEsq.nota2) {
        await createNota({
          luta_id: luta.id,
          competidor_id: luta.competidor_esq_id,
          nota1: parseFloat(notasEsq.nota1) || 0,
          nota2: parseFloat(notasEsq.nota2) || 0,
          punicao: parseFloat(notasEsq.punicao) || 0
        });
      }

      // ✅ Lança notas do competidor direito (se preenchido)
      if (notasDir.nota1 || notasDir.nota2) {
        await createNota({
          luta_id: luta.id,
          competidor_id: luta.competidor_dir_id,
          nota1: parseFloat(notasDir.nota1) || 0,
          nota2: parseFloat(notasDir.nota2) || 0,
          punicao: parseFloat(notasDir.punicao) || 0
        });
      }

      setMessage('✅ Notas lançadas com sucesso!');
      
      // ✅ Limpa o formulário
      setNotasEsq({ nota1: '', nota2: '', punicao: '' });
      setNotasDir({ nota1: '', nota2: '', punicao: '' });
      
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

  const calcularTotal = (notas) => {
    const nota1 = parseFloat(notas.nota1) || 0;
    const nota2 = parseFloat(notas.nota2) || 0;
    const punicao = parseFloat(notas.punicao) || 0;
    return (nota1 + nota2 - punicao).toFixed(1);
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
              max="10"
              step="0.1"
              placeholder="Nota 2"
              value={notasEsq.nota2}
              onChange={(e) => setNotasEsq({...notasEsq, nota2: e.target.value})}
              className="nota-input"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Punição"
              value={notasEsq.punicao}
              onChange={(e) => setNotasEsq({...notasEsq, punicao: e.target.value})}
              className="punicao-input"
            />
          </div>
          <div className="total">
            Total: {calcularTotal(notasEsq)}
          </div>
        </div>

        {/* VS */}
        <div className="vs">VS</div>

        {/* Competidor Direito */}
        <div className="competidor-notas">
          <h5>{luta.competidor_dir_nome}</h5>
          <div className="notas-inputs">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Nota 1"
              value={notasDir.nota1}
              onChange={(e) => setNotasDir({...notasDir, nota1: e.target.value})}
              className="nota-input"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Nota 2"
              value={notasDir.nota2}
              onChange={(e) => setNotasDir({...notasDir, nota2: e.target.value})}
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
            Total: {calcularTotal(notasDir)}
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