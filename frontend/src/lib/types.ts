export type BudgetTier = 'Low' | 'Medium' | 'High';

export type PackingCategory = 'documents' | 'activity_gear' | 'climate_wear' | 'essentials';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location?: string;
  estimatedCost?: number;
}

export interface DayItinerary {
  day: number;
  date?: string;
  activities: Activity[];
}

export interface CrowdPrediction {
  attraction: string;
  crowdLevel: 'low' | 'moderate' | 'high' | 'very_high';
  bestVisitingTime: string;
  suggestedDuration: string;
  tips?: string;
}

export interface Hotel {
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface PackingItem {
  item: string;
  category: PackingCategory;
  checked: boolean;
  reason?: string;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  durationDays: number;
  travelMonth: number;
  budgetTier: BudgetTier;
  interests: string[];
  climateSummary?: string;
  itinerary: DayItinerary[];
  estimatedBudget: BudgetBreakdown;
  hotels: Hotel[];
  packingList: PackingItem[];
  crowdPredictions?: CrowdPrediction[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripInput {
  destination: string;
  durationDays: number;
  travelMonth: number;
  budgetTier: BudgetTier;
  interests: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const PACKING_CATEGORY_LABELS: Record<PackingCategory, string> = {
  documents: 'Travel Documents',
  activity_gear: 'Activity-Specific Gear',
  climate_wear: 'Climate Wear',
  essentials: 'Essentials',
};
