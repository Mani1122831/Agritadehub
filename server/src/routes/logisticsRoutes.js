import express from 'express';
import { estimateLogistics, getHubs } from '../controllers/logisticsController.js';

const router = express.Router();

router.post('/estimate', estimateLogistics);
router.get('/hubs', getHubs);

export default router;
