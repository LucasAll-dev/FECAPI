import db from '../config/db.js';

export async function createNota(req, res) {
  try {
    const { luta_id, competidor_id, nota1, nota2, punicao = 0 } = req.body;
    
    // Calcula o total (nota1 + nota2 - punicao)
    const total = parseFloat(nota1) + parseFloat(nota2) - parseFloat(punicao);
    
    // ✅ USA A ESTRUTURA EXISTENTE: cria 3 registros (nota1, nota2, punicao)
    const results = [];
    
    // Nota 1
    const result1 = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO nota (luta_id, competidor_id, valor, tipo) VALUES (?, ?, ?, 'competidor')`,
        [luta_id, competidor_id, nota1],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    results.push(result1);
    
    // Nota 2
    const result2 = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO nota (luta_id, competidor_id, valor, tipo) VALUES (?, ?, ?, 'competidor')`,
        [luta_id, competidor_id, nota2],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    results.push(result2);
    
    // Punição (se houver)
    if (punicao > 0) {
      const resultPunicao = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO nota (luta_id, competidor_id, valor, tipo) VALUES (?, ?, ?, 'competidor')`,
          [luta_id, competidor_id, -punicao], // ✅ Valor negativo para punição
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      results.push(resultPunicao);
    }
    
    res.json({
      success: true,
      message: 'Notas lançadas com sucesso',
      total: total,
      registros: results.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ FUNÇÃO PARA CALCULAR TOTAL DE UMA LUTA
export async function getTotalLuta(req, res) {
  try {
    const { luta_id } = req.params;
    
    const totals = await new Promise((resolve, reject) => {
      db.all(
        `SELECT competidor_id, SUM(valor) as total
         FROM nota 
         WHERE luta_id = ? AND tipo = 'competidor'
         GROUP BY competidor_id`,
        [luta_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    res.json({ success: true, data: totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ MANTÉM AS FUNÇÕES EXISTENTES
export async function getNotas(_, res) {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM nota`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getResultadoLuta(req, res) {
  try {
    const { luta_id } = req.params;
    
    const resultado = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.id_competidores,
          c.nome,
          COALESCE(SUM(
            CASE 
              WHEN n.valor < 0 THEN n.valor  -- Punições (valores negativos)
              ELSE n.valor                   -- Notas normais
            END
          ), 0) as pontuacao_total,
          GROUP_CONCAT(
            CASE 
              WHEN n.valor < 0 THEN 'P(' || ABS(n.valor) || ')'
              ELSE n.valor 
            END
          ) as notas_detalhadas
        FROM competidores c
        JOIN nota n ON c.id_competidores = n.competidor_id
        WHERE n.luta_id = ?
        GROUP BY c.id_competidores, c.nome
        ORDER BY pontuacao_total DESC
      `, [luta_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Determinar vencedor
    let vencedor = null;
    if (resultado.length >= 2) {
      if (resultado[0].pontuacao_total > resultado[1].pontuacao_total) {
        vencedor = resultado[0];
      }
      // Em caso de empate, não há vencedor definido
    } else if (resultado.length === 1) {
      vencedor = resultado[0];
    }
    
    res.json({ 
      success: true, 
      data: resultado,
      vencedor: vencedor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}