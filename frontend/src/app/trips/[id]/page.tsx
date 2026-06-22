'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ItineraryDay from '@/components/trips/ItineraryDay';
import BudgetCard from '@/components/trips/BudgetCard';
import HotelCard from '@/components/trips/HotelCard';
import PackingListCard from '@/components/trips/PackingListCard';
import CrowdPredictorCard from '@/components/trips/CrowdPredictorCard';
import { tripApi } from '@/lib/api';
import type { Trip, Activity } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/types';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';

export default function TripDetailsPage() {
  return (
    <ProtectedRoute>
      <TripDetailsContent />
    </ProtectedRoute>
  );
}

function TripDetailsContent() {
  const params = useParams();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrip = useCallback(async () => {
    try {
      const { data } = await tripApi.getById(tripId);
      const tripData = data.data;
      // Support legacy trips with string-only packing lists
      if (tripData.packingList?.some((item) => typeof item === 'string')) {
        tripData.packingList = tripData.packingList.map((item) =>
          typeof item === 'string'
            ? { item, category: 'essentials' as const, checked: false }
            : item
        );
      }
      setTrip(tripData);
    } catch {
      setError('Trip not found or access denied');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const handleAddActivity = async (day: number, activity: Activity) => {
    const { data } = await tripApi.addActivity(tripId, day, activity);
    setTrip(data.data);
  };

  const handleEditActivity = async (day: number, activityIndex: number, activity: Activity) => {
    const { data } = await tripApi.editActivity(tripId, day, activityIndex, activity);
    setTrip(data.data);
  };

  const handleRemoveActivity = async (day: number, activityIndex: number) => {
    const { data } = await tripApi.removeActivity(tripId, day, activityIndex);
    setTrip(data.data);
  };

  const handleRegenerateDay = async (day: number) => {
    const { data } = await tripApi.regenerateDay(tripId, day);
    setTrip(data.data);
  };

  const handleTogglePacking = async (index: number, checked: boolean) => {
    const { data } = await tripApi.togglePackingItem(tripId, index, checked);
    setTrip(data.data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center">
        <p className="text-lg text-gray-500">{error || 'Trip not found'}</p>
        <Link href="/dashboard" className="mt-4 text-primary-600 hover:text-primary-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{trip.destination}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {trip.durationDays} days{trip.travelMonth ? ` · ${MONTH_NAMES[trip.travelMonth - 1]}` : ''}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {trip.budgetTier} budget
          </span>
        </div>
        {trip.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {trip.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
          {trip.itinerary.map((day) => (
            <ItineraryDay
              key={day.day}
              day={day}
              currency={trip.estimatedBudget.currency}
              onAddActivity={handleAddActivity}
              onEditActivity={handleEditActivity}
              onRemoveActivity={handleRemoveActivity}
              onRegenerateDay={handleRegenerateDay}
            />
          ))}
          <CrowdPredictorCard predictions={trip.crowdPredictions || []} />
        </div>

        <div className="space-y-6">
          <BudgetCard budget={trip.estimatedBudget} />
          <HotelCard hotels={trip.hotels} currency={trip.estimatedBudget.currency} />
          <PackingListCard
            items={trip.packingList}
            climateSummary={trip.climateSummary}
            onToggle={handleTogglePacking}
          />
        </div>
      </div>
    </div>
  );
}
