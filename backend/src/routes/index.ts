import { Router } from 'express';
import authRoutes from './auth.routes';
import tripRoutes from './trip.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'AI Travel Planner API is running' });
});

export default router;
