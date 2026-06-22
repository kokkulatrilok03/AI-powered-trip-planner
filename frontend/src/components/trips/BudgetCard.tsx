import type { BudgetBreakdown } from '@/lib/types';
import Card from '@/components/ui/Card';

interface BudgetCardProps {
  budget: BudgetBreakdown;
}

const categories = [
  { key: 'accommodation' as const, label: 'Accommodation', color: 'bg-blue-500' },
  { key: 'food' as const, label: 'Food', color: 'bg-green-500' },
  { key: 'transport' as const, label: 'Transport', color: 'bg-yellow-500' },
  { key: 'activities' as const, label: 'Activities', color: 'bg-purple-500' },
  { key: 'miscellaneous' as const, label: 'Miscellaneous', color: 'bg-gray-500' },
];

export default function BudgetCard({ budget }: BudgetCardProps) {
  return (
    <Card title="Budget Breakdown">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">Estimated Total</p>
        <p className="text-3xl font-bold text-primary-700">
          {budget.currency} {budget.total.toLocaleString()}
        </p>
      </div>

      <div className="space-y-3">
        {categories.map(({ key, label, color }) => {
          const amount = budget[key];
          const percentage = budget.total > 0 ? (amount / budget.total) * 100 : 0;
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">
                  {budget.currency} {amount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
