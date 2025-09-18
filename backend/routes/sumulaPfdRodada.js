import express from "express";
import { gerarSumula } from "../controllers/sumulaPdfRodada.js";

const router = express.Router();

// Ex: /api/sumula/2 → gera súmula da rodada 2
router.get("/sumula/:rodadaId", gerarSumula);

export default router;
