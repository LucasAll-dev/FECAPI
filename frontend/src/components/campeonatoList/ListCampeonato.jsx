import React from "react";
import { useNavigate } from "react-router-dom";
import './styles.css'

export default function CampeonatoList({ campeonatos, onDelete, onEdit }) {
  console.log('ListCampeonato recebeu:', campeonatos);

  const navigate = useNavigate();

  const handleView = (campeonato) => {
    console.log("Navegando para campeonato ID:", campeonato.id);
    // navigate(`campeonato/${campeonato.id}`);
    navigate(`/home/campeonato/${campeonato.id}`);
  };
  
  return (
    <div className="campeonatos-container">
      <div className="campeonatos-header">
        <h2 className="campeonatos-title">Lista de Campeonatos</h2>
      </div>
      
      <table className="campeonatos-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {campeonatos.length > 0 ? (
            campeonatos.map(campeonato => (
              <tr key={campeonato.id} onClick={() => handleView(campeonato)} className="campeonato-row">
                <td>{campeonato.nome}</td>
                <td>{new Date(campeonato.data).toLocaleDateString('pt-BR')}</td>
                <td>{campeonato.categoria_nome || 'N/A'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="campeonatos-actions-container">
                    <button
                      onClick={() => onEdit(campeonato)}
                      className="campeonato-edit-button"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este campeonato?')) {
                          onDelete(campeonato.id);
                        }
                      }}
                      className="campeonato-delete-button"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="campeonatos-empty">
                Nenhum campeonato cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}