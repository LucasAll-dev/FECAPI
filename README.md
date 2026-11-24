# FECAPI

Aplicação desktop para gerenciar campeonatos de luta: cadastro de competidores e categorias, geração de chaveamento, rodadas, lançamento de notas e punições, classificação, exportação para Excel e súmula em PDF.

## Tecnologias

| Camada    | Stack |
|-----------|-------|
| Desktop   | Electron |
| Frontend  | React 19, React Router 7, Vite 7 |
| Backend   | Node.js, Express 5, SQLite3 |
| Outros    | bcryptjs (senhas), ExcelJS (planilhas), PDFKit (súmulas) |

## Estrutura

```
PROJETO-FECAPI/
├── main.js            # Processo principal do Electron
├── package.json       # Scripts que sobem backend + frontend + Electron juntos
├── backend/
│   ├── index.js       # Servidor Express (porta 3030)
│   ├── config/db.js   # Conexão e criação das tabelas SQLite
│   ├── data/          # database.sqlite
│   ├── controllers/   # Regras de negócio
│   └── routes/        # Rotas da API
└── frontend/
    └── src/
        ├── api/       # Cliente da API
        └── components/# Telas (login, campeonatos, categorias, competidores, notas...)
```

## Como rodar

Pré-requisito: Node.js 18+.

```powershell
npm install
cd backend; npm install; cd ..
cd frontend; npm install; cd ..
npm start
```

`npm start` sobe em paralelo:

- **Backend** em `http://localhost:3030` (com nodemon)
- **Frontend** em `http://localhost:5173` (Vite)
- **Electron**, abrindo a janela da aplicação

Também dá para rodar cada parte separada: `npm run backend`, `npm run frontend`, `npm run electron`.

## API

| Prefixo         | Descrição |
|-----------------|-----------|
| `/autenticar`   | `POST /register`, `POST /login` |
| `/competidores` | CRUD de competidores |
| `/categoria`    | CRUD de categorias |
| `/campeonato`   | CRUD, rodadas, chaveamento, eliminatória, lesionados, melhores perdedores, pontuação, classificação |
| `/rodada`       | Rodadas e suas lutas |
| `/luta`         | Lutas |
| `/notas`        | Notas por luta, total e resultado |
| `/punicao`      | Punições |
| `/export`       | `GET /exportar-lutas` (Excel) |
| `/sumula`       | `GET /sumula/:rodadaId` (PDF da rodada) |

## Banco de dados

SQLite em `backend/data/database.sqlite`. As tabelas são criadas automaticamente ao iniciar o backend: `usuarios`, `categoria`, `competidores`, `campeonato`, `rodada`, `luta`, `nota`, `punicao`, `eliminacao`, `historico_chaveamento`.
