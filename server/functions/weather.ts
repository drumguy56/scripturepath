import { HttpError } from '../lib/records';

const CONDITIONS = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Freezing fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

// "America/Denver" -> "Denver"
function placeFromTimezone(timezone: string) {
  const segment = String(timezone || '').split('/').pop() || '';
  const name = segment.replace(/_/g, ' ').trim();
  if (!name || name === 'UTC') return 'Your area';
  return name;
}

export async function getWeather(_actor: unknown, body: Record<string, any>) {
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new HttpError(400, 'Valid coordinates are required');
  }

  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}` +
    '&current=temperature_2m,apparent_temperature,weather_code,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min' +
    '&forecast_days=1&temperature_unit=fahrenheit&timezone=auto';

  const forecastRes = await fetch(url, { signal: AbortSignal.timeout(10000) }).catch(() => null);
  if (!forecastRes || !forecastRes.ok) throw new HttpError(502, 'Weather is unavailable right now');

  const data: any = await forecastRes.json().catch(() => null);
  const current = data?.current;
  if (!current || typeof current.temperature_2m !== 'number') throw new HttpError(502, 'Weather is unavailable right now');

  const code = Number(current.weather_code);
  return {
    place: placeFromTimezone(data?.timezone),
    temperature: Math.round(current.temperature_2m),
    feels_like: Math.round(current.apparent_temperature),
    high: Math.round(data?.daily?.temperature_2m_max?.[0]),
    low: Math.round(data?.daily?.temperature_2m_min?.[0]),
    code,
    is_day: current.is_day === 1,
    condition: (CONDITIONS as Record<number, string>)[code] || 'Current conditions',
  };
}
