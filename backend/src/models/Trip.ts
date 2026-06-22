import mongoose, { Schema } from 'mongoose';
import { ITripDocument } from '../types/trip.types';

const activitySchema = new Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    estimatedCost: { type: Number },
  },
  { _id: false }
);

const dayItinerarySchema = new Schema(
  {
    day: { type: Number, required: true },
    date: { type: String },
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false }
);

const crowdPredictionSchema = new Schema(
  {
    attraction: { type: String, required: true },
    crowdLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high'],
      required: true,
    },
    bestVisitingTime: { type: String, required: true },
    suggestedDuration: { type: String, required: true },
    tips: { type: String },
  },
  { _id: false }
);

const hotelSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    pricePerNight: { type: Number, required: true },
    location: { type: String, required: true },
    amenities: { type: [String], default: [] },
  },
  { _id: false }
);

const budgetBreakdownSchema = new Schema(
  {
    accommodation: { type: Number, required: true },
    food: { type: Number, required: true },
    transport: { type: Number, required: true },
    activities: { type: Number, required: true },
    miscellaneous: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const packingItemSchema = new Schema(
  {
    item: { type: String, required: true },
    category: {
      type: String,
      enum: ['documents', 'activity_gear', 'climate_wear', 'essentials'],
      required: true,
    },
    checked: { type: Boolean, default: false },
    reason: { type: String },
  },
  { _id: false }
);

const tripSchema = new Schema<ITripDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
      max: [30, 'Duration cannot exceed 30 days'],
    },
    travelMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    climateSummary: {
      type: String,
    },
    itinerary: {
      type: [dayItinerarySchema],
      default: [],
    },
    estimatedBudget: {
      type: budgetBreakdownSchema,
      required: true,
    },
    hotels: {
      type: [hotelSchema],
      default: [],
    },
    packingList: {
      type: [packingItemSchema],
      default: [],
    },
    crowdPredictions: {
      type: [crowdPredictionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

tripSchema.index({ userId: 1, createdAt: -1 });

export const Trip = mongoose.model<ITripDocument>('Trip', tripSchema);
