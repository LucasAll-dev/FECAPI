import React, { useState, useEffect } from "react";
import "./styles.css";
import { getCompetidores, deleteCompetidor, createCompetidor, updateCompetidor, validarCategoria } from "../../services/CompetidorServices";
import { getCategorias } from "../../services/CategoriaServices";
import Janela from "../../components/janela/Janela";
import CompetidorForm from "../../components/competidoresForm/CompetidorForm";
import CompetidorList from "../../components/competidoresList/CompetidorList";

export default function Competidores() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [competidores, setCompetidores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competidorEditando, setCompetidorEditando] = useState(null);

  // Carrega competidores e categorias simultaneamente
  const loadData = async () => {
    try {
      setLoading(true);
      const [competidoresData, categoriasData] = await Promise.all([
        getCompetidores(),
        getCategorias()
      ]);
      setCompetidores(competidoresData);
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

  const handleCreate = async (novoCompetidor) => {
    try {
      const categoriaValidada = await validarCategoria(novoCompetidor.id_categoria);
      if (!categoriaValidada) {
        setError("categoria invalida ou não encontrada");
        return;
      }

      await createCompetidor(novoCompetidor);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError("Falha ao criar competidor" + err.message);
      console.error("Erro:", err);
    }
  };

  // update pra nois
  const handleUpdate = async (competidorAtualizado) => {
    try{
      const categoriaValida = await validarCategoria(competidorAtualizado.id_categoria);
      if (!categoriaValida) {
        setError("categoria invalida ou não encontrada");
        return;
      }

      await updateCompetidor(competidorEditando.id_competidores, competidorAtualizado);
      setIsModalOpen(false);
      setCompetidorEditando(null);
      await loadData();
      setError(null);
    }catch (err) {
      setError("falha ao atualizar competidor: " + err.message);
      console.error("erro:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCompetidor(id);
      await loadData();
      console.log("competidor excluido")
    } catch (err) {
      setError("Falha ao excluir competidor");
      console.error("Erro:", err);
    }
  };

  const handleEdit = (competidor) => {
    setCompetidorEditando(competidor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCompetidorEditando(null);
    setError(null);
  };

  const handleSubmit = (dados) => {
    if (competidorEditando) {
      handleUpdate(dados);
    } else {
      handleCreate(dados);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="competidores-container">
      <h1>Gerenciamento de Competidores</h1>
      
      <button 
        className="create-button"
        onClick={() => setIsModalOpen(true)}
      >
        Criar Novo Competidor
      </button>

      <CompetidorList 
        competidores={competidores} 
        categorias={categorias}
        onDelete={handleDelete} 
        onEdit={handleEdit}
      />

      <Janela 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={competidorEditando ? "Editar Competidor" : "Cadastrar Competidor"}
      >
        <CompetidorForm 
          onSubmit={handleSubmit} 
          categorias={categorias} 
          competidorEditando={competidorEditando}
          onCancel={handleCloseModal}
        />
      </Janela>
    </div>
  );
}