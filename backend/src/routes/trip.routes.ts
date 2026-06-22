import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.middleware';
import {
  generateTrip,
  getTrips,
  getTrip,
  updateTripHandler,
  deleteTripHandler,
  addActivityHandler,
  editActivityHandler,
  removeActivityHandler,
  togglePackingHandler,
  regenerateDayHandler,
} from '../controllers/trip.controller';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many AI requests. Please wait before trying again.' },
});

router.use(authenticate);

router.post('/generate', aiLimiter, generateTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTripHandler);
router.delete('/:id', deleteTripHandler);
router.post('/:id/activities', addActivityHandler);
router.put('/:id/activities', editActivityHandler);
router.delete('/:id/activities', removeActivityHandler);
router.patch('/:id/packing', togglePackingHandler);
router.post('/:id/regenerate-day', aiLimiter, regenerateDayHandler);

export default router;
