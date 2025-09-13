import db from '../config/db.js';
import { createLuta } from './luta.js';
import { createNota, getNotas } from './notas.js';
import { createPunicao, getPunicoes } from './punicao.js';
import { createRodada, getRodadas } from './rodada.js';

// ATUALIZADO PRA TER CATEGORIA NO CAMPEONATO PAI

export async function createCampeonato(req, res) {
  const { nome, data, categoria_id } = req.body;
  
  try {
    const result = await db.run(
      `INSERT INTO campeonato (nome, data, categoria_id) VALUES (?, ?, ?)`, 
      [nome, data, categoria_id]
    );
    
    const campeonatoId = result.lastID;
    //await gerarChaveamento(campeonatoId);

    res.json({ 
      id: campeonatoId, 
      nome, 
      data, 
      categoria_id,
      message: 'Campeonato criado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// export async function getCampeonatos(req, res) {
//   try {
//     // Certifique-se de que 'db' está importado/instanciado
//     const rows = await db.all(`
//       SELECT c.*, cat.nome as categoria_nome 
//       FROM campeonato c 
//       LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria
//       ORDER BY c.nome -- Adicione ordenação para consistência
//     `);

//     console.log('Backend - Campeonatos encontrados:', rows);
//     console.log('Backend - Tipo de rows:', typeof rows);
//     console.log('Backend - É array?', Array.isArray(rows));

    

//     // if (rows.length === 0) {
//     //   return res.status(200).json({ message: 'Nenhum campeonato encontrado', data: [] });
//     // }
//     res.status(200).json({ 
//       success: true, 
//       data: rows,
//       count: rows.length
//     });


//   } catch (error) {
//     console.error('Erro ao buscar campeonatos:', error);
//     res.status(500).json({ 
//       error: 'Erro interno do servidor',
//       message: error.message 
//     });
//   }
// }

export async function getCampeonatos(req, res) {
  try {
    // Use Promise para lidar com a query async
    const rows = await new Promise((resolve, reject) => {
      db.all(`
        SELECT c.*, cat.nome as categoria_nome 
        FROM campeonato c 
        LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria
        ORDER BY c.nome
      `, (err, rows) => {
        if (err) {
          console.error('Erro na query:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    console.log('✅ Backend - Campeonatos:', rows);
    
    // APENAS UMA RESPOSTA!
    res.status(200).json({ 
      success: true, 
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar campeonatos:', error);
    // APENAS UMA RESPOSTA DE ERRO!
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
}

export async function getCampeonato(req, res) {
  try {
    const id = req.params.id;
    console.log('🔍 Buscando campeonato ID:', id);
    // Query CORRETA com JOIN ajustado
    db.get(`
      SELECT c.*, cat.nome as categoria_nome 
      FROM campeonato c 
      LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria 
      WHERE c.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('❌ Erro na query:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('✅ Resultado da query:', row);
      
      if (!row) {
        console.log('❌ Campeonato não encontrado');
        return res.status(404).json({ error: 'Campeonato não encontrado' });
      }
      
      res.json(row);
    });
    
  } catch (error) {
    console.error('❌ Erro no getCampeonato:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateCampeonato(req, res) {
  const { nome, data, categoria_id } = req.body;
  try {
    await db.run(
      `UPDATE campeonato SET nome=?, data=?, categoria_id=? WHERE id=?`, 
      [nome, data, categoria_id, req.params.id]
    );
    res.json({ id: req.params.id, nome, data, categoria_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCampeonato(req, res) {
  try {
    await db.run(`DELETE FROM campeonato WHERE id=?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function finalizarRodada(req, res) {
  try {
    const campeonatoId = req.params.id;
    
    const pontuacoes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT c.id_competidores, c.nome, COALESCE(SUM(n.valor), 0) as pontuacao
        FROM competidores c
        LEFT JOIN nota n ON c.id_competidores = n.competidor_id
        WHERE c.id_categoria = (SELECT categoria_id FROM campeonato WHERE id = ?)
        AND c.eliminado = 0
        GROUP BY c.id_competidores, c.nome
        ORDER BY pontuacao ASC
      `, [campeonatoId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const quantidadeEliminar = Math.floor(pontuacoes.length / 2);
    
    for (let i = 0; i < quantidadeEliminar; i++) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE competidores SET eliminado = 1 WHERE id_competidores = ?',
          [pontuacoes[i].id_competidores],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({
      success: true,
      message: `Rodada finalizada! ${quantidadeEliminar} competidores eliminados`,
      eliminados: pontuacoes.slice(0, quantidadeEliminar),
      classificados: pontuacoes.slice(quantidadeEliminar)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// aq o nome é auto explicativo
// aq vai pegar o campeonato, q vai ta com o id da categoria e vai dividir o chaveamento entre os competidores da categoria
export async function gerarChaveamento(campeonatoId) {
  try {
    const campeonato = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM campeonato WHERE id = ?', [campeonatoId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const competidores = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM competidores WHERE id_categoria = ? AND eliminado = 0',
        [campeonato.categoria_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const ultimaRodada = await new Promise((resolve, reject) => {
      db.get(
        'SELECT MAX(numero) as numero FROM rodada WHERE campeonato_id = ?',
        [campeonatoId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.numero : 0);
        }
      );
    });

    const novaRodada = ultimaRodada + 1;
    
    const rodada = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO rodada (campeonato_id, numero) VALUES (?, ?)',
        [campeonatoId, novaRodada],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, numero: novaRodada });
        }
      );
    });

    const shuffled = [...competidores].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length; i += 2) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO luta (rodada_id, competidor_esq_id, competidor_dir_id) VALUES (?, ?, ?)`,
          [rodada.lastID, shuffled[i].id_competidores, shuffled[i + 1].id_competidores],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    return { 
      message: `Lutas da Rodada ${novaRodada} geradas com sucesso`,
      rodada: novaRodada,
      total_lutas: Math.floor(competidores.length / 2)
    };
  } catch (error) {
    throw error;
  }
}



// calcula pontuação com notas e faltas
async function calcularPontuacaoComFaltas(competidorId, lutaId) {
  try {
    // Busca notas - nome CORRETO da tabela
    const notas = await db.all(
      `SELECT SUM(valor) as total_notas 
       FROM nota WHERE competidor_id = ? AND luta_id = ?`,
      [competidorId, lutaId]
    );

    // Busca punições - nome CORRETO da tabela
    const punicoes = await db.all(
      `SELECT SUM(pontos_descontados) as total_punicoes 
       FROM punicao WHERE competidor_id = ? AND luta_id = ?`,
      [competidorId, lutaId]
    );

    const totalNotas = notas[0].total_notas || 0;
    const totalPunicoes = punicoes[0].total_punicoes || 0;

    return Math.max(0, totalNotas - totalPunicoes);
  } catch (error) {
    throw error;
  }
}
// processa todas as rodadas do camp e calcula a pontuação do competidor
// vai pegar o id do campeonato e todas as rodadas e lutas, processar as pontuações e atribuir a cada competidor
async function processarRodadas(campeonatoId) {
  try {
    const campeonato = await db.get(
      'SELECT * FROM campeonato WHERE id = ?', 
      [campeonatoId]
    );

    // Busca rodadas do campeonato
    const rodadas = await db.all(
      `SELECT r.* FROM rodada r WHERE r.campeonato_id = ? ORDER BY r.numero`,
      [campeonatoId]
    );

    const pontuacoes = {};

    for (const rodada of rodadas) {
      // Busca lutas da rodada
      const lutas = await db.all(
        `SELECT * FROM luta WHERE rodada_id = ?`,
        [rodada.id]
      );

      for (const luta of lutas) {
        const pontosA = await calcularPontuacaoComFaltas(luta.competidor_esq_id, luta.id);
        const pontosB = await calcularPontuacaoComFaltas(luta.competidor_dir_id, luta.id);

        if (!pontuacoes[luta.competidor_esq_id]) {
          pontuacoes[luta.competidor_esq_id] = 0;
        }
        if (!pontuacoes[luta.competidor_dir_id]) {
          pontuacoes[luta.competidor_dir_id] = 0;
        }

        pontuacoes[luta.competidor_esq_id] += pontosA;
        pontuacoes[luta.competidor_dir_id] += pontosB;
      }
    }

    return pontuacoes;
  } catch (error) {
    throw error;
  }
}
// elimina a metade com menores notas
// vai separar os com melhores notas e piores notas e eliminar
async function eliminarCompetidores(campeonatoId) {
  try {
    const pontuacoes = await processarRodadas(campeonatoId);
    
    const pontuacaoArray = Object.entries(pontuacoes).map(
      ([competidorId, pontos]) => ({ competidorId: parseInt(competidorId), pontos })
    );
    
    pontuacaoArray.sort((a, b) => b.pontos - a.pontos);

    const totalCompetidores = pontuacaoArray.length;
    const quantidadeManter = Math.ceil(totalCompetidores / 2);
    const classificados = pontuacaoArray.slice(0, quantidadeManter);
    const eliminados = pontuacaoArray.slice(quantidadeManter);

    return {
      classificados,
      eliminados,
      totalCompetidores,
      quantidadeEliminar: eliminados.length
    };
  } catch (error) {
    throw error;
  }
}

// vai confirmar a eliminacao da rapaziada
export async function executarEliminatoria(req, res) {
  try {
    const campeonatoId = req.params.id;
    const resultado = await eliminarCompetidores(campeonatoId);
    
    res.json({
      success: true,
      message: `Eliminados ${resultado.quantidadeEliminar} competidores`,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// ✅ ADICIONE ESTA FUNÇÃO ANTES DO ÚLTIMO }
export async function gerarChaveamentoCampeonato(req, res) {
  try {
    const campeonatoId = req.params.id;
    
    console.log('📝 ID recebido na rota:', campeonatoId);
    console.log('📝 Tipo do ID:', typeof campeonatoId);
    
    // ✅ CONVERTE PARA NÚMERO
    const id = parseInt(campeonatoId);
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        error: `ID inválido: ${campeonatoId}` 
      });
    }
    
    const resultado = await gerarChaveamento(id);
    
    res.json({
      success: true,
      message: 'Chaveamento gerado com sucesso',
      ...resultado
    });
  } catch (error) {
    console.error('❌ ERRO NO GERAR CHAVEAMENTO:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// ✅ Buscar rodadas do campeonato
export async function getRodadasByCampeonato(req, res) {
  try {
    const rodadas = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM rodada WHERE campeonato_id = ? ORDER BY numero',
        [req.params.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    res.json({ success: true, data: rodadas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ✅ Buscar lutas da rodada com nomes dos competidores
export async function getLutasByRodada(req, res) {
  try {
    const lutas = await new Promise((resolve, reject) => {
      db.all(`
        SELECT l.*, 
               e.nome as competidor_esq_nome,
               d.nome as competidor_dir_nome
        FROM luta l
        JOIN competidores e ON l.competidor_esq_id = e.id_competidores
        JOIN competidores d ON l.competidor_dir_id = d.id_competidores
        WHERE l.rodada_id = ?
      `, [req.params.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: lutas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getClassificacaoRodada(req, res) {
  try {
    const { campeonatoId, rodadaId } = req.params;
    
    const classificacao = await new Promise((resolve, reject) => {
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
          COUNT(DISTINCT l.id) as total_lutas
        FROM competidores c
        LEFT JOIN luta l ON (c.id_competidores = l.competidor_esq_id OR c.id_competidores = l.competidor_dir_id)
        LEFT JOIN nota n ON (c.id_competidores = n.competidor_id AND n.luta_id = l.id)
        WHERE l.rodada_id = ? 
        AND c.id_categoria = (SELECT categoria_id FROM campeonato WHERE id = ?)
        AND c.eliminado = 0
        GROUP BY c.id_competidores, c.nome
        ORDER BY pontuacao_total DESC
      `, [rodadaId, campeonatoId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: classificacao });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}