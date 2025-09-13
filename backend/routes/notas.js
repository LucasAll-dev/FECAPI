import express from 'express';
import { getNotas, createNota, getTotalLuta, getResultadoLuta  } from '../controllers/notas.js';

const router = express.Router();

router.get('/', getNotas);
router.post('/', createNota);
router.get('/luta/:luta_id/total', getTotalLuta);
router.get('/luta/:luta_id/resultado', getResultadoLuta);
//router.put('/:id', update);
//router.delete('/:id', remove);

export default router;
