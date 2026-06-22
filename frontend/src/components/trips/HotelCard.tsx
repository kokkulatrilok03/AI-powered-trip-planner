import type { Hotel } from '@/lib/types';
import Card from '@/components/ui/Card';
import { Star, MapPin } from 'lucide-react';

interface HotelCardProps {
  hotels: Hotel[];
  currency?: string;
}

export default function HotelCard({ hotels, currency = 'USD' }: HotelCardProps) {
  return (
    <Card title="Hotel Suggestions">
      <div className="space-y-4">
        {hotels.map((hotel, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {hotel.location}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  {hotel.rating}
                </div>
                <p className="mt-1 text-sm font-medium text-primary-600">
                  {currency} {hotel.pricePerNight.toLocaleString()}/night
                </p>
              </div>
            </div>
            {hotel.amenities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {hotel.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {hotels.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No hotel suggestions</p>
        )}
      </div>
    </Card>
  );
}
