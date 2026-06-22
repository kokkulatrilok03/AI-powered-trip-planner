const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface GeoResult {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface WeatherContext {
  summary: string;
  season: string;
  avgHighC: number | null;
  avgLowC: number | null;
  avgPrecipitationMm: number | null;
}

const getSeason = (month: number, latitude: number): string => {
  const northern = latitude >= 0;
  if (month >= 3 && month <= 5) return northern ? 'Spring' : 'Autumn';
  if (month >= 6 && month <= 8) return northern ? 'Summer' : 'Winter';
  if (month >= 9 && month <= 11) return northern ? 'Autumn' : 'Spring';
  return northern ? 'Winter' : 'Summer';
};

const geocode = async (destination: string): Promise<GeoResult | null> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: GeoResult[] };
  return data.results?.[0] ?? null;
};

const fetchMonthlyClimate = async (
  latitude: number,
  longitude: number,
  month: number
): Promise<{ avgHighC: number; avgLowC: number; avgPrecipitationMm: number } | null> => {
  const year = new Date().getFullYear() - 1;
  const monthStr = String(month).padStart(2, '0');
  const daysInMonth = new Date(year, month, 0).getDate();
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${year}-${monthStr}-01&end_date=${year}-${monthStr}-${daysInMonth}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    daily?: {
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_sum?: number[];
    };
  };

  const highs = data.daily?.temperature_2m_max?.filter((v) => v != null) ?? [];
  const lows = data.daily?.temperature_2m_min?.filter((v) => v != null) ?? [];
  const precip = data.daily?.precipitation_sum?.filter((v) => v != null) ?? [];

  if (highs.length === 0 || lows.length === 0) return null;

  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

  return {
    avgHighC: Math.round(avg(highs)),
    avgLowC: Math.round(avg(lows)),
    avgPrecipitationMm: precip.length > 0 ? Math.round(avg(precip)) : 0,
  };
};

export const getWeatherContext = async (
  destination: string,
  travelMonth: number
): Promise<WeatherContext> => {
  const monthName = MONTH_NAMES[travelMonth - 1] ?? 'Unknown';

  try {
    const location = await geocode(destination);
    if (!location) {
      return {
        summary: `${destination} in ${monthName}: use typical regional seasonal climate for packing.`,
        season: 'Unknown',
        avgHighC: null,
        avgLowC: null,
        avgPrecipitationMm: null,
      };
    }

    const season = getSeason(travelMonth, location.latitude);
    const climate = await fetchMonthlyClimate(location.latitude, location.longitude, travelMonth);

    if (!climate) {
      return {
        summary: `${location.name}${location.country ? `, ${location.country}` : ''} in ${monthName} (${season}). Use typical ${season} climate for this region.`,
        season,
        avgHighC: null,
        avgLowC: null,
        avgPrecipitationMm: null,
      };
    }

    const rainNote =
      climate.avgPrecipitationMm > 3
        ? ' Expect rain — include waterproof gear.'
        : climate.avgPrecipitationMm > 1
          ? ' Occasional light rain possible.'
          : ' Generally dry conditions.';

    return {
      summary:
        `${location.name}${location.country ? `, ${location.country}` : ''} in ${monthName} (${season}): ` +
        `avg highs ${climate.avgHighC}°C, lows ${climate.avgLowC}°C, ~${climate.avgPrecipitationMm}mm daily rain.${rainNote}`,
      season,
      avgHighC: climate.avgHighC,
      avgLowC: climate.avgLowC,
      avgPrecipitationMm: climate.avgPrecipitationMm,
    };
  } catch {
    return {
      summary: `${destination} in ${monthName}: climate data unavailable — use general seasonal knowledge.`,
      season: 'Unknown',
      avgHighC: null,
      avgLowC: null,
      avgPrecipitationMm: null,
    };
  }
};
