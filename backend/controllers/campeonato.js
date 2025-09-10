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
    // Query CORRETA com JOIN ajustado
    const row = await db.get(`
      SELECT c.*, cat.nome as categoria_nome 
      FROM campeonato c 
      LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria 
      WHERE c.id = ?
    `, [req.params.id]);
    res.json(row);
  } catch (error) {
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

// aq o nome é auto explicativo
// aq vai pegar o campeonato, q vai ta com o id da categoria e vai dividir o chaveamento entre os competidores da categoria
export async function gerarChaveamento(campeonatoId) {
  try {
    // Busca o campeonato
    const campeonato = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM campeonato WHERE id = ?', [campeonatoId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📋 Campeonato:', campeonato);

    if (!campeonato) {
      throw new Error(`❌ Campeonato com ID ${campeonatoId} não foi encontrado no banco de dados`);
    }
    
    // Busca competidores COM PROMISE
    const competidores = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM competidores WHERE id_categoria = ?',
        [campeonato.categoria_id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });

    console.log('🥋 Competidores encontrados:', competidores);
    console.log('🔢 Número de competidores:', competidores.length);
    console.log('🎯 Categoria ID:', campeonato.categoria_id);

    // ✅ VERIFICAÇÃO CORRIGIDA:
    if (!competidores || !Array.isArray(competidores)) {
      throw new Error('Erro ao buscar competidores: resultado não é um array');
    }

    if (competidores.length === 0) {
      throw new Error('Nenhum competidor encontrado nesta categoria');
    }

    if (competidores.length % 2 !== 0) {
      throw new Error(`Número de competidores deve ser par (encontrado: ${competidores.length})`);
    }

    // Embaralha os competidores
    const shuffled = [...competidores].sort(() => Math.random() - 0.5);

    // Cria rodadas com campo CORRETO (campeonato_id)
    const rodada1 = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO rodada (campeonato_id, numero) VALUES (?, 1)',
        [campeonatoId],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    const rodada2 = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO rodada (campeonato_id, numero) VALUES (?, 2)',
        [campeonatoId],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    // Cria lutas com IDs CORRETOS (id_competidores)
    for (let i = 0; i < shuffled.length; i += 2) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO luta (rodada_id, competidor_esq_id, competidor_dir_id) VALUES (?, ?, ?)`,
          [rodada1.lastID, shuffled[i].id_competidores, shuffled[i + 1].id_competidores],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO luta (rodada_id, competidor_esq_id, competidor_dir_id) VALUES (?, ?, ?)`,
          [rodada2.lastID, shuffled[i].id_competidores, shuffled[i + 1].id_competidores],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    return { message: 'Chaveamento gerado com sucesso' };
  } catch (error) {
    console.error('❌ Erro no gerarChaveamento:', error);
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