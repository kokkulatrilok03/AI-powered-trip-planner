'use client';

import type { PackingItem, PackingCategory } from '@/lib/types';
import { PACKING_CATEGORY_LABELS } from '@/lib/types';
import Card from '@/components/ui/Card';
import { CloudSun, Check } from 'lucide-react';

interface PackingListCardProps {
  items: PackingItem[];
  climateSummary?: string;
  onToggle: (index: number, checked: boolean) => Promise<void>;
}

const CATEGORY_ORDER: PackingCategory[] = [
  'documents',
  'activity_gear',
  'climate_wear',
  'essentials',
];

export default function PackingListCard({
  items,
  climateSummary,
  onToggle,
}: PackingListCardProps) {
  const checkedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: PACKING_CATEGORY_LABELS[category],
    items: items
      .map((item, index) => ({ ...item, index }))
      .filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <Card title="Weather-Aware Packing Assistant">
      {climateSummary && (
        <div className="mb-4 flex gap-2 rounded-lg bg-sky-50 px-3 py-2.5 text-sm text-sky-800">
          <CloudSun className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{climateSummary}</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{checkedCount} of {items.length} packed</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-5">
        {grouped.map((group) => (
          <div key={group.category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {group.label}
            </h4>
            <div className="space-y-2">
              {group.items.map((item) => (
                <label
                  key={item.index}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    item.checked
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => onToggle(item.index, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-medium ${
                        item.checked ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}
                    >
                      {item.item}
                    </span>
                    {item.reason && (
                      <p className="mt-0.5 text-xs text-gray-500">{item.reason}</p>
                    )}
                  </div>
                  {item.checked && (
                    <Check className="h-4 w-4 shrink-0 text-primary-500" />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            No packing suggestions yet
          </p>
        )}
      </div>
    </Card>
  );
}
