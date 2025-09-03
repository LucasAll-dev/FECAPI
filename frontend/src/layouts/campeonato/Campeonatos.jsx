import React, { useState, useEffect } from "react";
import "./styles.css";
import { getCampeonatos, deleteCampeonato, createCampeonato, updateCampeonato } from "../../services/CampeonatoServices";
import { getCategorias } from "../../services/CategoriaServices";
import Janela from "../../components/janela/Janela";
import CampeonatoForm from "../../components/campeonatoForm/FormCampeonato";
import CampeonatoList from "../../components/campeonatoList/ListCampeonato";

export default function Campeonatos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [campeonatos, setCampeonatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campeonatoEditando, setCampeonatoEditando] = useState(null);
  const [campeonatoDetalhes, setCampeonatoDetalhes] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campeonatosData, categoriasData] = await Promise.all([
        getCampeonatos(),
        getCategorias()
      ]);
      setCampeonatos(campeonatosData);
      setCategorias(categoriasData);
    } catch (err) {
      setError("Falha ao carregar dados");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleCreate = async (novoCampeonato) => {
    try {
      await createCampeonato(novoCampeonato);
      setIsModalOpen(false);
      await loadData();
      console.log("camp criado")
    } catch (err) {
      setError("Falha ao criar campeonato: " + err.message);
      console.error("Erro:", err);
    }
  };

  const handleUpdate = async (campeonatoAtualizado) => {
    try {
      await updateCampeonato(campeonatoEditando.id, campeonatoAtualizado);
      setIsModalOpen(false);
      setCampeonatoEditando(null);
      await loadData();
      setError(null);
    } catch (err) {
      setError("Falha ao atualizar campeonato: " + err.message);
      console.error("Erro:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCampeonato(id);
      await loadData();
    } catch (err) {
      setError("Falha ao excluir campeonato");
      console.error("Erro:", err);
    }
  };

  const handleEdit = (campeonato) => {
    setCampeonatoEditando(campeonato);
    setIsModalOpen(true);
  };

  const handleView = (campeonato) => {
    setCampeonatoDetalhes(campeonato);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCampeonatoEditando(null);
    setError(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setCampeonatoDetalhes(null);
  };

  const handleSubmit = (dados) => {
    if (campeonatoEditando) {
      handleUpdate(dados);
    } else {
      handleCreate(dados);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="campeonatos-layout-container">
      <h1>Gerenciamento de Campeonatos</h1>
      
      <button 
        className="create-button"
        onClick={() => setIsModalOpen(true)}
      >
        Criar Novo Campeonato
      </button>

      <CampeonatoList 
        campeonatos={campeonatos} 
        onDelete={handleDelete} 
        onEdit={handleEdit}
        onView={handleView}
      />

      <Janela 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={campeonatoEditando ? "Editar Campeonato" : "Cadastrar Campeonato"}
      >
        <CampeonatoForm 
          onSubmit={handleSubmit} 
          categorias={categorias} 
          campeonatoEditando={campeonatoEditando}
          onCancel={handleCloseModal}
        />
      </Janela>

      <Janela 
        isOpen={isDetailModalOpen} 
        onClose={handleCloseDetailModal}
        title="Detalhes do Campeonato"
      >
        {campeonatoDetalhes && (
          <div className="detalhes-campeonato">
            <div className="detalhes-item">
              <strong>Nome:</strong> {campeonatoDetalhes.nome}
            </div>
            <div className="detalhes-item">
              <strong>Data:</strong> {new Date(campeonatoDetalhes.data).toLocaleDateString('pt-BR')}
            </div>
            <div className="detalhes-item">
              <strong>Categoria:</strong> {campeonatoDetalhes.categoria_nome || 'N/A'}
            </div>
            <div className="detalhes-item">
              <strong>ID:</strong> {campeonatoDetalhes.id}
            </div>
          </div>
        )}
      </Janela>
    </div>
  );
}