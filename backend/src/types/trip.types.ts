import { Document, Types } from 'mongoose';

export type BudgetTier = 'Low' | 'Medium' | 'High';

export type PackingCategory = 'documents' | 'activity_gear' | 'climate_wear' | 'essentials';

export interface IActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  estimatedCost?: number;
}

export interface IDayItinerary {
  day: number;
  date?: string;
  activities: IActivity[];
}

export interface ICrowdPrediction {
  attraction: string;
  crowdLevel: 'low' | 'moderate' | 'high' | 'very_high';
  bestVisitingTime: string;
  suggestedDuration: string;
  tips?: string;
}

export interface IHotel {
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
}

export interface IBudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface IPackingItem {
  item: string;
  category: PackingCategory;
  checked: boolean;
  reason?: string;
}

export interface ITrip {
  userId: Types.ObjectId;
  destination: string;
  durationDays: number;
  travelMonth: number;
  budgetTier: BudgetTier;
  interests: string[];
  climateSummary?: string;
  itinerary: IDayItinerary[];
  estimatedBudget: IBudgetBreakdown;
  hotels: IHotel[];
  packingList: IPackingItem[];
  crowdPredictions?: ICrowdPrediction[];
}

export interface ITripDocument extends ITrip, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTripInput {
  destination: string;
  durationDays: number;
  travelMonth: number;
  budgetTier: BudgetTier;
  interests: string[];
}

export interface UpdateTripInput {
  destination?: string;
  durationDays?: number;
  travelMonth?: number;
  budgetTier?: BudgetTier;
  interests?: string[];
  itinerary?: IDayItinerary[];
  estimatedBudget?: IBudgetBreakdown;
  hotels?: IHotel[];
  packingList?: IPackingItem[];
}

export interface RegenerateDayInput {
  day: number;
}

export interface AddActivityInput {
  day: number;
  activity: IActivity;
}

export interface EditActivityInput {
  day: number;
  activityIndex: number;
  activity: IActivity;
}

export interface RemoveActivityInput {
  day: number;
  activityIndex: number;
}

export interface TogglePackingInput {
  index: number;
  checked: boolean;
}

export interface GeneratedTripData {
  itinerary: IDayItinerary[];
  estimatedBudget: IBudgetBreakdown;
  hotels: IHotel[];
  packingList: IPackingItem[];
  crowdPredictions: ICrowdPrediction[];
}
