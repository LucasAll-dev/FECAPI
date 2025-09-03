import express from "express";
import { 
  createCampeonato, 
  getCampeonatos, 
  getCampeonato, 
  updateCampeonato, 
  deleteCampeonato,
  executarEliminatoria
} from "../controllers/campeonato.js";

const router = express.Router();

router.post("/", createCampeonato);
router.get("/", getCampeonatos);
router.get("/:id", getCampeonato);
router.put("/:id", updateCampeonato);
router.delete("/:id", deleteCampeonato);
router.post("/:id/eliminatoria", executarEliminatoria);

export default router;