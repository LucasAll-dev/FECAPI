import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

sqlite3.verbose();

// Pega o diretório atual deste arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para a pasta "data"
const dataDir = path.join(__dirname, '../data');

// Cria a pasta "data" se não existir
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Caminho absoluto do arquivo do banco
const dbPath = path.join(dataDir, 'database.sqlite');

console.log('Banco de dados salvo em:', dbPath);

// Conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir banco:', err.message);
  }
});

// Criar tabelas apenas se não existirem
db.serialize(() => {
    //Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      usuario VARCHAR(255) NOT NULL,
      senha VARCHAR(255) NOT NULL
    )`);

  //Categorias
  db.run(`CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    condicoes TEXT
  )`);



  //COmpetidores
  db.run(`CREATE TABLE IF NOT EXISTS competidores (
    id_competidores INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    id_categoria INTEGER,
    eliminado BOOLEAN DEFAULT 0,
    FOREIGN KEY(id_categoria) REFERENCES categoria(id_categoria)
  )`);
  // Campeonato
  db.run(`
    CREATE TABLE IF NOT EXISTS campeonato (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data DATE,
      categoria_id INTEGER,
      FOREIGN KEY (categoria_id) REFERENCES categoria(id_categoria)
    )
  `);

  // Rodada
  db.run(`
    CREATE TABLE IF NOT EXISTS rodada (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campeonato_id INTEGER NOT NULL,
      numero INTEGER NOT NULL,
      categoria_id INTEGER,
      FOREIGN KEY (campeonato_id) REFERENCES campeonato(id)
      FOREIGN KEY (categoria_id) REFERENCES categoria(id_categoria)
    )
  `);

  // Luta
  db.run(`
    CREATE TABLE IF NOT EXISTS luta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rodada_id INTEGER NOT NULL,
      competidor_esq_id INTEGER NOT NULL,
      competidor_dir_id INTEGER NOT NULL,
      FOREIGN KEY (rodada_id) REFERENCES rodada(id),
      FOREIGN KEY (competidor_esq_id) REFERENCES competidor(id_competidores),
      FOREIGN KEY (competidor_dir_id) REFERENCES competidor(id_competidores)
    )
  `);

  // Nota
  db.run(`
    CREATE TABLE IF NOT EXISTS nota (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      luta_id INTEGER,
      competidor_id INTEGER,
      valor FLOAT,
      tipo TEXT CHECK(tipo IN ('competidor', 'luta')),
      FOREIGN KEY (luta_id) REFERENCES luta(id),
      FOREIGN KEY (competidor_id) REFERENCES competidor(id_competidores)
    )
  `);

  // Punição
  db.run(`
    CREATE TABLE IF NOT EXISTS punicao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      luta_id INTEGER NOT NULL,
      competidor_id INTEGER NOT NULL,
      descricao TEXT,
      pontos_descontados REAL DEFAULT 0,
      FOREIGN KEY (luta_id) REFERENCES luta(id),
      FOREIGN KEY (competidor_id) REFERENCES competidor(id_competidores)
    )
  `);
  
  // armazenar competidores eliminados
  db.run(`
    CREATE TABLE IF NOT EXISTS eliminacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campeonato_id INTEGER NOT NULL,
      competidor_id INTEGER NOT NULL,
      motivo TEXT DEFAULT 'eliminacao',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      rodada_eliminacao INTEGER NOT NULL,
      FOREIGN KEY (campeonato_id) REFERENCES campeonato(id),
      FOREIGN KEY (competidor_id) REFERENCES competidores(id_competidores)
    )
  `);

  console.log("📌 Tabelas criadas/verificadas com sucesso!");
});

export default db;
