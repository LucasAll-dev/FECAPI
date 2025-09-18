import db from '../config/db.js';

export const getAll = (req, res) => {
  db.all('SELECT id_competidores, nome, id_categoria FROM competidores', [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar competidores:", err);
      return res.status(500).json({ error: 'Erro do servidor' });
    }
    res.json(rows);
  });
};

export const getById = (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id_competidores, nome, id_categoria FROM competidores WHERE id_competidores = ?', [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar competidor:", err);
      return res.status(500).json({ error: 'Erro do servidor' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Competidor não encontrado' });
    }
    res.json(row);
  });
};

export const create = (req, res) => {
  const { nome, id_categoria } = req.body;
  
  // validação basica
  if (!nome || !id_categoria) {
    return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
  }

  try {
    db.run(`INSERT INTO competidores (nome, id_categoria) VALUES (?, ?)`,
      [nome, id_categoria], function (err) {
        if (err) {
          console.error("Erro ao criar competidor:", err);
          return res.status(500).json({ error: 'Erro ao criar competidor' });
        }
        res.json({ id: this.lastID, nome, id_categoria });
      });
  } catch (error) {
    console.error("Erro no create de competidores:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const update = (req, res) => {
  const { id } = req.params;
  const { nome, id_categoria } = req.body;

  if (!nome || !id_categoria) {
    return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
  }

  db.run(`UPDATE competidores SET nome = ?, id_categoria = ? WHERE id_competidores = ?`,
    [nome, id_categoria, id], function (err) {
      if (err) {
        console.error("Erro ao atualizar competidor:", err);
        return res.status(500).json({ error: 'Erro ao atualizar competidor' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Competidor não encontrado' });
      }
      res.json({ changes: this.changes, id, nome, id_categoria });
    });
};

export const remove = (req, res) => {
  const { id } = req.params;
  
  db.run(`DELETE FROM competidores WHERE id_competidores = ?`, [id], function (err) {
    if (err) {
      console.error("Erro ao deletar competidor:", err);
      return res.status(500).json({ error: 'Erro ao deletar competidor' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competidor não encontrado' });
    }
    res.json({ changes: this.changes, message: 'Competidor deletado com sucesso' });
  });
};

// buscar competidores por categoria
export const getByCategoria = (req, res) => {
  const { categoriaId } = req.params;
  
  db.all('SELECT id_competidores, nome, id_categoria FROM competidores WHERE id_categoria = ?', 
    [categoriaId], (err, rows) => {
      if (err) {
        console.error("Erro ao buscar competidores por categoria:", err);
        return res.status(500).json({ error: 'Erro do servidor' });
      }
      res.json(rows);
    });
};

//buscar competidores ativos em um campeonato (não eliminados)
export const getAtivosByCampeonato = (req, res) => {
  const { campeonatoId } = req.params;
  
  db.all(`
    SELECT c.id_competidores, c.nome, c.id_categoria 
    FROM competidores c
    WHERE c.id_categoria = (SELECT categoria_id FROM campeonato WHERE id = ?)
    AND c.id_competidores NOT IN (
      SELECT competidor_id FROM eliminacao WHERE campeonato_id = ?
    )
  `, [campeonatoId, campeonatoId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar competidores ativos:", err);
      return res.status(500).json({ error: 'Erro do servidor' });
    }
    res.json(rows);
  });
};