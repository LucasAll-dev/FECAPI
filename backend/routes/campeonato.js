import express from "express";
import { 
  createCampeonato, 
  getCampeonatos, 
  getCampeonato, 
  updateCampeonato, 
  deleteCampeonato,
  executarEliminatoria,
  gerarChaveamentoCampeonato,
  getRodadasByCampeonato,
  getLutasByRodada,
  finalizarRodada,
  getClassificacaoRodada
} from "../controllers/campeonato.js";

const router = express.Router();

router.post("/", createCampeonato);
router.get("/", getCampeonatos);

router.post("/:id/eliminatoria", executarEliminatoria);
router.post("/:id/gerar-chaveamento", gerarChaveamentoCampeonato);
router.get("/:id/rodadas", getRodadasByCampeonato);
router.get("/rodada/:id/lutas", getLutasByRodada);
router.post("/:id/finalizar-rodada", finalizarRodada);
router.get("/:campeonatoId/rodada/:rodadaId/classificacao", getClassificacaoRodada);

router.get("/:id", getCampeonato);
router.put("/:id", updateCampeonato);
router.delete("/:id", deleteCampeonato);

export default router;