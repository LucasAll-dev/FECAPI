import React from "react";
import './styles.css'

export default function CompetidorList({ competidores, categorias, onDelete, onEdit }) {
  const getCategoriaNome = (id) => {
    const categoria = categorias.find(c => c.id_categoria === id);
    return categoria ? categoria.nome : 'N/A';
  };

  return (
    <div className="competidores-container">
      <div className="competidores-header">
        <h2 className="competidores-title">Lista de Competidores</h2>
      </div>
      
      <table className="competidores-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {competidores.length > 0 ? (
            competidores.map(competidor => (
              <tr key={competidor.id}>
                <td>{competidor.nome}</td>
                <td>{getCategoriaNome(competidor.id_categoria)}</td>
                <td>
                  <div className="actions-container">
                    <button
                      onClick={() => onEdit(competidor)}
                      className="edit-button"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este competidor?')) {
                          onDelete(competidor.id);
                        }
                      }}
                      className="delete-button"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty-state">
                Nenhum competidor cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}