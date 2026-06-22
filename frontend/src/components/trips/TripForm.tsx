'use client';

import { useState } from 'react';
import { tripApi } from '@/lib/api';
import type { BudgetTier } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sparkles } from 'lucide-react';

interface TripFormProps {
  onSuccess: (tripId: string) => void;
}

const INTEREST_OPTIONS = [
  'Culture', 'Food', 'Adventure', 'Nature', 'History',
  'Shopping', 'Nightlife', 'Photography', 'Beach', 'Art',
];

export default function TripForm({ onSuccess }: TripFormProps) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [travelMonth, setTravelMonth] = useState(new Date().getMonth() + 1);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await tripApi.generate({
        destination,
        durationDays,
        travelMonth,
        budgetTier,
        interests,
      });
      onSuccess(data.data._id);
      setDestination('');
      setDurationDays(5);
      setTravelMonth(new Date().getMonth() + 1);
      setBudgetTier('Medium');
      setInterests([]);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to generate trip. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Plan a New Trip">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Tokyo, Japan"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Travel Month
            </label>
            <select
              value={travelMonth}
              onChange={(e) => setTravelMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Budget Tier
            </label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  interests.includes(interest)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          <Sparkles className="h-4 w-4" />
          {isLoading ? 'Generating your trip (30-60s)...' : 'Generate AI Trip Plan'}
        </Button>
      </form>
    </Card>
  );
}
