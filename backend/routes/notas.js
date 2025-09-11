import express from 'express';
import { getNotas, createNota, getTotalLuta } from '../controllers/notas.js';

const router = express.Router();

router.get('/', getNotas);
router.post('/', createNota);
router.get('/luta/:luta_id/total', getTotalLuta);
//router.put('/:id', update);
//router.delete('/:id', remove);

export default router;
