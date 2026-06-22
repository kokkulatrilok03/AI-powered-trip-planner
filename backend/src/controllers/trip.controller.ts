import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addActivity,
  editActivity,
  removeActivity,
  togglePackingItem,
  regenerateTripDay,
} from '../services/trip.service';

const getParamId = (id: string | string[]): string => {
  return Array.isArray(id) ? id[0] : id;
};

const budgetTierSchema = z.enum(['Low', 'Medium', 'High']);

const activitySchema = z.object({
  time: z.string(),
  title: z.string().min(1),
  description: z.string(),
  location: z.string().optional(),
  estimatedCost: z.number().optional(),
});

const packingItemSchema = z.object({
  item: z.string(),
  category: z.enum(['documents', 'activity_gear', 'climate_wear', 'essentials']),
  checked: z.boolean(),
  reason: z.string().optional(),
});

const createTripSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  durationDays: z.number().int().min(1).max(30),
  travelMonth: z.number().int().min(1).max(12),
  budgetTier: budgetTierSchema,
  interests: z.array(z.string()).default([]),
});

const updateTripSchema = z.object({
  destination: z.string().min(2).optional(),
  durationDays: z.number().int().min(1).max(30).optional(),
  travelMonth: z.number().int().min(1).max(12).optional(),
  budgetTier: budgetTierSchema.optional(),
  interests: z.array(z.string()).optional(),
  packingList: z.array(packingItemSchema).optional(),
});

const addActivitySchema = z.object({
  day: z.number().int().min(1),
  activity: activitySchema,
});

const editActivitySchema = z.object({
  day: z.number().int().min(1),
  activityIndex: z.number().int().min(0),
  activity: activitySchema,
});

const removeActivitySchema = z.object({
  day: z.number().int().min(1),
  activityIndex: z.number().int().min(0),
});

const regenerateDaySchema = z.object({
  day: z.number().int().min(1),
});

const togglePackingSchema = z.object({
  index: z.number().int().min(0),
  checked: z.boolean(),
});

export const generateTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = createTripSchema.parse(req.body);
    const trip = await createTrip(req.user!._id, input);
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trips = await getUserTrips(req.user!._id);
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
};

export const getTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trip = await getTripById(getParamId(req.params.id), req.user!._id);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const updateTripHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = updateTripSchema.parse(req.body);
    const trip = await updateTrip(getParamId(req.params.id), req.user!._id, input);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const deleteTripHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteTrip(getParamId(req.params.id), req.user!._id);
    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addActivityHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = addActivitySchema.parse(req.body);
    const trip = await addActivity(getParamId(req.params.id), req.user!._id, input);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const editActivityHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = editActivitySchema.parse(req.body);
    const trip = await editActivity(getParamId(req.params.id), req.user!._id, input);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const removeActivityHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = removeActivitySchema.parse(req.body);
    const trip = await removeActivity(getParamId(req.params.id), req.user!._id, input);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const togglePackingHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = togglePackingSchema.parse(req.body);
    const trip = await togglePackingItem(getParamId(req.params.id), req.user!._id, input);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const regenerateDayHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = regenerateDaySchema.parse(req.body);
    const trip = await regenerateTripDay(getParamId(req.params.id), req.user!._id, input.day);
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};
