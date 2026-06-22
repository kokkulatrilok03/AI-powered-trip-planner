'use client';

import Link from 'next/link';
import type { Trip } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MapPin, Calendar, DollarSign, Trash2 } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

const budgetLabels: Record<string, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
};

export default function TripCard({ trip, onDelete }: TripCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{trip.destination}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {trip.durationDays} days
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {budgetLabels[trip.budgetTier] ?? trip.budgetTier}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {trip.estimatedBudget.currency} {trip.estimatedBudget.total.toLocaleString()}
            </span>
          </div>
          {trip.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {trip.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/trips/${trip._id}`}>
            <Button variant="primary" size="sm">
              View Trip
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(trip._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
