import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { getWeatherContext } from './weather.service';
import {
  CreateTripInput,
  GeneratedTripData,
  IDayItinerary,
  ICrowdPrediction,
  IPackingItem,
} from '../types/trip.types';

const MODEL_NAME = 'gemini-2.5-flash';
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return (
    message.includes('503') ||
    message.includes('429') ||
    message.includes('500') ||
    message.includes('unavailable') ||
    message.includes('rate') ||
    message.includes('quota') ||
    message.includes('overloaded')
  );
};

const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES - 1 && isRetryableError(lastError)) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`Gemini API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      } else if (attempt < MAX_RETRIES - 1) {
        throw lastError;
      }
    }
  }

  throw new AppError(
    `AI generation failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
    503
  );
};

const extractJson = (text: string): string => {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) return jsonMatch[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return text.trim();
};

const normalizePackingList = (items: unknown[]): IPackingItem[] => {
  return items.map((raw) => {
    if (typeof raw === 'string') {
      return { item: raw, category: 'essentials' as const, checked: false };
    }
    const item = raw as Partial<IPackingItem>;
    return {
      item: item.item ?? 'Unknown item',
      category: item.category ?? 'essentials',
      checked: false,
      reason: item.reason,
    };
  });
};

const buildTripPrompt = (input: CreateTripInput, climateContext: string): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return `You are an expert travel planner and packing specialist. Generate a complete travel plan as JSON only.

Destination: ${input.destination}
Duration: ${input.durationDays} days
Travel Month: ${monthNames[input.travelMonth - 1]}
Budget Tier: ${input.budgetTier} (Low = budget-friendly, Medium = mid-range, High = luxury)
Interests: ${input.interests.join(', ') || 'general sightseeing'}

CLIMATE CONTEXT (use for weather-aware packing):
${climateContext}

Return ONLY valid JSON with this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Location name",
          "estimatedCost": 25
        }
      ]
    }
  ],
  "estimatedBudget": {
    "accommodation": 500,
    "food": 300,
    "transport": 150,
    "activities": 200,
    "miscellaneous": 100,
    "total": 1250,
    "currency": "USD"
  },
  "hotels": [
    {
      "name": "Hotel name",
      "rating": 4.5,
      "pricePerNight": 120,
      "location": "Area name",
      "amenities": ["WiFi", "Pool"]
    }
  ],
  "packingList": [
    {
      "item": "Passport",
      "category": "documents",
      "reason": "Required for international travel"
    },
    {
      "item": "Hiking boots",
      "category": "activity_gear",
      "reason": "Day 2 includes mountain hiking"
    },
    {
      "item": "Light rain jacket",
      "category": "climate_wear",
      "reason": "Rainy season with avg 15°C lows"
    },
    {
      "item": "Universal adapter",
      "category": "essentials",
      "reason": "Electronics charging"
    }
  ],
  "crowdPredictions": [
    {
      "attraction": "Attraction name",
      "crowdLevel": "moderate",
      "bestVisitingTime": "Early morning 7-9 AM",
      "suggestedDuration": "2-3 hours",
      "tips": "Visit on weekdays to avoid crowds"
    }
  ]
}

Requirements:
- Create exactly ${input.durationDays} days in itinerary
- Suggest 3-5 hotels matching ${input.budgetTier} budget tier
- packingList: 12-18 items across ALL four categories (documents, activity_gear, climate_wear, essentials)
- Each packing item MUST include a "reason" tied to climate, activities, or destination
- climate_wear items MUST reflect the climate context above
- activity_gear items MUST match planned itinerary activities
- For crowdPredictions: analyze each major attraction in the itinerary
- crowdLevel must be one of: low, moderate, high, very_high
- Budget should reflect ${input.budgetTier} tier for ${input.destination}
- Return ONLY JSON, no markdown or explanation`;
};

const buildDayRegenerationPrompt = (
  destination: string,
  day: number,
  budgetTier: string,
  interests: string[]
): string => {
  return `Regenerate day ${day} itinerary for a trip to ${destination}.
Budget tier: ${budgetTier}
Interests: ${interests.join(', ')}

Return ONLY valid JSON:
{
  "day": ${day},
  "activities": [
    {
      "time": "09:00",
      "title": "Activity name",
      "description": "Description",
      "location": "Location",
      "estimatedCost": 25
    }
  ],
  "crowdPredictions": [
    {
      "attraction": "Attraction name",
      "crowdLevel": "moderate",
      "bestVisitingTime": "Early morning",
      "suggestedDuration": "2 hours",
      "tips": "Tip"
    }
  ]
}`;
};

export const generateTripPlan = async (
  input: CreateTripInput
): Promise<GeneratedTripData & { climateSummary: string }> => {
  const weather = await getWeatherContext(input.destination, input.travelMonth);

  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(buildTripPrompt(input, weather.summary));
    const text = result.response.text();
    const parsed = JSON.parse(extractJson(text)) as GeneratedTripData;

    if (!parsed.itinerary || !parsed.estimatedBudget) {
      throw new Error('Invalid response structure from Gemini');
    }

    return {
      itinerary: parsed.itinerary,
      estimatedBudget: parsed.estimatedBudget,
      hotels: parsed.hotels || [],
      packingList: normalizePackingList(parsed.packingList || []),
      crowdPredictions: parsed.crowdPredictions || [],
      climateSummary: weather.summary,
    };
  });
};

export const regenerateDay = async (
  destination: string,
  day: number,
  budgetTier: string,
  interests: string[]
): Promise<{ dayItinerary: IDayItinerary; crowdPredictions: ICrowdPrediction[] }> => {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(
      buildDayRegenerationPrompt(destination, day, budgetTier, interests)
    );
    const text = result.response.text();
    const parsed = JSON.parse(extractJson(text));

    return {
      dayItinerary: {
        day: parsed.day,
        activities: parsed.activities,
      },
      crowdPredictions: parsed.crowdPredictions || [],
    };
  });
};
