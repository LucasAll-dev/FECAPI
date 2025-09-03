import express from "express";
import cors from "cors";

//importes das rotas
import competidoresRoutes from './routes/competidores.js';
import categoriaRoutes from './routes/categoria.js';
import notasRoutes from './routes/notas.js';
import autenticarRoutes from './routes/autenticar.js';
import lutaRoutes from "./routes/luta.js";
import punicaoRoutes from "./routes/punicao.js";
import campeonatoRoutes from "./routes/campeonato.js";
import rodadaRoutes from "./routes/rodada.js";
import exportRoutes from "./routes/exportExcel.js"

//porta do servidor
const PORT = 3030;
const api = express();

api.use(express.json());
api.use(cors());

//rotas dos servicos
api.use('/competidores', competidoresRoutes);
api.use('/categoria', categoriaRoutes);
api.use('/notas', notasRoutes);
api.use('/autenticar', autenticarRoutes);
api.use('/rodada', rodadaRoutes);
api.use('/luta', lutaRoutes);
api.use('/campeonato',campeonatoRoutes);
api.use('/punicao', punicaoRoutes);
// rota de export do Excel
api.use('/export', exportRoutes);

// Inicia o servidor na porta 3030
api.listen(PORT, () => {
    console.log(`Servidor escutando em http://localhost:${PORT}`)
});