import express from "express";
import { gerarSumulaRodada } from "../controllers/sumulaPdfRodada.js";

const router = express.Router();

// Rota para gerar súmula de uma rodada específica
router.get("/sumula/:rodadaId", gerarSumulaRodada);

export default router;