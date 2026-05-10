import express from 'express';
import { getDashboardStats, getDashboardHistory } from '../controllers/statsController';

const router = express.Router();

router.get('/overview', getDashboardStats);
router.get('/history', getDashboardHistory);

export default router;
