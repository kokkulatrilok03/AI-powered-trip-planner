'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TripForm from '@/components/trips/TripForm';
import TripCard from '@/components/trips/TripCard';
import { tripApi } from '@/lib/api';
import type { Trip } from '@/lib/types';
import { Map } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrips = useCallback(async () => {
    try {
      const { data } = await tripApi.getAll();
      setTrips(data.data);
      setError('');
    } catch {
      setError('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleTripCreated = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripApi.delete(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert('Failed to delete trip');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
        <p className="mt-2 text-gray-500">Plan, manage, and explore your travel adventures</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TripForm onSuccess={handleTripCreated} />
        </div>

        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : error ? (
            <p className="text-center text-red-600 py-20">{error}</p>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20">
              <Map className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-500">No trips yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Create your first AI-powered trip plan
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <TripCard key={trip._id} trip={trip} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
