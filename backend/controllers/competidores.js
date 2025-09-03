import db from '../config/db.js';

//! LEMBRETE: lembrar de fazer metodo pra tratar erros decente dps

//cara faz o get all e nao faz o get id como que pode
export const getAll = (req, res) => {
  db.all('SELECT * FROM competidores', [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

// get id ai
export const  getById = (req, res) => {
  db.get('SELECT * FROM competidores WHERE id_competidores = ?', [id], (err, row) => {
    if (err) {
      console.error("erro ao buscar competidor:", err);
      return res.status(500).json({ error: 'erro no server' });
    }
    if (!row) {
      return res.status(404).json({ error: 'competidor nao foi encontrado' });
    }
    res.json(row);
  });
};


export const create = (req, res) => {
  const { nome, id_categoria } = req.body;
  //so uma validaçãozinha basica aq
  /*if (!nome || !id_categoria) {
    return res.status(500).json({ error: 'nome e categoria obrigatorios' });
  }*/

  try {
    db.run(`INSERT INTO competidores (nome, id_categoria) VALUES (?, ?)`,
      [nome, id_categoria], function (err) {
        if (err) return res.status(500).json(err);
        res.json({ id: this.lastID });
      });
    } catch {
      console.log("deu erro no create de competidores")
    }
};

export const update = (req, res) => {
  const { id } = req.params;
  const { nome, id_categoria, id_notas } = req.body;
  db.run(`UPDATE competidores SET nome = ?, id_categoria = ?, id_notas = ? WHERE id_competidores = ?`,
    [nome, id_categoria, id_notas, id], function (err) {
      if (err) return res.status(500).json(err);
      res.json({ changes: this.changes });
    });
};

export const remove = (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM competidores WHERE id_competidores = ?`, [id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ changes: this.changes });
  });
};
