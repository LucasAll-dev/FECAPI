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
    await gerarChaveamento(campeonatoId);

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
  const rows = await db.all(`
    SELECT c.*, cat.nome as categoria_nome 
    FROM campeonato c 
    LEFT JOIN categoria cat ON c.categoria_id = cat.id
  `);
  res.json(rows);
}

export async function getCampeonato(req, res) {
  const row = await db.get(`
    SELECT c.*, cat.nome as categoria_nome 
    FROM campeonato c 
    LEFT JOIN categoria cat ON c.categoria_id = cat.id 
    WHERE c.id = ?
  `, [req.params.id]);
  res.json(row);
}

export async function updateCampeonato(req, res) {
  const { nome, data, categoria_id } = req.body;
  await db.run(
    `UPDATE campeonato SET nome=?, data=?, categoria_id=? WHERE id=?`, 
    [nome, data, categoria_id, req.params.id]
  );
  res.json({ id: req.params.id, nome, data, categoria_id });
}

export async function deleteCampeonato(req, res) {
  await db.run(`DELETE FROM campeonato WHERE id=?`, [req.params.id]);
  res.json({ success: true });
}

// aq o nome é auto explicativo
// aq vai pegar o campeonato, q vai ta com o id da categoria e vai dividir o chaveamento entre os competidores da categoria
async function gerarChaveamento(campeonatoId) {
  try {
    const campeonato = await db.get(
      'SELECT * FROM campeonato WHERE id = ?', 
      [campeonatoId]
    );
    
    const competidores = await db.all(
      'SELECT * FROM competidor WHERE categoria_id = ?',
      [campeonato.categoria_id]
    );
    // pra ter certeza q é par
    if (competidores.length % 2 !== 0) {
      throw new Error('Número de competidores deve ser par');
    }

    // aq vai randomizar
    const ramdomizar = [...competidores].sort(() => Math.random() - 0.5);

    // criação das duas rodadas
    const rodada1 = await createRodada({ 
      categoria_id: campeonato.categoria_id, 
      numero: 1 
    });

    const rodada2 = await createRodada({ 
      categoria_id: campeonato.categoria_id, 
      numero: 2 
    });

    // cria as lutas pra cada par
    for (let i = 0; i < ramdomizar.length; i += 2) {
      // luta rodada 1
      await createLuta({
        rodada_id: rodada1.id,
        competidor_esq_id: ramdomizar[i].id,
        competidor_dir_id: ramdomizar[i + 1].id
      });
      // rodada 2 luta
      await createLuta({
        rodada_id: rodada2.id,
        competidor_esq_id: ramdomizar[i].id,
        competidor_dir_id: ramdomizar[i + 1].id
      });
    }

    return { message: 'Chaveamento gerado com sucesso' };
  } catch (error) {
    throw error;
  }
}

// calcula pontuação com notas e faltas
async function calcularPontuacaoComFaltas(competidorId, lutaId) {
  try {
    // pega notas do sistema
    const todasNotas = await getNotas();
    // filtra notas dos competidores da luta especifica
    const notasCompetidor = todasNotas.filter(
      nota => nota.luta_id === lutaId && nota.competidor_id === competidorId
    );
    // soma as notas
    const totalNotas = notasCompetidor.reduce((sum, nota) => sum + nota.valor, 0);
    // soma as punições
    const todasPunicoes = await getPunicoes();
    const punicoesCompetidor = todasPunicoes.filter(
      punicao => punicao.luta_id === lutaId && punicao.competidor_id === competidorId
    );
    const totalPunicoes = punicoesCompetidor.reduce((sum, punicao) => sum + punicao.pontos_descontados, 0);

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

    const todasRodadas = await getRodadas();
    const rodadasCampeonato = todasRodadas.filter(
      rodada => rodada.categoria_id === campeonato.categoria_id
    );

    const todasLutas = await getLutas();
    
    const pontuacoes = {};

    for (const rodada of rodadasCampeonato) {
      const lutasRodada = todasLutas.filter(luta => luta.rodada_id === rodada.id);

      for (const luta of lutasRodada) {
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