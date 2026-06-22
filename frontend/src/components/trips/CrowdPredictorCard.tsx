import type { CrowdPrediction } from '@/lib/types';
import Card from '@/components/ui/Card';
import { Users, Clock, Timer } from 'lucide-react';

interface CrowdPredictorCardProps {
  predictions: CrowdPrediction[];
}

const crowdColors = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' },
  moderate: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderate' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
  very_high: { bg: 'bg-red-100', text: 'text-red-700', label: 'Very High' },
};

export default function CrowdPredictorCard({ predictions }: CrowdPredictorCardProps) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <Card title="AI Crowd Predictor">
      <p className="mb-4 text-sm text-gray-500">
        Smart crowd analysis for each attraction — know when to visit for the best experience.
      </p>
      <div className="space-y-4">
        {predictions.map((prediction, index) => {
          const crowd = crowdColors[prediction.crowdLevel];
          return (
            <div
              key={index}
              className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900">{prediction.attraction}</h4>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${crowd.bg} ${crowd.text}`}
                >
                  <Users className="h-3 w-3" />
                  {crowd.label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-primary-500" />
                  <span>Best time: {prediction.bestVisitingTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Timer className="h-4 w-4 text-primary-500" />
                  <span>Duration: {prediction.suggestedDuration}</span>
                </div>
              </div>
              {prediction.tips && (
                <p className="mt-2 text-sm text-gray-500 italic">{prediction.tips}</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
