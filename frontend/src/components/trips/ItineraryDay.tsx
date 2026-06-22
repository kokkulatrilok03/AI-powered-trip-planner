'use client';

import { useState } from 'react';
import type { DayItinerary, Activity } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Clock, MapPin, Plus, Trash2, RefreshCw, Pencil, X } from 'lucide-react';

interface ItineraryDayProps {
  day: DayItinerary;
  currency?: string;
  onAddActivity: (day: number, activity: Activity) => Promise<void>;
  onEditActivity: (day: number, activityIndex: number, activity: Activity) => Promise<void>;
  onRemoveActivity: (day: number, activityIndex: number) => Promise<void>;
  onRegenerateDay: (day: number) => Promise<void>;
}

const emptyActivity = {
  time: '10:00',
  title: '',
  description: '',
  location: '',
  estimatedCost: undefined as number | undefined,
};

export default function ItineraryDay({
  day,
  currency = 'USD',
  onAddActivity,
  onEditActivity,
  onRemoveActivity,
  onRegenerateDay,
}: ItineraryDayProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const [newActivity, setNewActivity] = useState({ ...emptyActivity });
  const [editActivity, setEditActivity] = useState({ ...emptyActivity });

  const handleMutation = async (fn: () => Promise<void>) => {
    setMutationError('');
    try {
      await fn();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.';
      setMutationError(message);
    }
  };

  const handleAdd = () =>
    handleMutation(async () => {
      if (!newActivity.title.trim()) return;
      await onAddActivity(day.day, newActivity);
      setNewActivity({ ...emptyActivity });
      setShowAddForm(false);
    });

  const handleEdit = () =>
    handleMutation(async () => {
      if (editingIndex === null || !editActivity.title.trim()) return;
      await onEditActivity(day.day, editingIndex, editActivity);
      setEditingIndex(null);
    });

  const handleRemove = (index: number) => {
    if (!confirm('Remove this activity?')) return;
    handleMutation(() => onRemoveActivity(day.day, index));
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate this day? Current activities will be replaced.')) return;
    setIsRegenerating(true);
    setMutationError('');
    try {
      await onRegenerateDay(day.day);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to regenerate day.';
      setMutationError(message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const startEdit = (index: number, activity: Activity) => {
    setEditingIndex(index);
    setEditActivity({
      time: activity.time,
      title: activity.title,
      description: activity.description,
      location: activity.location || '',
      estimatedCost: activity.estimatedCost,
    });
    setShowAddForm(false);
  };

  const ActivityForm = ({
    values,
    onChange,
    onSave,
    onCancel,
    saveLabel,
  }: {
    values: typeof emptyActivity;
    onChange: (v: typeof emptyActivity) => void;
    onSave: () => void;
    onCancel: () => void;
    saveLabel: string;
  }) => (
    <div className="mb-4 space-y-3 rounded-lg bg-gray-50 p-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="time"
          value={values.time}
          onChange={(e) => onChange({ ...values, time: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Activity title"
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Location (optional)"
          value={values.location}
          onChange={(e) => onChange({ ...values, location: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Est. cost"
          value={values.estimatedCost ?? ''}
          onChange={(e) =>
            onChange({
              ...values,
              estimatedCost: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        placeholder="Description"
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}>{saveLabel}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Day {day.day}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(!showAddForm); setEditingIndex(null); }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRegenerate} isLoading={isRegenerating}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
        </div>
      </div>

      {mutationError && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutationError}</p>
      )}

      {showAddForm && (
        <ActivityForm
          values={newActivity}
          onChange={setNewActivity}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
          saveLabel="Save Activity"
        />
      )}

      <div className="space-y-3">
        {day.activities.map((activity, index) => (
          <div key={index}>
            {editingIndex === index ? (
              <ActivityForm
                values={editActivity}
                onChange={setEditActivity}
                onSave={handleEdit}
                onCancel={() => setEditingIndex(null)}
                saveLabel="Update Activity"
              />
            ) : (
              <div className="flex items-start justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <Clock className="h-4 w-4" />
                    {activity.time}
                    {activity.estimatedCost != null && (
                      <span className="text-gray-500">
                        · {currency} {activity.estimatedCost}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 font-medium text-gray-900">{activity.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                  {activity.location && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {activity.location}
                    </p>
                  )}
                </div>
                <div className="ml-2 flex gap-1">
                  <button
                    onClick={() => startEdit(index, activity)}
                    className="rounded p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                    aria-label="Edit activity"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {day.activities.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No activities planned</p>
        )}
      </div>
    </Card>
  );
}
