import db from '../config/db.js';
/*import { createLuta } from './luta.js';
import { createNota, getNotas } from './notas.js';
import { createPunicao, getPunicoes } from './punicao.js';
import { createRodada, getRodadas } from './rodada.js';*/

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
      message: 'Campeonato criado e chaveamento gerado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCampeonatos(req, res) {
  try {
    // Certifique-se de que 'db' está importado/instanciado
    const rows = await db.all(`
      SELECT c.*, cat.nome as categoria_nome 
      FROM campeonato c 
      LEFT JOIN categoria cat ON c.categoria_id = cat.id_categoria
      ORDER BY c.nome -- Adicione ordenação para consistência
    `);

    if (rows.length === 0) {
      return res.status(200).json({ message: 'Nenhum campeonato encontrado', data: [] });
    }

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Erro ao buscar campeonatos:', error);
    res.status(500).json({ 
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
async function gerarChaveamento(campeonatoId) {
  try {
    // Busca o campeonato
    const campeonato = await db.get(
      'SELECT * FROM campeonato WHERE id = ?', 
      [campeonatoId]
    );
    
    // Busca competidores com nome CORRETO da tabela
    const competidores = await db.all(
      'SELECT * FROM competidores WHERE id_categoria = ?',
      [campeonato.categoria_id]
    );

    if (competidores.length % 2 !== 0) {
      throw new Error('Número de competidores deve ser par');
    }

    // Embaralha os competidores
    const shuffled = [...competidores].sort(() => Math.random() - 0.5);

    // Cria rodadas com campo CORRETO (campeonato_id)
    const rodada1 = await db.run(
      'INSERT INTO rodada (campeonato_id, numero) VALUES (?, 1)',
      [campeonatoId]
    );

    const rodada2 = await db.run(
      'INSERT INTO rodada (campeonato_id, numero) VALUES (?, 2)',
      [campeonatoId]
    );

    // Cria lutas com IDs CORRETOS (id_competidores)
    for (let i = 0; i < shuffled.length; i += 2) {
      await db.run(
        `INSERT INTO luta (rodada_id, competidor_esq_id, competidor_dir_id) 
         VALUES (?, ?, ?)`,
        [rodada1.lastID, shuffled[i].id_competidores, shuffled[i + 1].id_competidores]
      );

      await db.run(
        `INSERT INTO luta (rodada_id, competidor_esq_id, competidor_dir_id) 
         VALUES (?, ?, ?)`,
        [rodada2.lastID, shuffled[i].id_competidores, shuffled[i + 1].id_competidores]
      );
    }

    return { message: 'Chaveamento gerado com sucesso' };
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