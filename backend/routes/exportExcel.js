import express from 'express';
import { exportPlanilhaLutas } from '../controllers/exportExcel.js';

const router = express.Router();
router.get('/exportar-lutas', exportPlanilhaLutas);

export default router;