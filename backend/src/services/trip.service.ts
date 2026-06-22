import { Trip } from '../models/Trip';
import { AppError } from '../middleware/error.middleware';
import { generateTripPlan, regenerateDay } from './gemini.service';
import {
  CreateTripInput,
  UpdateTripInput,
  AddActivityInput,
  EditActivityInput,
  RemoveActivityInput,
  TogglePackingInput,
  ITripDocument,
} from '../types/trip.types';

export const createTrip = async (
  userId: string,
  input: CreateTripInput
): Promise<ITripDocument> => {
  const generated = await generateTripPlan(input);

  const trip = await Trip.create({
    userId,
    destination: input.destination,
    durationDays: input.durationDays,
    travelMonth: input.travelMonth,
    budgetTier: input.budgetTier,
    interests: input.interests,
    climateSummary: generated.climateSummary,
    itinerary: generated.itinerary,
    estimatedBudget: generated.estimatedBudget,
    hotels: generated.hotels,
    packingList: generated.packingList,
    crowdPredictions: generated.crowdPredictions,
  });

  return trip;
};

export const getUserTrips = async (userId: string): Promise<ITripDocument[]> => {
  return Trip.find({ userId }).sort({ createdAt: -1 });
};

export const getTripById = async (
  tripId: string,
  userId: string
): Promise<ITripDocument> => {
  const trip = await Trip.findOne({ _id: tripId, userId });
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }
  return trip;
};

export const updateTrip = async (
  tripId: string,
  userId: string,
  input: UpdateTripInput
): Promise<ITripDocument> => {
  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, userId },
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  return trip;
};

export const deleteTrip = async (tripId: string, userId: string): Promise<void> => {
  const result = await Trip.deleteOne({ _id: tripId, userId });
  if (result.deletedCount === 0) {
    throw new AppError('Trip not found', 404);
  }
};

export const addActivity = async (
  tripId: string,
  userId: string,
  input: AddActivityInput
): Promise<ITripDocument> => {
  const trip = await getTripById(tripId, userId);

  if (input.day > trip.durationDays) {
    throw new AppError(`Day cannot exceed trip duration of ${trip.durationDays} days`, 400);
  }

  const dayIndex = trip.itinerary.findIndex((d) => d.day === input.day);
  if (dayIndex === -1) {
    trip.itinerary.push({ day: input.day, activities: [input.activity] });
  } else {
    trip.itinerary[dayIndex].activities.push(input.activity);
  }

  await trip.save();
  return trip;
};

export const editActivity = async (
  tripId: string,
  userId: string,
  input: EditActivityInput
): Promise<ITripDocument> => {
  const trip = await getTripById(tripId, userId);

  const dayIndex = trip.itinerary.findIndex((d) => d.day === input.day);
  if (dayIndex === -1) {
    throw new AppError('Day not found in itinerary', 404);
  }

  const activities = trip.itinerary[dayIndex].activities;
  if (input.activityIndex < 0 || input.activityIndex >= activities.length) {
    throw new AppError('Activity not found', 404);
  }

  activities[input.activityIndex] = input.activity;
  await trip.save();
  return trip;
};

export const removeActivity = async (
  tripId: string,
  userId: string,
  input: RemoveActivityInput
): Promise<ITripDocument> => {
  const trip = await getTripById(tripId, userId);

  const dayIndex = trip.itinerary.findIndex((d) => d.day === input.day);
  if (dayIndex === -1) {
    throw new AppError('Day not found in itinerary', 404);
  }

  const activities = trip.itinerary[dayIndex].activities;
  if (input.activityIndex < 0 || input.activityIndex >= activities.length) {
    throw new AppError('Activity not found', 404);
  }

  activities.splice(input.activityIndex, 1);
  await trip.save();
  return trip;
};

export const togglePackingItem = async (
  tripId: string,
  userId: string,
  input: TogglePackingInput
): Promise<ITripDocument> => {
  const trip = await getTripById(tripId, userId);

  if (input.index < 0 || input.index >= trip.packingList.length) {
    throw new AppError('Packing item not found', 404);
  }

  trip.packingList[input.index].checked = input.checked;
  await trip.save();
  return trip;
};

export const regenerateTripDay = async (
  tripId: string,
  userId: string,
  day: number
): Promise<ITripDocument> => {
  const trip = await getTripById(tripId, userId);

  if (day > trip.durationDays) {
    throw new AppError(`Day cannot exceed trip duration of ${trip.durationDays} days`, 400);
  }

  const { dayItinerary, crowdPredictions } = await regenerateDay(
    trip.destination,
    day,
    trip.budgetTier,
    trip.interests
  );

  const dayIndex = trip.itinerary.findIndex((d) => d.day === day);
  if (dayIndex === -1) {
    trip.itinerary.push(dayItinerary);
  } else {
    trip.itinerary[dayIndex] = dayItinerary;
  }

  const existingAttractions = new Set(
    trip.crowdPredictions?.map((p) => p.attraction) || []
  );
  for (const prediction of crowdPredictions) {
    if (!existingAttractions.has(prediction.attraction)) {
      trip.crowdPredictions = trip.crowdPredictions || [];
      trip.crowdPredictions.push(prediction);
    }
  }

  await trip.save();
  return trip;
};
